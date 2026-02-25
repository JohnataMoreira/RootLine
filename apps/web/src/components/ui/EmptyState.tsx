import React from 'react'

type EmptyStateProps = {
    icon: string
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
    return (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center mt-8 flex flex-col items-center justify-center min-h-[320px] shadow-xl shadow-blue-900/5 relative overflow-hidden group">
            {/* Decorative Background for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white/20 pointer-events-none" />

            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl scale-150 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="size-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500">
                    <span className="material-symbols-outlined text-4xl text-blue-600 font-light">{icon}</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight relative z-10">{title}</h3>
            <p className="text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed text-sm font-medium relative z-10">
                {description}
            </p>

            {(actionLabel && actionHref) && (
                <a
                    href={actionHref}
                    className="mt-8 relative z-10 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                    {actionLabel}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
            )}

            {(actionLabel && onAction) && (
                <button
                    onClick={onAction}
                    className="mt-8 relative z-10 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
                >
                    {actionLabel}
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
            )}
        </div>
    )
}
