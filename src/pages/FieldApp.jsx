import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock, History, User, MapPin, Camera, Pen, LogOut, AlertCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../stores/auth'
import Topbar from '../components/Topbar'
import SignaturePad from '../components/SignaturePad'

const getGeo = () => new Promise(r => {
  if (!navigator.geolocation) return r({ lat: null, lng: null })
  navigator.geolocation.getCurrentPosition(p => r({ lat: p.coords.latitude, lng: p.coords.longitude }), () => r({ lat: null, lng: null }), { timeout: 8000 })
})

const dur = (a, b) => { if (!a || !b) return null; const m = Math.round((new Date(b) - new Date(a)) / 60000); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m` }

function Badge({ s }) {
  if (s === 'checked_in') return <span className="bdg bdg-g pulse">Active</span>
  if (s === 'checked_out') return <span className="bdg bdg-x">Done</span>
  if (s === 'flagged') return <span className="bdg bdg-r">Flagged</span>
  return null
}

/* ═══ CHECK-IN TAB ═══ */
function CheckInTab() {
  const { user, profile } = useAuth()
  const [locs, setLocs] = useState([])
  const [locId, setLocId] = useState('')
  const [notes, setNotes] = useState('')
  const [active, setActive] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  // Checkout flow
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [signature, setSignature] = useState(null)
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: locations }, { data: visits }] = await Promise.all([
      supabase.from('locations').select('*').eq('active', true).order('name'),
      supabase.from('visits').select('*, locations(name, address, city, service_type)').eq('subcontractor_id', user.id).eq('status', 'checked_in').limit(1)
    ])
    setLocs(locations || [])
    setActive(visits?.[0] || null)
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  const checkIn = async () => {
    if (!locId) return; setBusy(true); setMsg(null)
    try {
      const { lat, lng } = await getGeo()
      const { data, error } = await supabase.from('visits').insert({
        subcontractor_id: user.id, location_id: locId,
        check_in_at: new Date().toISOString(), check_in_lat: lat, check_in_lng: lng,
        status: 'checked_in', notes: notes || null, manager_notified: true,
      }).select('*, locations(name, address, city, service_type)').single()
      if (error) throw error
      await supabase.from('notifications').insert({ visit_id: data.id, sent_to: import.meta.env.VITE_MANAGER_EMAIL || 'che@greatwaye.com', type: 'check_in' })
      setActive(data); setLocId(''); setNotes('')
      setMsg({ ok: true, text: `Checked in at ${data.locations.name}` })
    } catch (e) { setMsg({ ok: false, text: e.message }) }
    setBusy(false)
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const checkOut = async () => {
    if (!active) return; setBusy(true); setMsg(null)
    try {
      const { lat, lng } = await getGeo()
      // Upload photo if exists
      let photoUrl = null
      if (photo) {
        const ext = photo.name.split('.').pop()
        const path = `visits/${active.id}/photo.${ext}`
        const { error: upErr } = await supabase.storage.from('visit-photos').upload(path, photo, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('visit-photos').getPublicUrl(path)
          photoUrl = urlData?.publicUrl
        }
      }
      // Upload signature if exists
      let sigUrl = null
      if (signature) {
        const blob = await (await fetch(signature)).blob()
        const path = `visits/${active.id}/signature.png`
        const { error: sigErr } = await supabase.storage.from('visit-photos').upload(path, blob, { contentType: 'image/png', upsert: true })
        if (!sigErr) {
          const { data: urlData } = supabase.storage.from('visit-photos').getPublicUrl(path)
          sigUrl = urlData?.publicUrl
        }
      }
      const { error } = await supabase.from('visits').update({
        check_out_at: new Date().toISOString(), check_out_lat: lat, check_out_lng: lng,
        status: 'checked_out', photo_url: photoUrl, signature_url: sigUrl,
      }).eq('id', active.id)
      if (error) throw error
      await supabase.from('notifications').insert({ visit_id: active.id, sent_to: import.meta.env.VITE_MANAGER_EMAIL || 'che@greatwaye.com', type: 'check_out' })
      const d = dur(active.check_in_at, new Date().toISOString())
      setMsg({ ok: true, text: `Checked out — ${d} on site` })
      setActive(null); setCheckoutMode(false); setPhoto(null); setPhotoPreview(null); setSignature(null)
    } catch (e) { setMsg({ ok: false, text: e.message }) }
    setBusy(false)
  }

  if (loading) return <div className="loader"><div className="spin spin-lg" /></div>

  return (
    <div className="pg" style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Hey, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 3 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {msg && <div className={`alrt ${msg.ok ? 'alrt-ok' : 'alrt-err'}`} style={{ marginBottom: 16 }}>{msg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{msg.text}</div>}

      {/* ACTIVE VISIT */}
      {active && !checkoutMode ? (
        <div className="active-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{active.locations.name}</div>
              <div style={{ color: 'var(--t2)', fontSize: 12, marginTop: 3 }}><MapPin size={11} style={{ marginRight: 3 }} />{active.locations.address}, {active.locations.city}</div>
            </div>
            <Badge s="checked_in" />
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div><div className="sec-t" style={{ marginBottom: 3 }}>Checked in</div><div className="mono" style={{ fontSize: 13, color: 'var(--g-light)' }}>{format(new Date(active.check_in_at), 'h:mm a')}</div></div>
            <div><div className="sec-t" style={{ marginBottom: 3 }}>On site</div><div className="mono" style={{ fontSize: 13 }}>{formatDistanceToNow(new Date(active.check_in_at))}</div></div>
            <div><div className="sec-t" style={{ marginBottom: 3 }}>Service</div><div style={{ fontSize: 13 }}>{active.locations.service_type}</div></div>
          </div>
          <button className="big big-out" onClick={() => setCheckoutMode(true)}>
            <XCircle size={20} /> Ready to Check Out
          </button>
        </div>
      ) : active && checkoutMode ? (
        /* CHECKOUT FLOW */
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Checking out of {active.locations.name}</div>
          <p style={{ color: 'var(--t2)', fontSize: 12, marginBottom: 18 }}>Take a photo of the completed work and get the manager's signature below.</p>

          {/* Photo */}
          <div style={{ marginBottom: 18 }}>
            <div className="sec-t" style={{ marginBottom: 8 }}>📷 Work Photo</div>
            <label className="photo-btn">
              <Camera size={16} />
              {photoPreview ? 'Change photo' : 'Take photo or upload'}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
            </label>
            {photoPreview && <img src={photoPreview} className="photo-preview" alt="Work" />}
          </div>

          {/* Signature */}
          <div style={{ marginBottom: 18 }}>
            <div className="sec-t" style={{ marginBottom: 8 }}>✍️ Manager Signature</div>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8 }}>Have the on-site manager sign below to confirm the work was completed.</p>
            <SignaturePad onSave={setSignature} height={140} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="big big-out" style={{ flex: 1 }} onClick={checkOut} disabled={busy}>
              {busy ? <span className="spin" style={{ borderTopColor: 'var(--red)' }} /> : <><XCircle size={18} /> Complete Check Out</>}
            </button>
          </div>
          <button className="btn btn-g btn-f" style={{ marginTop: 10 }} onClick={() => setCheckoutMode(false)}>← Go back</button>
        </div>
      ) : (
        /* CHECK-IN FORM */
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Check In to a Location</div>
          <div className="fg">
            <div className="field">
              <label className="field-lbl">Select Location</label>
              <select className="inp" value={locId} onChange={e => setLocId(e.target.value)}>
                <option value="">— Choose —</option>
                {locs.map(l => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-lbl">Notes (optional)</label>
              <input className="inp" placeholder="Issues, special conditions..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button className="big big-in" onClick={checkIn} disabled={busy || !locId}>
              {busy ? <span className="spin" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> : <><CheckCircle2 size={20} /> Check In</>}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', marginTop: 12 }}>
            <MapPin size={10} style={{ marginRight: 3 }} />Your manager is notified on every check-in & out
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══ HISTORY TAB ═══ */
function HistoryTab() {
  const { user } = useAuth()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('visits').select('*, locations(name, city, service_type)')
      .eq('subcontractor_id', user.id).order('created_at', { ascending: false }).limit(60)
      .then(({ data }) => { setVisits(data || []); setLoading(false) })
  }, [user.id])

  if (loading) return <div className="loader"><div className="spin spin-lg" /></div>

  return (
    <div className="pg" style={{ paddingBottom: 80 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>My Visits</h1>
      {visits.length === 0 ? (
        <div className="card empty"><Clock size={32} /><div style={{ fontWeight: 600, marginTop: 8 }}>No visits yet</div><p>Check in to your first location</p></div>
      ) : (
        visits.map(v => (
          <div key={v.id} className="card" style={{ marginBottom: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{v.locations?.name}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{v.locations?.city} · {v.locations?.service_type}</div></div>
              <Badge s={v.status} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              <div><div className="sec-t">Date</div><div className="mono" style={{ fontSize: 12 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d') : '—'}</div></div>
              <div><div className="sec-t">In</div><div className="mono" style={{ fontSize: 12 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'h:mm a') : '—'}</div></div>
              <div><div className="sec-t">Out</div><div className="mono" style={{ fontSize: 12 }}>{v.check_out_at ? format(new Date(v.check_out_at), 'h:mm a') : '—'}</div></div>
              <div><div className="sec-t">Duration</div><div className="mono" style={{ fontSize: 12 }}>{dur(v.check_in_at, v.check_out_at) || '—'}</div></div>
            </div>
            {(v.photo_url || v.signature_url) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, borderTop: '1px solid var(--bd)', paddingTop: 10 }}>
                {v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Camera size={12} /> Photo</a>}
                {v.signature_url && <a href={v.signature_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Pen size={12} /> Signature</a>}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ═══ PROFILE TAB ═══ */
function ProfileTab() {
  const { profile, signOut } = useAuth()
  const nav = useNavigate()
  return (
    <div className="pg" style={{ paddingBottom: 80 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Profile</h1>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div className="av av-lg">{profile?.full_name?.[0]}</div>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>{profile?.full_name}</div><div style={{ fontSize: 12, color: 'var(--t2)' }}>{profile?.email}</div></div>
        </div>
        {[['Role', 'Field Crew'], ['Phone', profile?.phone || '—']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
            <span style={{ color: 'var(--t2)' }}>{k}</span><span>{v}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-g btn-f" onClick={async () => { await signOut(); nav('/login') }}><LogOut size={14} /> Sign Out</button>
    </div>
  )
}

/* ═══ MAIN FIELD APP ═══ */
export default function FieldApp() {
  const [tab, setTab] = useState('check')
  const tabs = [
    { id: 'check', label: 'Check In', icon: <CheckCircle2 size={20} /> },
    { id: 'history', label: 'History', icon: <History size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div style={{ flex: 1 }}>
        {tab === 'check' && <CheckInTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'profile' && <ProfileTab />}
      </div>
      <nav className="tabs" style={{ display: 'flex' }}>
        {tabs.map(t => <button key={t.id} className={t.id === tab ? 'on' : ''} onClick={() => setTab(t.id)}>{t.icon}{t.label}</button>)}
      </nav>
    </div>
  )
}
