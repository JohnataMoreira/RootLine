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
                    <h1 className="text-2xl font-semibold tracking-tight">RootLine</h1>
                    <p className="text-sm text-gray-500 mt-2">Acesse o arquivo da sua família</p>
                </div>
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    E-mail
                </label>
                <input
                    id="email"
                    className="rounded-md px-4 py-2 bg-inherit border border-gray-300 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                />
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Senha
                </label>
                <input
                    id="password"
                    className="rounded-md px-4 py-2 bg-inherit border border-gray-300 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                />

                <SubmitButton
                    formAction={login}
                    pendingText="Entrando..."
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors font-medium flex justify-center w-full"
                >
                    Entrar
                </SubmitButton>
                <SubmitButton
                    formAction={signup}
                    pendingText="Criando..."
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md px-4 py-2 mt-2 transition-colors font-medium flex justify-center w-full"
                >
                    Criar Conta
                </SubmitButton>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-gray-100 text-gray-900 border border-gray-200 text-center text-sm rounded-md">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
