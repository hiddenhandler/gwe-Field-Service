const go = async e => {
  e.preventDefault(); setBusy(true); setErr('')
  try {
    await signIn(email, pass)
    const p = useAuth.getState().profile
    nav(p?.role === 'manager' ? '/manager' : '/field', { replace: true })
  } catch (e) {
    setErr(e.message || 'Login failed')
    setBusy(false)
  }
}