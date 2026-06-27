import { create } from 'zustand'
import { supabase } from '../lib/supabase'
export const useAuth = create((set, get) => ({
  user: null, profile: null, loading: true,
  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await get().fetchProfile(session.user)
    set({ loading: false })
    supabase.auth.onAuthStateChange(async (_, s) => {
      if (s?.user) await get().fetchProfile(s.user)
      else set({ user: null, profile: null })
    })
  },
  fetchProfile: async u => {
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    set({ user: u, profile: data })
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error; return data
  },
  signOut: async () => { await supabase.auth.signOut(); set({ user: null, profile: null }) },
}))
