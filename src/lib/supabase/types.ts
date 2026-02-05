// Supabase Database Types
// These types should match your Supabase table schema

export type Database = {
    public: {
        Tables: {
            stoop_messages: {
                Row: {
                    id: string;
                    user_id: string | null;
                    username: string;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    username: string;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    username?: string;
                    content?: string;
                    created_at?: string;
                };
            };
            vip_members: {
                Row: {
                    id: string;
                    user_id: string;
                    email: string | null;
                    phone: string | null;
                    verified: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    email?: string | null;
                    phone?: string | null;
                    verified?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    email?: string | null;
                    phone?: string | null;
                    verified?: boolean;
                    created_at?: string;
                };
            };
        };
    };
};

// Helper types
export type StoopMessage = Database['public']['Tables']['stoop_messages']['Row'];
export type VipMember = Database['public']['Tables']['vip_members']['Row'];
