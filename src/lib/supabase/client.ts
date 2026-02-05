import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
// To use: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    );
}

// Message type for The Stoop chat
export interface StoopMessage {
    id: string;
    user_id: string | null;
    username: string;
    content: string;
    created_at: string;
}

// Chat message functions
export async function getMessages(limit = 50): Promise<StoopMessage[]> {
    const { data, error } = await supabase
        .from('stoop_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data as StoopMessage[];
}

export async function sendMessage(content: string, username: string): Promise<StoopMessage> {
    const { data, error } = await supabase
        .from('stoop_messages')
        .insert([{ content, username }])
        .select()
        .single();

    if (error) throw error;
    return data as StoopMessage;
}

// Real-time subscription for chat
export function subscribeToMessages(callback: (message: StoopMessage) => void) {
    return supabase
        .channel('stoop_messages')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'stoop_messages' },
            (payload) => callback(payload.new as StoopMessage)
        )
        .subscribe();
}
