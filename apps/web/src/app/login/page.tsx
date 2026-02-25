import { LoginForm } from './LoginForm'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <LoginForm message={searchParams?.message} />
        </div>
    )
}
