import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

type ProfileRow = {
  id: string
  display_name: string | null
  household_id: string | null
}

export type ProfileContext = {
  user: User | null
  profile: ProfileRow | null
  error?: string
}

export const fetchCurrentProfile = async (client?: SupabaseClient): Promise<ProfileContext> => {
  const isServer = typeof window === 'undefined'
  const supabase = client ?? (!isServer ? getSupabaseBrowserClient() : null)

  if (!supabase) {
    return { user: null, profile: null, error: 'Supabase client no disponible en servidor' }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    return { user: null, profile: null, error: userError.message }
  }

  if (!user) {
    return { user: null, profile: null }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, household_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (error) {
    return { user, profile: null, error: error.message }
  }

  return { user, profile: data ?? null }
}
