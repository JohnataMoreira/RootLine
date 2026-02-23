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
        const formData = new FormData(e.currentTarget)
        const res = await uploadPhoto(formData)
        setResult(res)
        if (res.success) {
            setPreview(null)
            if (inputRef.current) inputRef.current.value = ''
        }
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Upload Photo</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Drop zone */}
                <label
                    htmlFor="photo-input"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                >
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400 text-sm">
                            <p className="text-2xl mb-1">📷</p>
                            <p>Click or drag photo here</p>
                            <p className="text-xs mt-0.5">JPEG, PNG, WebP, HEIC — max 10 MB</p>
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

                <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Date Taken (optional)</label>
                    <input
                        name="taken_at"
                        type="date"
                        className="w-full rounded-md px-3 py-1.5 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !preview}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 transition-colors font-medium text-sm"
                >
                    {loading ? 'Uploading...' : 'Upload Photo'}
                </button>

                {result?.error && (
                    <p className="p-3 bg-red-50 text-red-800 border border-red-200 text-sm rounded-md">{result.error}</p>
                )}
                {result?.success && (
                    <p className="p-3 bg-green-50 text-green-800 border border-green-200 text-sm rounded-md">✅ Photo uploaded successfully!</p>
                )}
            </form>
        </div>
    )
}
