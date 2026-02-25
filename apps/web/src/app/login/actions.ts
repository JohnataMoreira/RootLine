'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { loginSchema, signupSchema } from '@/lib/schemas'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const rawData = Object.fromEntries(formData.entries())
    const validated = loginSchema.safeParse(rawData)

    if (!validated.success) {
        const message = validated.error.issues[0].message
        return redirect(`/login?message=${encodeURIComponent(message)}`)
    }

    const { error } = await supabase.auth.signInWithPassword(validated.data)

    if (error) {
        return redirect('/login?message=E-mail ou senha inválidos')
    }

    revalidatePath('/', 'layout')
    redirect('/timeline')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const rawData = Object.fromEntries(formData.entries())
    const validated = signupSchema.safeParse(rawData)

    if (!validated.success) {
        const message = validated.error.issues[0].message
        return redirect(`/login?message=${encodeURIComponent(message)}`)
    }

    const { data: signUpData, error } = await supabase.auth.signUp(validated.data)

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')

    // Auto-confirm is enabled: signUp always returns a session.
    // Redirect new users to onboarding to create their family.
    redirect('/onboarding')
}
