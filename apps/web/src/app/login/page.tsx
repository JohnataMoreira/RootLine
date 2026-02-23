import { login, signup } from './actions'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">RootLine</h1>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your family archive</p>
                </div>
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border border-gray-300 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border border-gray-300 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <button
                    formAction={login}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors font-medium"
                >
                    Sign In
                </button>
                <button
                    formAction={signup}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md px-4 py-2 mt-2 transition-colors font-medium"
                >
                    Sign Up
                </button>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-gray-100 text-gray-900 border border-gray-200 text-center text-sm rounded-md">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
