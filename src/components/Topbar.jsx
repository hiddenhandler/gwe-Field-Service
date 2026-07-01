import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { LogOut } from 'lucide-react'

export default function Topbar() {
  const { profile, signOut } = useAuth()
  const nav = useNavigate()
  const [logoOk, setLogoOk] = useState(true)
  return (
    <header className="top">
      <div className="top-brand">
        {logoOk
          ? <img src="/logo.png" alt="Great Way Environmental" className="top-logo-img" onError={() => setLogoOk(false)} />
          : <div className="top-logo">GW</div>}
        <div><div className="top-name">Great Way Environmental</div><div className="top-sub">Field Service</div></div>
      </div>
      <div className="top-r">
        <div className="top-user hm"><b>{profile?.full_name}</b><em>{profile?.role}</em></div>
        <div className="av hm">{profile?.full_name?.[0]}</div>
        <button className="btn btn-g btn-sm" onClick={async () => { await signOut(); nav('/login') }}>
          <LogOut size={14} /><span className="hm">Sign out</span>
        </button>
      </div>
    </header>
  )
}
