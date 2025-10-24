import { createBrowserClient, createServerClient, type SupabaseClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const createClient = (): SupabaseClient => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      lifetime: 60 * 60 * 24 * 7, // 1 week
    },
  });
};

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name, options) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
};
