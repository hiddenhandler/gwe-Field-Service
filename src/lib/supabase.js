import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// "Keep me logged in" preference.
// - true  (default): session lives in localStorage → survives closing the
//   browser / app, so the user stays signed in on their own device.
// - false: session lives in sessionStorage → cleared when the browser fully
//   closes, so a shared or public device won't stay signed in.
const REMEMBER_KEY = 'gwe-remember-me'

export function setRememberMe(remember) {
  try { window.localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0') } catch {}
}

export function getRememberMe() {
  try { return window.localStorage.getItem(REMEMBER_KEY) !== '0' } catch { return true }
}

// Storage adapter that routes the auth token to localStorage or sessionStorage
// based on the current preference. Reads from whichever store already holds a
// token, so a session saved either way is restored on load.
const rememberAwareStorage = {
  getItem: (key) => {
    try {
      const persisted = window.localStorage.getItem(key)
      if (persisted !== null) return persisted
      return window.sessionStorage.getItem(key)
    } catch { return null }
  },
  setItem: (key, value) => {
    try {
      if (getRememberMe()) {
        window.localStorage.setItem(key, value)
        window.sessionStorage.removeItem(key)
      } else {
        window.sessionStorage.setItem(key, value)
        window.localStorage.removeItem(key)
      }
    } catch {}
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
      window.sessionStorage.removeItem(key)
    } catch {}
  },
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: rememberAwareStorage,
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
