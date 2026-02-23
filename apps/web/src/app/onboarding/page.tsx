import { createFamily } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if they already have an active family
    const { data: members } = await supabase
        .from('members')
        .select('family_id')
        .eq('profile_id', user.id)
        .limit(1)

    // If already part of a family, MVP rule defaults them and skips onboarding
    if (members && members.length > 0) {
        redirect('/timeline')
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="animate-in flex flex-col w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Welcome to RootLine</h1>
                    <p className="text-sm text-gray-500 mt-2">Let&apos;s create your first Living Archive.</p>
                </div>

                <form action={createFamily} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="familyName">
                            Family Name
                        </label>
                        <input
                            className="w-full rounded-md px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            name="familyName"
                            placeholder="e.g. The Silva Family"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-3 transition-colors font-medium mt-4 shadow-sm"
                    >
                        Create Family Archive
                    </button>

                    {searchParams?.message && (
                        <p className="mt-4 p-4 bg-red-50 text-red-900 border border-red-200 text-center text-sm rounded-md">
                            {searchParams.message}
                        </p>
                    )}
                </form>

                <div className="mt-6 border-t pt-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Were you invited by someone?</p>
                    <p className="text-xs text-gray-400">Please check your email and click the invitation link to join an existing family.</p>
                </div>
            </div>
        </div>
    )
}
