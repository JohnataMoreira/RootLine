import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { acceptInvite } from './actions'

type Props = {
    params: Promise<{ token: string }>
    searchParams: Promise<{ message?: string }>
}

export default async function InvitePage(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?message=Faça login ou crie sua conta para aceitar o convite`)
    }

    const actionWithToken = acceptInvite.bind(null, params.token)

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="animate-in flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">Aceitar Convite para Família</h1>
                <p className="text-slate-600 mb-6">Você recebeu um convite para participar do arquivo familiar.</p>

                <form action={actionWithToken}>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 transition-all font-bold shadow-lg shadow-blue-200 active:scale-95"
                    >
                        Participar da Família
                    </button>
                </form>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-red-50 text-red-900 border border-red-200 text-sm rounded-md text-left">
                        {searchParams.message}
                    </p>
                )}
            </div>
        </div>
    )
}
