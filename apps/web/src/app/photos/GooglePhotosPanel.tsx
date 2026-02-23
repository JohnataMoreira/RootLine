'use client'

import { useState } from 'react'
import { importFromGooglePhotos } from './google-import'

type GoogleStatus = 'idle' | 'importing' | 'done' | 'error'

export function GooglePhotosPanel({
    isConnected,
    lastRun
}: {
    isConnected: boolean,
    lastRun?: {
        status: string,
        imported_count: number,
        skipped_count: number,
        finished_at: string | null,
        error_message?: string
    } | null
}) {
    const [status, setStatus] = useState<GoogleStatus>('idle')
    const [result, setResult] = useState<{ imported?: number; skipped?: number; error?: string } | null>(null)

    async function handleImport() {
        setStatus('importing')
        setResult(null)
        const res = await importFromGooglePhotos()
        if (res.error) {
            setResult({ error: res.error })
            setStatus('error')
        } else {
            setResult({ imported: res.imported, skipped: res.skipped })
            setStatus('done')
        }
    }

    if (!isConnected) {
        return (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Google Photos</h3>
                <p className="text-sm text-gray-500 mb-4">Import thumbnails from your Google Photos library (no full-res downloaded).</p>
                <a
                    href="/api/google/connect"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors font-medium text-sm"
                >
                    🔗 Connect Google Photos
                </a>
            </div>
        )
    }

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Google Photos</h3>
            <p className="text-sm text-gray-500 mb-3">
                ✅ Connected. Incremental sync is active.
            </p>

            <div className="mb-4 bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Sync Status</p>
                {lastRun ? (
                    <>
                        <p>
                            <span className="text-gray-400">Status:</span>{' '}
                            <span className={`capitalize ${lastRun.status === 'success' ? 'text-green-600' : lastRun.status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                                {lastRun.status}
                            </span>
                        </p>
                        <p><span className="text-gray-400">Imported:</span> {lastRun.imported_count}</p>
                        <p><span className="text-gray-400">Last Run:</span> {lastRun.finished_at ? new Date(lastRun.finished_at).toLocaleString() : 'Running...'}</p>
                        {lastRun.error_message && <p className="text-red-500 mt-1 italic">&quot;{lastRun.error_message}&quot;</p>}
                    </>
                ) : (
                    <p className="text-gray-400 italic">No sync records found yet.</p>
                )}
            </div>

            <button
                onClick={handleImport}
                disabled={status === 'importing'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-4 py-2 transition-colors font-medium text-sm"
            >
                {status === 'importing' ? '⏳ Importing...' : '⬇️ Run Sync Now'}
            </button>

            {status === 'done' && result && (
                <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-md">
                    ✅ Success! <strong>{result.imported}</strong> imported.
                </p>
            )}

            {status === 'error' && result?.error && (
                <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md">
                    ⚠️ {result.error}
                </p>
            )}

            <a href="/api/google/connect" className="block mt-3 text-xs text-center text-blue-500 hover:underline">
                Update connection / logout
            </a>
        </div>
    )
}
