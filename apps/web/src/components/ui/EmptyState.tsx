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
        <div className="bg-surface-2/50 p-10 rounded-2xl border border-border border-dashed text-center mt-8 flex flex-col items-center justify-center min-h-[300px]">
            <span className="material-symbols-outlined text-5xl text-muted-foreground/60 mb-4">{icon}</span>
            <h3 className="text-xl font-extrabold text-text tracking-tight">{title}</h3>
            <p className="text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed text-sm">
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
