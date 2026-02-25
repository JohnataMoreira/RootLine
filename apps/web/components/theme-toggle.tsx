"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors">
                <span className="material-symbols-outlined text-slate-400">sleep</span>
            </button>
        )
    }

    const toggleTheme = () => {
        if (theme === 'dark') setTheme('light')
        else if (theme === 'light') setTheme('system')
        else setTheme('dark')
    }

    const getIcon = () => {
        if (theme === 'dark') return 'dark_mode'
        if (theme === 'light') return 'light_mode'
        return 'brightness_auto'
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-2 text-text transition-colors"
            title={`Alternar Tema (Atual: ${theme})`}
        >
            <span className="material-symbols-outlined">
                {getIcon()}
            </span>
        </button>
    )
}
