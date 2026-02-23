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
        redirect(`/login?message=Sign in to accept the invitation`)
    }

    const actionWithToken = acceptInvite.bind(null, params.token)

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="animate-in flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">Accept Family Invitation</h1>
                <p className="text-gray-600 mb-6">You&apos;ve been invited to join an archive.</p>

                <form action={actionWithToken}>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-3 transition-colors font-medium shadow-sm"
                    >
                        Join Family
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
