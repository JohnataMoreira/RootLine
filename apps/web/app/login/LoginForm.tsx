'use client'

import { useState, useTransition } from 'react'
import { login, signup } from './actions'
import { Loader2 } from 'lucide-react'

export function LoginForm({ message }: { message?: string }) {
    const [isLoginPending, startLoginTransition] = useTransition()
    const [isSignupPending, startSignupTransition] = useTransition()

    // We use a shared state for the inputs to avoid duplication
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (formData: FormData) => {
        startLoginTransition(async () => {
            await login(formData)
        })
    }

    const handleSignup = async (formData: FormData) => {
        startSignupTransition(async () => {
            await signup(formData)
        })
    }

    const isPending = isLoginPending || isSignupPending

    return (
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground max-w-md p-8 bg-surface/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/5 border border-border relative z-10">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black tracking-tight text-foreground leading-none mb-3">
                    Rootline
                </h1>
                <p className="text-sm text-muted-foreground font-medium opacity-80">
                    Acesse o arquivo da sua família
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="email">
                        E-mail
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="voce@exemplo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl px-4 py-4 bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none placeholder:text-muted-foreground/30 transition-all font-medium"
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="password">
                        Senha
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl px-4 py-4 bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none placeholder:text-muted-foreground/30 transition-all font-medium"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button
                    formAction={handleLogin}
                    disabled={isPending}
                    className="bg-primary hover:brightness-110 text-primary-foreground rounded-2xl px-4 py-4 transition-all font-bold flex justify-center items-center w-full shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {isLoginPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        <span className="flex items-center">
                            Entrar
                            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    )}
                </button>

                <button
                    formAction={handleSignup}
                    disabled={isPending}
                    className="border border-border hover:bg-muted text-foreground rounded-2xl px-4 py-4 transition-all font-bold flex justify-center items-center w-full active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSignupPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando...
                        </>
                    ) : (
                        'Criar Conta'
                    )}
                </button>
            </div>

            {message && (
                <div className="mt-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 text-center text-xs rounded-2xl font-bold animate-in fade-in slide-in-from-top-2">
                    {message}
                </div>
            )}
        </form>
    )
}
