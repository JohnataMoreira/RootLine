"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

    return (
        <>
            <div className="h-24"></div> {/* Spacer to prevent content from hiding behind the absolute nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-md border-t border-border px-6 py-3 pb-6 z-50">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-primary' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                        <span className={`text-[10px] ${isActive('/profile') ? 'font-bold' : 'font-medium'}`}>Perfil</span>
                    </Link>
                    <Link href="/tree" className={`flex flex-col items-center gap-1 ${isActive('/tree') ? 'text-primary' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/tree') ? "'FILL' 1" : "'FILL' 0" }}>account_tree</span>
                        <span className={`text-[10px] ${isActive('/tree') ? 'font-bold' : 'font-medium'}`}>Árvore</span>
                    </Link>
                    <Link href="/timeline" className={`flex flex-col items-center gap-1 ${isActive('/timeline') ? 'text-primary' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/timeline') ? "'FILL' 1" : "'FILL' 0" }}>auto_awesome_motion</span>
                        <span className={`text-[10px] ${isActive('/timeline') ? 'font-bold' : 'font-medium'}`}>Memórias</span>
                    </Link>
                </div>
            </nav>
        </>
    )
}
