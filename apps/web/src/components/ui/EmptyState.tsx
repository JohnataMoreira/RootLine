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
        <div className="bg-white p-10 rounded-2xl border border-slate-200 border-dashed text-center mt-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <span className="material-symbols-outlined text-5xl text-primary/80 mb-4">{icon}</span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-slate-600 mt-3 max-w-xs mx-auto leading-relaxed text-sm font-medium">
                {description}
            </p>

            {(actionLabel && actionHref) && (
                <a
                    href={actionHref}
                    className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                    {actionLabel}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
            )}

            {(actionLabel && onAction) && (
                <button
                    onClick={onAction}
                    className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                    {actionLabel}
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
            )}
        </div>
    )
}
