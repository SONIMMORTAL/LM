import { createClient } from '@supabase/supabase-js';

// Access the service role key from environment variables
// This key has full access to your database and storage, bypassing RLS.
// NEVER expose this to the client-side (e.g. do not prefix with NEXT_PUBLIC_).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export function isServiceRoleConfigured() {
    return !!serviceRoleKey && serviceRoleKey !== 'placeholder';
}
