'use client'

import { useRef, useState } from 'react'
import { uploadPhoto } from './actions'

export function UploadPhotoForm() {
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) { setPreview(null); return }
        setPreview(URL.createObjectURL(file))
        setResult(null)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        // Timeout to prevent infinite loading
        const timeoutPromise = new Promise<{ error: string }>((_, reject) =>
            setTimeout(() => reject(new Error('Puxa, o envio demorou demais. Tente uma foto menor ou com melhor conexão.')), 15000)
        )

        try {
            const formData = new FormData(e.currentTarget)

            // Race the upload against the timeout
            const res = await Promise.race([
                uploadPhoto(formData),
                timeoutPromise
            ]) as { success?: boolean; error?: string }

            setResult(res)
            if (res.success) {
                setPreview(null)
                if (inputRef.current) inputRef.current.value = ''
            }
        } catch (error: any) {
            console.error('Photo upload failed:', error)
            setResult({ error: error.message || 'Ocorreu um erro inesperado ao enviar a foto.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4 tracking-tight">Enviar Foto</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Drop zone */}
                <label
                    htmlFor="photo-input"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all overflow-hidden bg-slate-50/30 group"
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-center text-slate-400 text-sm p-4">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 group-hover:text-blue-500 transition-colors">add_a_photo</span>
                            <p className="font-bold text-slate-600">Clique ou arraste a foto aqui</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">JPEG, PNG, WebP, HEIC — máx 10 MB</p>
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
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">Legenda (Opcional)</label>
                        <textarea
                            name="description"
                            placeholder="O que está acontecendo nesta foto?"
                            rows={2}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-900 shadow-sm resize-none"
                        />
                    </div>
                    <div className="sm:w-1/3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">Data (Opcional)</label>
                        <input
                            name="taken_at"
                            type="date"
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-900 shadow-sm h-[42px]"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !preview}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white rounded-xl px-4 py-3.5 transition-all font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">{loading ? 'sync' : 'cloud_upload'}</span>
                    {loading ? 'Enviando...' : 'Enviar Foto'}
                </button>

                {result?.error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 text-red-900 border border-red-100 text-xs rounded-xl font-medium leading-relaxed">
                        <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                        <p>{result.error}</p>
                    </div>
                )}
                {result?.success && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 text-green-900 border border-green-100 text-xs rounded-xl font-medium animate-in zoom-in-95">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <p>Foto enviada com sucesso!</p>
                    </div>
                )}
            </form>
        </div>
    )
}
