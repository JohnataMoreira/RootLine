'use client'

import { useFormStatus } from 'react-dom'
import { ReactNode } from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pendingText?: string
    children: ReactNode
}

export function SubmitButton({ children, pendingText = 'Carregando...', className, ...props }: Props) {
    const { pending } = useFormStatus()

    return (
        <button
            {...props}
            disabled={pending || props.disabled}
            className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {pending ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    {pendingText}
                </span>
            ) : (
                children
            )}
        </button>
    )
}
