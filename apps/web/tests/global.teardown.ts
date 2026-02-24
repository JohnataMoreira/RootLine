import { createClient } from '@supabase/supabase-js'

async function globalTeardown() {
    console.log('\n🗑️  Running Playwright Global Teardown...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️  Skipping database teardown: Missing SUPABASE_SERVICE_ROLE_KEY.')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Delete any families created by E2E tests (names starting with or containing [E2E])
    const { error } = await supabase
        .from('families')
        .delete()
        .like('name', '%[E2E]%')

    if (error) {
        console.error('❌ Failed to clean up E2E families:', error.message)
    } else {
        console.log('✅ Successfully removed [E2E] families from the database.')
    }
}

export default globalTeardown;
