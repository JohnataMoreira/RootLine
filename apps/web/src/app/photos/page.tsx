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
        .single()

    const isGoogleConnected = !!googleToken

    // Fetch last sync run
    const { data: lastRun } = await supabase
        .from('google_sync_runs')
        .select('*')
        .eq('family_id', familyId)
        .eq('profile_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

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
                        <h1 className="text-2xl font-bold text-gray-900">{familyName} — Photos</h1>
                        <FamilySwitcher activeFamilyId={familyId} families={allFamilies} />
                        <p className="text-sm text-gray-500 mt-0.5">{photosWithUrls.length} photos in this archive</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/families" className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors">
                            Minha Conta
                        </a>
                        <a href="/timeline" className="text-sm text-blue-600 hover:underline">← Back</a>
                    </div>
                </div>

                {/* Feedback banners from Google OAuth */}
                {searchParams.google_connected && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">
                        ✅ Google Photos connected successfully! You can now import your library.
                    </div>
                )}
                {searchParams.google_error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
                        ⚠️ Google Photos error: {searchParams.google_error.replace(/_/g, ' ')}
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
                            <div className="flex items-center justify-center h-48 bg-red-50 rounded-xl border border-red-200">
                                <p className="text-red-700 text-sm">⚠️ Failed to load photos.</p>
                            </div>
                        ) : photosWithUrls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 border-dashed">
                                <p className="text-4xl mb-3">📷</p>
                                <p className="text-gray-700 font-medium">No photos yet</p>
                                <p className="text-sm text-gray-400 mt-1">Upload or import from Google Photos to get started.</p>
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
