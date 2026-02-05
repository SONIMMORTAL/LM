"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface Profile {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    country: string | null;
    city: string | null;
    is_vip: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    useEffect(() => {
        if (!isConfigured) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [isConfigured]);

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
            }
            setProfile(data as Profile | null);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    async function signUp(email: string, password: string, username?: string) {
        if (!isConfigured) {
            return { error: new Error("Supabase is not configured") };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email.split("@")[0],
                    display_name: username || email.split("@")[0],
                },
            },
        });

        return { error: error as Error | null };
    }

    async function signIn(email: string, password: string) {
        if (!isConfigured) {
            return { error: new Error("Supabase is not configured") };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error: error as Error | null };
    }

    async function signOut() {
        if (!isConfigured) return;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signUp,
                signIn,
                signOut,
                isConfigured,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
