import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
  },
})

// Create a user account WITHOUT logging out the current admin.
// signUp on the main client would swap the session to the new user;
// this uses a throwaway client with its own non-persisted storage.
export async function createUserAccount({ email, password, full_name, role, phone }) {
  const temp = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'gwe-admin-signup' },
  })
  return temp.auth.signUp({
    email,
    password,
    options: { data: { full_name, role, phone } },
  })
}
