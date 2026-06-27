import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './stores/auth'
import Login from './pages/Login'
import FieldApp from './pages/FieldApp'
import ManagerApp from './pages/ManagerApp'

function Guard({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loader" style={{ minHeight: '100dvh' }}><div className="spin spin-lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/" replace />
  return children
}

function Root() {
  const { profile } = useAuth()
  if (!profile) return <Navigate to="/login" replace />
  return profile.role === 'manager' ? <Navigate to="/manager" replace /> : <Navigate to="/field" replace />
}

export default function App() {
  const init = useAuth(s => s.init)
  useEffect(() => { init() }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Root /></Guard>} />
        <Route path="/field/*" element={<Guard role="subcontractor"><FieldApp /></Guard>} />
        <Route path="/manager/*" element={<Guard role="manager"><ManagerApp /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
