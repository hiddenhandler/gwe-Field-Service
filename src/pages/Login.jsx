import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const signIn = useAuth(s => s.signIn)
  const profile = useAuth(s => s.profile)
  const nav = useNavigate()

  const go = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await signIn(email, pass)
      const p = useAuth.getState().profile
      if (p?.role === 'manager') nav('/manager', { replace: true })
      else nav('/field', { replace: true })
    } catch (e) { setErr(e.message || 'Login failed'); setBusy(false) }
  }

  return (
    <div className="login-bg">
      <div className="login-box">
        <div className="login-logo">GW</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>Great Way Environmental</h1>
        <p style={{ fontSize: 13, color: 'var(--t3)', textAlign: 'center', margin: '6px 0 28px' }}>Field Service — Crew Management</p>
        <form onSubmit={go} className="fg">
          {err && <div className="alrt alrt-err"><AlertCircle size={15} style={{ flexShrink: 0 }} />{err}</div>}
          <div className="field"><label className="field-lbl">Email</label><input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus /></div>
          <div className="field"><label className="field-lbl">Password</label><input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required /></div>
          <button className="btn btn-p btn-f btn-lg" type="submit" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', marginTop: 24 }}>Contact your GWE manager to get access</p>
      </div>
    </div>
  )
}
