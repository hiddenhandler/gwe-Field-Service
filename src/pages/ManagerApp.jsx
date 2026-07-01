import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, MapPin, Users, Calendar, History, RefreshCw, Plus, Search, Flag, X, CheckCircle2, AlertCircle, Clock, Camera, Pen, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../stores/auth'
import Topbar from '../components/Topbar'

const dur = (a, b) => { if (!a || !b) return '—'; const m = Math.round((new Date(b) - new Date(a)) / 60000); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m` }
const mapUrl = (lat, lng) => (lat != null && lng != null) ? `https://www.google.com/maps?q=${lat},${lng}` : null
function Bdg({ s }) {
  if (s === 'checked_in') return <span className="bdg bdg-g pulse">Active</span>
  if (s === 'checked_out') return <span className="bdg bdg-x">Done</span>
  if (s === 'flagged') return <span className="bdg bdg-r"><Flag size={9} />Flagged</span>
  return null
}

/* ═══ DASHBOARD ═══ */
function Dashboard({ go }) {
  const [s, setS] = useState({ active: 0, today: 0, week: 0, sites: 0 })
  const [recent, setRecent] = useState([])
  const [busy, setBusy] = useState(true)

  const load = useCallback(async () => {
    setBusy(true)
    const td = startOfDay(new Date()).toISOString(), wk = subDays(new Date(), 7).toISOString()
    const [a, t, w, si, r] = await Promise.all([
      supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'checked_in'),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', td),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', wk),
      supabase.from('locations').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('visits').select('*, profiles(full_name), locations(name, city, service_type)').order('created_at', { ascending: false }).limit(8),
    ])
    setS({ active: a.count || 0, today: t.count || 0, week: w.count || 0, sites: si.count || 0 })
    setRecent(r.data || [])
    setBusy(false)
  }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</h1><p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 2 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p></div>
        <button className="btn btn-g btn-sm" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>
      <div className="stats" style={{ marginBottom: 20 }}>
        {[{ l: 'On Site Now', v: s.active, g: true }, { l: 'Visits Today', v: s.today }, { l: 'This Week', v: s.week }, { l: 'Active Sites', v: s.sites }].map(x => (
          <div key={x.l} className="stat" style={x.g && s.active > 0 ? { borderColor: 'var(--g-edge)', boxShadow: '0 0 20px var(--g-glow)' } : {}}>
            <div className={`stat-n ${x.g ? 'gr' : ''}`}>{x.v}</div><div className="stat-l">{x.l}</div>
          </div>
        ))}
      </div>
      {s.active > 0 && <div className="alrt alrt-ok" style={{ marginBottom: 18 }}><CheckCircle2 size={15} />{s.active} crew member{s.active > 1 ? 's' : ''} currently on site</div>}
      <div className="sec-hd"><span className="sec-t">Recent Activity</span><button className="btn btn-g btn-sm" onClick={() => go('visits')}>View all →</button></div>
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin" /></div> : recent.length === 0 ? <div className="empty"><Clock size={24} /><p>No visits yet</p></div> : (
          <div className="tw"><table><thead><tr><th>Crew</th><th>Location</th><th>Check In</th><th>Duration</th><th>Status</th></tr></thead><tbody>
            {recent.map(v => <tr key={v.id}><td style={{ fontWeight: 600 }}>{v.profiles?.full_name}</td><td><div>{v.locations?.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.locations?.city}</div></td><td className="mono" style={{ fontSize: 12 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d, h:mm a') : '—'}</td><td className="mono" style={{ fontSize: 12 }}>{dur(v.check_in_at, v.check_out_at)}</td><td><Bdg s={v.status} /></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  )
}

/* ═══ CALENDAR ═══ */
function CalendarView() {
  const [month, setMonth] = useState(new Date())
  const [visits, setVisits] = useState([])
  const [selDay, setSelDay] = useState(null)
  const [dayVisits, setDayVisits] = useState([])

  useEffect(() => {
    const s = startOfMonth(month).toISOString(), e = endOfMonth(month).toISOString()
    supabase.from('visits').select('*, profiles(full_name), locations(name, city)').gte('check_in_at', s).lte('check_in_at', e).order('check_in_at').then(({ data }) => setVisits(data || []))
  }, [month])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDow = getDay(startOfMonth(month))
  const blanks = Array(firstDow).fill(null)
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const selectDay = (d) => {
    setSelDay(d)
    setDayVisits(visits.filter(v => v.check_in_at && isSameDay(new Date(v.check_in_at), d)))
  }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-g btn-sm" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={14} /></button>
          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 130, textAlign: 'center' }}>{format(month, 'MMMM yyyy')}</span>
          <button className="btn btn-g btn-sm" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div className="cal-grid">
          {dows.map(d => <div key={d} className="cal-hdr">{d}</div>)}
          {blanks.map((_, i) => <div key={`b${i}`} className="cal-day other" />)}
          {days.map(d => {
            const dv = visits.filter(v => v.check_in_at && isSameDay(new Date(v.check_in_at), d))
            const active = dv.some(v => v.status === 'checked_in')
            const flagged = dv.some(v => v.status === 'flagged')
            return (
              <div key={d.toISOString()} className={`cal-day ${isToday(d) ? 'today' : ''} ${selDay && isSameDay(d, selDay) ? 'today' : ''}`} onClick={() => selectDay(d)}>
                <div className="cal-num">{format(d, 'd')}</div>
                <div>{dv.length > 0 && <span className={`cal-dot ${active ? 'green' : flagged ? 'red' : 'gray'}`} />}{dv.length > 1 && <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 2 }}>{dv.length}</span>}</div>
              </div>
            )
          })}
        </div>
      </div>
      {selDay && (
        <div>
          <div className="sec-hd"><span className="sec-t">{format(selDay, 'MMMM d, yyyy')} — {dayVisits.length} visit{dayVisits.length !== 1 ? 's' : ''}</span></div>
          {dayVisits.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 30, color: 'var(--t3)', fontSize: 13 }}>No visits on this day</div> : (
            dayVisits.map(v => (
              <div key={v.id} className="card" style={{ padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><div style={{ fontWeight: 600 }}>{v.profiles?.full_name}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{v.locations?.name} · {v.locations?.city}</div></div>
                  <Bdg s={v.status} />
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12 }}>
                  <span className="mono">In: {v.check_in_at ? format(new Date(v.check_in_at), 'h:mm a') : '—'}</span>
                  <span className="mono">Out: {v.check_out_at ? format(new Date(v.check_out_at), 'h:mm a') : '—'}</span>
                  <span className="mono" style={{ color: 'var(--t2)' }}>{dur(v.check_in_at, v.check_out_at)}</span>
                </div>
                {(v.photo_url || v.signature_url || mapUrl(v.check_in_lat, v.check_in_lng)) && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {mapUrl(v.check_in_lat, v.check_in_lng) && <a href={mapUrl(v.check_in_lat, v.check_in_lng)} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><MapPin size={11} /> GPS</a>}
                    {v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Camera size={11} /> Photo</a>}
                    {v.signature_url && <a href={v.signature_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Pen size={11} /> Signature</a>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ═══ ALL VISITS ═══ */
function AllVisits() {
  const [visits, setVisits] = useState([])
  const [busy, setBusy] = useState(true)
  const [q, setQ] = useState(''), [status, setSt] = useState('all'), [days, setDays] = useState('7'), [flagErr, setFlagErr] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    let query = supabase.from('visits').select('*, profiles(full_name, phone), locations(name, city, service_type)').order('created_at', { ascending: false }).limit(300)
    if (status !== 'all') query = query.eq('status', status)
    if (days !== 'all') query = query.gte('check_in_at', subDays(new Date(), +days).toISOString())
    const { data } = await query; setVisits(data || []); setBusy(false)
  }, [status, days])
  useEffect(() => { load() }, [load])

  const filtered = visits.filter(v => { if (!q) return true; const s = q.toLowerCase(); return v.profiles?.full_name?.toLowerCase().includes(s) || v.locations?.name?.toLowerCase().includes(s) })

  const flag = async (v, to) => {
    setFlagErr('')
    const { data, error } = await supabase.from('visits').update({ status: to }).eq('id', v.id).select()
    if (error) { setFlagErr(error.message); return }
    if (!data || data.length === 0) { setFlagErr('Update blocked — your account is not a manager (check profiles.role).'); return }
    load()
  }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>All Visits</h1><span className="bdg bdg-x">{filtered.length}</span></div>
      {flagErr && <div className="alrt alrt-err" style={{ marginBottom: 14 }}><AlertCircle size={14} />{flagErr}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 170, position: 'relative' }}><Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} /><input className="inp" style={{ paddingLeft: 30 }} placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="inp" style={{ width: 130 }} value={status} onChange={e => setSt(e.target.value)}><option value="all">All</option><option value="checked_in">Active</option><option value="checked_out">Done</option><option value="flagged">Flagged</option></select>
        <select className="inp" style={{ width: 120 }} value={days} onChange={e => setDays(e.target.value)}><option value="1">Today</option><option value="7">7 days</option><option value="30">30 days</option><option value="all">All time</option></select>
      </div>
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : filtered.length === 0 ? <div className="empty"><History size={24} /><p>No visits match</p></div> : (
          <div className="tw"><table><thead><tr><th>Crew</th><th>Location</th><th>In</th><th>Out</th><th>Duration</th><th>Status</th><th>Proof</th><th></th></tr></thead><tbody>
            {filtered.map(v => <tr key={v.id}>
              <td><div style={{ fontWeight: 600 }}>{v.profiles?.full_name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.profiles?.phone}</div></td>
              <td><div>{v.locations?.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.locations?.city}</div></td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d h:mm a') : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_out_at ? format(new Date(v.check_out_at), 'h:mm a') : v.status === 'checked_in' ? <span className="bdg bdg-g" style={{ fontSize: 10 }}>Live</span> : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{dur(v.check_in_at, v.check_out_at)}</td>
              <td><Bdg s={v.status} /></td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {mapUrl(v.check_in_lat, v.check_in_lng) && <a href={mapUrl(v.check_in_lat, v.check_in_lng)} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }} title="Check-in GPS location"><MapPin size={10} /></a>}
                {v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }}><Camera size={10} /></a>}
                {v.signature_url && <a href={v.signature_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Pen size={10} /></a>}
              </td>
              <td>{v.status === 'flagged' ? <button className="btn btn-g btn-sm" onClick={() => flag(v, v.check_out_at ? 'checked_out' : 'checked_in')}>Unflag</button> : <button className="btn btn-d btn-sm" onClick={() => flag(v, 'flagged')}><Flag size={10} /></button>}</td>
            </tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  )
}

/* ═══ LOCATIONS ═══ */
function Locations() {
  const [locs, setLocs] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false)
  const [f, setF] = useState({ name: '', address: '', city: '', service_type: '', notes: '' })
  const load = async () => { const { data } = await supabase.from('locations').select('*').order('name'); setLocs(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => { e.preventDefault(); setSaving(true); await supabase.from('locations').insert(f); setF({ name: '', address: '', city: '', service_type: '', notes: '' }); setAdd(false); setSaving(false); load() }
  const toggle = async l => { await supabase.from('locations').update({ active: !l.active }).eq('id', l.id); load() }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>Locations</h1><button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add</>}</button></div>
      {add && <div className="card" style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, marginBottom: 14 }}>New Location</div><form onSubmit={save}><div className="fg2" style={{ marginBottom: 14 }}>{[['name', 'Name', true], ['address', 'Address'], ['city', 'City, State'], ['service_type', 'Service Type']].map(([k, l, r]) => <div key={k} className="field"><label className="field-lbl">{l}</label><input className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required={r} /></div>)}</div><button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save'}</button></form></div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : <div className="tw"><table><thead><tr><th>Name</th><th>Address</th><th>City</th><th>Service</th><th>Status</th><th></th></tr></thead><tbody>
          {locs.map(l => <tr key={l.id}><td style={{ fontWeight: 600 }}><MapPin size={12} style={{ color: 'var(--g-light)', marginRight: 5 }} />{l.name}</td><td style={{ fontSize: 12 }}>{l.address}</td><td style={{ fontSize: 12 }}>{l.city}</td><td style={{ fontSize: 12 }}>{l.service_type}</td><td>{l.active ? <span className="bdg bdg-g">Active</span> : <span className="bdg bdg-x">Off</span>}</td><td><button className="btn btn-g btn-sm" onClick={() => toggle(l)}>{l.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
        </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ CREW ═══ */
function Crew() {
  const [crew, setCrew] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const [f, setF] = useState({ full_name: '', email: '', password: '', phone: '' })
  const load = async () => { const { data } = await supabase.from('profiles').select('*').eq('role', 'subcontractor').order('full_name'); setCrew(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => {
    e.preventDefault(); setSaving(true); setErr(''); setOk('')
    try {
      const { error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.full_name, role: 'subcontractor', phone: f.phone } } })
      if (error) throw error
      setOk(`Account created for ${f.full_name}. Share login: ${f.email} / ${f.password}`)
      setF({ full_name: '', email: '', password: '', phone: '' }); setAdd(false); setTimeout(load, 1500)
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>Crew</h1><button className="btn btn-p" onClick={() => { setAdd(!add); setErr(''); setOk('') }}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Member</>}</button></div>
      {ok && <div className="alrt alrt-ok" style={{ marginBottom: 14 }}><CheckCircle2 size={14} />{ok}</div>}
      {err && <div className="alrt alrt-err" style={{ marginBottom: 14 }}><AlertCircle size={14} />{err}</div>}
      {add && <div className="card" style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, marginBottom: 14 }}>New Crew Member</div><p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 14 }}>Create their login. Share email + password with them via WhatsApp or text.</p><form onSubmit={save}><div className="fg2" style={{ marginBottom: 14 }}>{[['full_name', 'Full Name', 'text', true], ['phone', 'Phone', 'text'], ['email', 'Email', 'email', true], ['password', 'Password', 'password', true]].map(([k, l, t, r]) => <div key={k} className="field"><label className="field-lbl">{l}</label><input className="inp" type={t} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required={r} /></div>)}</div><button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Create Account'}</button></form></div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : crew.length === 0 ? <div className="empty"><Users size={24} /><p>No crew yet</p></div> : <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Since</th></tr></thead><tbody>
          {crew.map(c => <tr key={c.id}><td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="av">{c.full_name?.[0]}</div><span style={{ fontWeight: 600 }}>{c.full_name}</span></div></td><td style={{ fontSize: 12 }}>{c.email}</td><td style={{ fontSize: 12 }}>{c.phone || '—'}</td><td className="mono" style={{ fontSize: 11 }}>{c.created_at ? format(new Date(c.created_at), 'MMM d, yyyy') : '—'}</td></tr>)}
        </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ MAIN ═══ */
export default function ManagerApp() {
  const { profile } = useAuth()
  const isViewer = profile?.role === 'viewer'
  const [tab, setTab] = useState('dash')
  const allMenu = [
    { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'cal', label: 'Calendar', icon: <Calendar size={16} /> },
    { id: 'visits', label: 'All Visits', icon: <History size={16} /> },
    { id: 'locs', label: 'Locations', icon: <MapPin size={16} /> },
    { id: 'crew', label: 'Crew', icon: <Users size={16} /> },
  ]
  const allMobile = [
    { id: 'dash', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'cal', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'visits', label: 'Visits', icon: <History size={20} /> },
    { id: 'locs', label: 'Sites', icon: <MapPin size={20} /> },
    { id: 'crew', label: 'Crew', icon: <Users size={20} /> },
  ]
  // Viewers get read-only access: no Locations / Crew management
  const menuItems = isViewer ? allMenu.filter(i => !['locs', 'crew'].includes(i.id)) : allMenu
  const mobileItems = isViewer ? allMobile.filter(i => !['locs', 'crew'].includes(i.id)) : allMobile

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div className="app-body" style={{ display: 'flex', flex: 1 }}>
        <aside className="side">
          <div className="side-lbl">Menu</div>
          {menuItems.map(i => <button key={i.id} className={`side-btn ${tab === i.id ? 'on' : ''}`} onClick={() => setTab(i.id)}>{i.icon}{i.label}</button>)}
        </aside>
        <main style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'dash' && <Dashboard go={setTab} />}
          {tab === 'cal' && <CalendarView />}
          {tab === 'visits' && <AllVisits />}
          {tab === 'locs' && !isViewer && <Locations />}
          {tab === 'crew' && !isViewer && <Crew />}
        </main>
      </div>
      <nav className="tabs" style={{ display: 'none' }}>
        {mobileItems.map(i => <button key={i.id} className={tab === i.id ? 'on' : ''} onClick={() => setTab(i.id)}>{i.icon}{i.label}</button>)}
      </nav>
    </div>
  )
}
