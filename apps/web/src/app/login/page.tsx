import { login, signup } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
                    className="rounded-xl px-4 py-3 bg-white border border-slate-200 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-300 transition-all shadow-sm"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                />
                <label className="text-sm font-bold text-slate-700" htmlFor="password">
                    Senha
                </label>
                <input
                    id="password"
                    className="rounded-xl px-4 py-3 bg-white border border-slate-200 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-300 transition-all shadow-sm"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                />

                <SubmitButton
                    formAction={login}
                    pendingText="Entrando..."
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3.5 transition-all font-bold flex justify-center w-full shadow-lg shadow-blue-200 active:scale-95 active:opacity-80"
                >
                    Entrar
                </SubmitButton>
                <SubmitButton
                    formAction={signup}
                    pendingText="Criando..."
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-3.5 mt-2 transition-all font-bold flex justify-center w-full active:scale-95 active:opacity-80"
                >
                    Criar Conta
                </SubmitButton>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-slate-50 text-slate-900 border border-slate-200 text-center text-xs rounded-xl font-medium">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
