import { LoginForm } from './LoginForm'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
    return (
        <div className="flex justify-center items-center min-h-screen bg-background p-4 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl opacity-50" />

            <LoginForm message={searchParams?.message} />
        </div>
    )
}
