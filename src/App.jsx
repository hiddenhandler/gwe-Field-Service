import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './stores/auth'
import Login from './pages/Login'
import FieldApp from './pages/FieldApp'
import ManagerApp from './pages/ManagerApp'

function Guard({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loader" style={{ minHeight: '100dvh' }}><div className="spin spin-lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}

function Root() {
  const { profile } = useAuth()
  if (!profile) return <Navigate to="/login" replace />
  // managers + viewers use the manager console; crew uses the field app
  return profile.role === 'subcontractor' ? <Navigate to="/field" replace /> : <Navigate to="/manager" replace />
}

export default function App() {
  const init = useAuth(s => s.init)
  useEffect(() => { init() }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Root /></Guard>} />
        <Route path="/field/*" element={<Guard roles={['subcontractor']}><FieldApp /></Guard>} />
        <Route path="/manager/*" element={<Guard roles={['manager', 'viewer']}><ManagerApp /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
