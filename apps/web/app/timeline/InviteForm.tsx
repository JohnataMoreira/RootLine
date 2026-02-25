'use client'

import { useState } from 'react'
import { sendInvite } from './actions'

export function InviteForm() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean, message?: string, inviteLink?: string, error?: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const response = await sendInvite(formData)
        setResult(response)
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Invite Family Member</h3>
            <form action={handleSubmit} className="flex flex-col gap-3">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="relative@example.com"
                        required
                        className="w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                    <select
                        name="role"
                        className="w-full rounded-md px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="contributor">Contributor (Can add photos/members)</option>
                        <option value="viewer">Viewer (Read-only)</option>
                        <option value="admin">Admin (Full Control)</option>
                    </select>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-4 py-2 transition-colors font-medium mt-2"
                >
                    {loading ? 'Processing...' : 'Send Invitation'}
                </button>

                {result?.error && (
                    <p className="mt-2 p-3 bg-red-50 text-red-900 border border-red-200 text-sm rounded-md">
                        {result.error}
                    </p>
                )}

                {result?.success && (
                    <div className="mt-2 p-3 bg-green-50 text-green-900 border border-green-200 text-sm rounded-md shadow-inner space-y-2">
                        <p><strong>Success!</strong> {result.message}</p>
                        <div className="bg-white p-2 rounded border border-green-100 break-all">
                            <span className="font-mono text-xs">{result.inviteLink}</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">Copy this link to test Task 2.3 later.</p>
                    </div>
                )}
            </form>
        </div>
    )
}
