'use client'

import { useState } from 'react'
import { sendInvite } from '@/app/timeline/actions'

type InviteResult = {
    success?: boolean
    message?: string
    inviteLink?: string
    error?: string
}

export function InviteModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<InviteResult | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setResult(null)
        const response = await sendInvite(formData)
        setResult(response)
        setLoading(false)
    }

    function handleClose() {
        setOpen(false)
        setResult(null)
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                data-testid="invite-open"
                onClick={() => setOpen(true)}
                className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 active:opacity-80"
            >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Convidar Familiares
            </button>

            {/* Modal Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <div
                        data-testid="invite-modal"
                        className="w-full max-w-md bg-bg rounded-t-2xl border-t border-border shadow-2xl p-6 animate-in slide-in-from-bottom duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">group_add</span>
                                <h2 className="text-lg font-bold text-text">Convidar Familiar</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 hover:bg-border transition-colors"
                                aria-label="Fechar"
                            >
                                <span className="material-symbols-outlined text-[18px] text-muted-foreground">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form action={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-text block mb-1.5">
                                    Email do convidado
                                </label>
                                <input
                                    data-testid="invite-email"
                                    name="email"
                                    type="email"
                                    placeholder="familiar@exemplo.com"
                                    required
                                    className="w-full bg-surface border border-border text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text block mb-1.5">
                                    Papel na família
                                </label>
                                <select
                                    name="role"
                                    className="w-full bg-surface border border-border text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                >
                                    <option value="contributor">Colaborador — pode adicionar fotos e membros</option>
                                    <option value="viewer">Visualizador — somente leitura</option>
                                    <option value="admin">Admin — controle total</option>
                                </select>
                            </div>

                            <button
                                data-testid="invite-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-1 active:scale-95 active:opacity-80"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Gerando convite…
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Gerar convite
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Error State */}
                        {result?.error && (
                            <div
                                data-testid="invite-error"
                                className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl"
                            >
                                <span className="font-semibold">Erro: </span>{result.error}
                            </div>
                        )}

                        {/* Success State */}
                        {result?.success && result.inviteLink && (
                            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
                                <p className="text-sm font-semibold text-text flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                    Convite gerado com sucesso!
                                </p>
                                <p className="text-xs text-muted-foreground">{result.message}</p>
                                <div className="bg-surface border border-border rounded-lg px-3 py-2">
                                    <a
                                        data-testid="invite-link"
                                        href={result.inviteLink}
                                        className="font-mono text-xs text-primary break-all hover:underline"
                                    >
                                        {result.inviteLink}
                                    </a>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(result.inviteLink!)}
                                    className="w-full border border-border hover:bg-surface-2 text-text text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    Copiar link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
