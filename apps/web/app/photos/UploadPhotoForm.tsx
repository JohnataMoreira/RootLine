'use client'

import { useRef, useState, useEffect } from 'react'
import { uploadPhoto } from './actions'
import { createClient } from '@/utils/supabase/client'

export function UploadPhotoForm() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [takenAt, setTakenAt] = useState('')
    const [result, setResult] = useState<{ success?: boolean; error?: string; photoId?: string } | null>(null)
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Listen for AI analysis completion in real-time
    useEffect(() => {
        if (!result?.photoId || !result?.success) return

        setIsThinking(true)
        const channel = supabase
            .channel(`ai-analysis-${result.photoId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'photo_analysis',
                    filter: `photo_id=eq.${result.photoId}`
                },
                (payload: { new: any }) => {
                    const analysis = payload.new
                    if (analysis.visual_description) {
                        setAiSuggestion(analysis.visual_description)
                        setIsThinking(false)
                    }
                }
            )
            .subscribe()

        // Fallback: search if it was already processed before subscription
        const checkExisting = async () => {
            const { data } = await supabase
                .from('photo_analysis')
                .select('visual_description')
                .eq('photo_id', result.photoId)
                .single()

            if (data?.visual_description) {
                setAiSuggestion(data.visual_description)
                setIsThinking(false)
            }
        }
        checkExisting()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [result?.photoId, result?.success, supabase])

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) { setPreview(null); return }

        if (file.size > 15 * 1024 * 1024) {
            setResult({ error: 'Foto muito grande! O limite é 15MB.' })
            setPreview(null)
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
        if (!validTypes.includes(file.type) && file.type !== '') {
            setResult({ error: 'Formato não suportado. Use JPEG, PNG ou WebP.' })
            setPreview(null)
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        setPreview(URL.createObjectURL(file))
        setResult(null)
        setAiSuggestion(null)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        setAiSuggestion(null)

        const timeoutPromise = new Promise<{ error: string }>((_, reject) =>
            setTimeout(() => reject(new Error('Puxa, o envio demorou demais. Tente uma foto menor ou com melhor conexão.')), 60000)
        )

        try {
            const formData = new FormData(e.currentTarget)
            const res = await Promise.race([
                uploadPhoto(formData),
                timeoutPromise
            ]) as { success?: boolean; error?: string; photoId?: string }

            setResult(res)
            // Note: We DON'T clear the preview immediately so the user can see the AI suggestion pop up
        } catch (error: any) {
            console.error('Photo upload failed:', error)
            setResult({ error: error.message || 'Ocorreu um erro inesperado ao enviar a foto.' })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setPreview(null)
        setCaption('')
        setTakenAt('')
        setResult(null)
        setAiSuggestion(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl point-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">add_photo_alternate</span>
                    Eternizar Memória
                </h3>
                {preview && !loading && (
                    <button onClick={resetForm} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                        Cancelar
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                <label
                    htmlFor="photo-input"
                    className={`flex flex-col items-center justify-center w-full transition-all duration-500 ease-out cursor-pointer group ${preview
                        ? 'bg-slate-50 border-0 p-3 pb-4 rounded-xl shadow-inner'
                        : 'h-40 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 rounded-2xl'
                        }`}
                >
                    {preview ? (
                        <div className="w-full h-auto aspect-[4/5] bg-white rounded-lg shadow-md p-3 pb-12 flex flex-col relative transform group-hover:scale-[1.01] transition-transform duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded bg-slate-100" />

                            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center px-4">
                                <p className="font-serif italic text-slate-800 text-lg leading-tight line-clamp-1 truncate text-center w-full">
                                    {caption || <span className="text-slate-300">Sua legenda aparecerá aqui...</span>}
                                </p>
                            </div>

                            {/* AI Thinking Overlay */}
                            {isThinking && (
                                <div className="absolute inset-x-3 top-3 bottom-12 bg-black/5 flex flex-col items-center justify-center backdrop-blur-[2px] rounded animate-in fade-in duration-500">
                                    <div className="flex gap-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-blue-700">IA analisando...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 text-sm p-4 relative z-10">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 group-hover:text-blue-500 transition-colors transform group-hover:-translate-y-1 duration-300">add_a_photo</span>
                            <p className="font-bold text-slate-600 transition-colors group-hover:text-slate-800">Clique ou arraste a foto aqui</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">JPEG, PNG, WebP — máx 15 MB</p>
                        </div>
                    )}
                </label>
                <input
                    ref={inputRef}
                    id="photo-input"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                    disabled={loading || !!result?.success}
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">Legenda (Opcional)</label>
                        <textarea
                            name="description"
                            placeholder="O que está acontecendo nesta foto?"
                            rows={2}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            disabled={loading || !!result?.success && !aiSuggestion}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 hover:bg-white font-medium text-slate-900 shadow-sm resize-none transition-colors"
                        />

                        {/* AI Suggestion Tooltip */}
                        {aiSuggestion && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-blue-600 text-[16px]">auto_awesome</span>
                                    <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Sugestão da IA</span>
                                </div>
                                <p className="text-[12px] text-blue-900 italic font-medium leading-relaxed">"{aiSuggestion}"</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCaption(aiSuggestion)
                                        setAiSuggestion(null)
                                    }}
                                    className="w-fit bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Usar Sugestão ✨
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="sm:w-1/3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">Data (Opcional)</label>
                        <input
                            name="taken_at"
                            type="date"
                            value={takenAt}
                            onChange={(e) => setTakenAt(e.target.value)}
                            disabled={loading || !!result?.success}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 hover:bg-white font-medium text-slate-900 shadow-sm h-[42px] transition-colors"
                        />
                    </div>
                </div>

                {!result?.success ? (
                    <button
                        type="submit"
                        disabled={loading || !preview}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white rounded-xl px-4 py-3.5 transition-all font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                        <span className="material-symbols-outlined text-[18px] relative z-10">{loading ? 'sync' : 'cloud_upload'}</span>
                        <span className="relative z-10">{loading ? 'Eternizando...' : 'Enviar Memória'}</span>
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-900 border border-green-100 text-xs rounded-xl font-medium">
                            <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                            <p>Memória enviada! {aiSuggestion ? 'A IA sugeriu uma legenda acima.' : (isThinking ? 'Aguardando análise da IA...' : '')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full bg-slate-900 text-white rounded-xl px-4 py-3.5 font-bold text-sm shadow-lg active:scale-95 transition-all"
                        >
                            Enviar Outra Foto
                        </button>
                    </div>
                )}

                {result?.error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 text-red-900 border border-red-100 text-xs rounded-xl font-medium leading-relaxed">
                        <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                        <p>{result.error}</p>
                    </div>
                )}
            </form>
        </div>
    )
}
