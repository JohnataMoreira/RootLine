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
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Rootline</h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">Acesse o arquivo da sua família</p>
            </div>

            <label className="text-sm font-bold text-slate-700" htmlFor="email">
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
                className="rounded-xl px-4 py-3 bg-white border border-slate-200 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-300 transition-all shadow-sm"
                disabled={isPending}
            />

            <label className="text-sm font-bold text-slate-700" htmlFor="password">
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
                className="rounded-xl px-4 py-3 bg-white border border-slate-200 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-300 transition-all shadow-sm"
                disabled={isPending}
            />

            <button
                formAction={handleLogin}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3.5 transition-all font-bold flex justify-center items-center w-full shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoginPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                    </>
                ) : (
                    'Entrar'
                )}
            </button>

            <button
                formAction={handleSignup}
                disabled={isPending}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-3.5 mt-2 transition-all font-bold flex justify-center items-center w-full active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSignupPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                    </>
                ) : (
                    'Criar Conta'
                )}
            </button>

            {message && (
                <p className="mt-4 p-4 bg-slate-50 text-slate-900 border border-slate-200 text-center text-xs rounded-xl font-medium">
                    {message}
                </p>
            )}
        </form>
    )
}
