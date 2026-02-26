import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UploadPhotoForm } from './UploadPhotoForm'
import { PhotoGrid } from './PhotoGrid'
import { GooglePhotosPanel } from './GooglePhotosPanel'
import { getActiveFamily } from '@/utils/active-family'
import { FamilySwitcher } from '@/components/FamilySwitcher'

type Photo = {
    id: string
    storage_path: string
    thumbnail_path: string | null
    original_filename: string | null
    taken_at: string | null
    size_bytes: number | null
}

export default async function PhotosPage(props: {
    searchParams: Promise<{ google_connected?: string; google_error?: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { familyId, familyName, role, allFamilies } = await getActiveFamily(supabase)

    const canUpload = ['admin', 'contributor'].includes(role)

    // Check Google Photos connection status
    const { data: googleToken } = await supabase
        .from('google_photo_tokens')
        .select('profile_id')
        .eq('profile_id', user.id)
        .maybeSingle()

    const isGoogleConnected = !!googleToken

    // Fetch last sync run
    const { data: lastRun } = await supabase
        .from('google_sync_runs')
        .select('*')
        .eq('family_id', familyId)
        .eq('profile_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    const { data: photos, error } = await supabase
        .from('photos')
        .select('id, storage_path, thumbnail_path, original_filename, taken_at, size_bytes, source')
        .eq('family_id', familyId)
        .eq('is_deleted', false)
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(200)

    // Generate signed URLs for manual uploads; use thumbnail_path for Google Photos
    const photosWithUrls = await Promise.all(
        (photos ?? []).map(async (photo: Photo & { source?: string }) => {
            if (photo.source === 'google_photos') {
                // thumbnail_path is the Google baseUrl with size suffix — no signing needed
                return { ...photo, signedUrl: photo.thumbnail_path ?? '' }
            }
            const srcPath = photo.thumbnail_path ?? photo.storage_path
            const { data } = await supabase.storage
                .from('family-photos')
                .createSignedUrl(srcPath, 3600)
            return { ...photo, signedUrl: data?.signedUrl ?? '' }
        })
    )

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{familyName} — Fotos</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <FamilySwitcher activeFamilyId={familyId} families={allFamilies} />
                            <span className="text-xs text-slate-400 font-medium">• {photosWithUrls.length} fotos neste arquivo</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/profile" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                            Minha Conta
                        </a>
                        <a href="/timeline" className="text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                            Voltar
                        </a>
                    </div>
                </div>

                {/* Feedback banners from Google OAuth */}
                {searchParams.google_connected && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Google Photos conectado com sucesso! Agora você pode importar suas memórias.
                    </div>
                )}
                {searchParams.google_error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        Erro no Google Photos: {searchParams.google_error.replace(/_/g, ' ')}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left sidebar */}
                    {canUpload && (
                        <div className="lg:col-span-1 space-y-4">
                            <UploadPhotoForm />
                            <GooglePhotosPanel isConnected={isGoogleConnected} lastRun={lastRun} />
                        </div>
                    )}

                    {/* Photo grid */}
                    <div className={canUpload ? 'lg:col-span-3' : 'lg:col-span-4'}>
                        {error ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-100 text-center">
                                <span className="material-symbols-outlined text-4xl text-red-300 mb-2">cloud_off</span>
                                <p className="text-red-900 font-bold">Falha ao carregar fotos</p>
                                <p className="text-red-600 text-xs mt-1">Tente atualizar a página ou verifique sua conexão.</p>
                            </div>
                        ) : photosWithUrls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">photo_library</span>
                                <p className="text-slate-900 font-black text-lg">Nenhuma foto ainda</p>
                                <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">Faça upload ou importe do Google Photos para começar a construir o legado da sua família.</p>
                            </div>
                        ) : (
                            <PhotoGrid photos={photosWithUrls} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
