import { useState, useEffect, useCallback, Fragment } from 'react'
import { LayoutDashboard, MapPin, Users, Calendar, History, RefreshCw, Plus, Search, Flag, X, CheckCircle2, AlertCircle, Clock, Camera, Pen, ChevronLeft, ChevronRight, ChevronDown, Phone, Trash2, FileText, PhoneCall, ListChecks, Download } from 'lucide-react'
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { supabase, createUserAccount } from '../lib/supabase'
import { downloadProposalPptx } from '../lib/proposalPptx'
import { CallLogs, TeamTasks, LogCall } from './CrmTools'
import TimeClockPage, { ClockWidget } from './TimeClock'
import { useAuth } from '../stores/auth'
import Topbar from '../components/Topbar'

const dur = (a, b) => { if (!a || !b) return '—'; const m = Math.round((new Date(b) - new Date(a)) / 60000); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m` }
// generic CSV download (client-side, no data leaves the browser)
function downloadCSV(filename, cols, rows) {
  const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  const csv = [cols.map(c => esc(c.label)).join(',')]
    .concat((rows || []).map(r => cols.map(c => esc(c.get ? c.get(r) : r[c.key])).join(',')))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
const norm = s => (s || '').replace(/\D/g, '')
const mapUrl = (lat, lng) => (lat != null && lng != null) ? `https://www.google.com/maps?q=${lat},${lng}` : null
const photoLinks = (arr, label) => (arr || []).map((u, i) => (
  <a key={label + i} href={u} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }}><Camera size={10} /> {label}{arr.length > 1 ? ` ${i + 1}` : ''}</a>
))
const proofCount = v => (v.before_photos?.length || 0) + (v.after_photos?.length || 0) + ((!v.before_photos?.length && !v.after_photos?.length && v.photo_url) ? 1 : 0)
/* full-width proof panel shown under a visit row when expanded */
function ProofPanel({ v }) {
  const bn = v.before_photos?.length || 0, an = v.after_photos?.length || 0
  const gps = mapUrl(v.check_in_lat, v.check_in_lng)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--r)' }}>
      {gps && <div><div className="sec-t" style={{ marginBottom: 4 }}>GPS</div><a href={gps} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><MapPin size={11} /> Check-in location</a></div>}
      {bn > 0 && <div><div className="sec-t" style={{ marginBottom: 4 }}>Before ({bn})</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{photoLinks(v.before_photos, 'B')}</div></div>}
      {an > 0 && <div><div className="sec-t" style={{ marginBottom: 4 }}>After ({an})</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{photoLinks(v.after_photos, 'A')}</div></div>}
      {!bn && !an && v.photo_url && <div><div className="sec-t" style={{ marginBottom: 4 }}>Photo</div><a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Camera size={11} /> Open</a></div>}
      {v.signature_url && <div><div className="sec-t" style={{ marginBottom: 4 }}>Signature</div><a href={v.signature_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Pen size={11} /> Open</a></div>}
    </div>
  )
}
function Bdg({ s }) {
  if (s === 'checked_in') return <span className="bdg bdg-g pulse">Active</span>
  if (s === 'checked_out') return <span className="bdg bdg-x">Done</span>
  if (s === 'flagged') return <span className="bdg bdg-r"><Flag size={9} />Flagged</span>
  return null
}

/* ═══ DASHBOARD ═══ */
function Dashboard({ go }) {
  const { profile } = useAuth()
  const isMgr = profile?.role === 'manager'
  const [s, setS] = useState({ active: 0, today: 0, week: 0, sites: 0, flagged: 0 })
  const [recent, setRecent] = useState([])
  const [todayJobs, setTodayJobs] = useState([])
  const [bids, setBids] = useState([])
  const [leads, setLeads] = useState([])
  const [expiring, setExpiring] = useState([])
  const [busy, setBusy] = useState(true)

  const load = useCallback(async () => {
    setBusy(true)
    const td = startOfDay(new Date()).toISOString(), wk = subDays(new Date(), 7).toISOString()
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const in30 = format(new Date(Date.now() + 30 * 864e5), 'yyyy-MM-dd')
    const [a, t, w, si, fl, r, sc, bd, ld, cp] = await Promise.all([
      supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'checked_in'),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', td),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', wk),
      supabase.from('locations').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
      supabase.from('visits').select('*, profiles(full_name), locations(name, city)').order('created_at', { ascending: false }).limit(6),
      supabase.from('schedule').select('*').eq('service_date', todayStr).order('location_name'),
      supabase.from('bids').select('*').eq('status', 'prospect').gte('due_date', todayStr).order('due_date').limit(6),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('leads').select('id,name,company,lead_type,gl_expiry,wc_expiry,gl_received,wc_received,has_employees').in('lead_type', ['cleaner', 'landscaper']),
    ])
    setS({ active: a.count || 0, today: t.count || 0, week: w.count || 0, sites: si.count || 0, flagged: fl.count || 0 })
    setRecent(r.data || []); setTodayJobs(sc.data || []); setBids(bd.data || []); setLeads(ld.data || [])
    // compliance: subs whose GL/WC is expired or expiring within 30 days
    const exp = []
    ;(cp.data || []).forEach(l => {
      const issues = []
      if (l.gl_received && l.gl_expiry) { if (l.gl_expiry < todayStr) issues.push('GL EXPIRED'); else if (l.gl_expiry <= in30) issues.push(`GL exp ${l.gl_expiry}`) }
      if (l.has_employees && l.wc_received && l.wc_expiry) { if (l.wc_expiry < todayStr) issues.push('WC EXPIRED'); else if (l.wc_expiry <= in30) issues.push(`WC exp ${l.wc_expiry}`) }
      if (issues.length) exp.push({ ...l, issues })
    })
    exp.sort((x, y) => (x.gl_expiry || x.wc_expiry || '').localeCompare(y.gl_expiry || y.wc_expiry || ''))
    setExpiring(exp)
    setBusy(false)
  }, [])
  useEffect(() => { load() }, [load])

  const doneToday = todayJobs.filter(j => j.status === 'completed').length
  const in14 = format(new Date(Date.now() + 14 * 864e5), 'yyyy-MM-dd')

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</h1><p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 2 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p></div>
        <button className="btn btn-g btn-sm" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>
      <div className="stats" style={{ marginBottom: 16 }}>
        {[{ l: 'On Site Now', v: s.active, g: true }, { l: 'Scheduled Today', v: todayJobs.length, b: true }, { l: 'Flagged', v: s.flagged, r: true }, { l: 'Open Bids', v: bids.length }, { l: 'This Week', v: s.week }, { l: 'Active Sites', v: s.sites }].map(x => (
          <div key={x.l} className="stat" style={x.g && s.active > 0 ? { borderColor: 'var(--g-edge)', boxShadow: '0 0 20px var(--g-glow)' } : x.r && s.flagged > 0 ? { borderColor: 'rgba(224,82,82,.35)' } : {}}>
            <div className="stat-n" style={{ color: x.g && s.active > 0 ? 'var(--g-light)' : x.r && s.flagged > 0 ? 'var(--red)' : x.b && todayJobs.length > 0 ? 'var(--blue)' : undefined }}>{x.v}</div><div className="stat-l">{x.l}</div>
          </div>
        ))}
      </div>
      {s.flagged > 0 && <div className="alrt alrt-err" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => go('visits')}><Flag size={15} />{s.flagged} flagged visit{s.flagged > 1 ? 's' : ''} need review →</div>}

      {isMgr && expiring.length > 0 && <div className="alrt" style={{ display: 'block', background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.25)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--yellow)', marginBottom: 8 }}><AlertCircle size={14} /> {expiring.length} sub{expiring.length > 1 ? 's' : ''} with insurance expired or expiring in 30 days — collect updated COI</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {expiring.slice(0, 6).map(l => (
            <div key={l.id} onClick={() => go('leads')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 10, background: 'var(--bg3)', borderRadius: 6, padding: '7px 10px', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{l.name}<span style={{ color: 'var(--t3)', fontWeight: 400 }}> · {l.lead_type === 'landscaper' ? 'Landscaping' : 'Janitorial'}</span></span>
              <span style={{ color: l.issues.some(i => i.includes('EXPIRED')) ? 'var(--red)' : 'var(--yellow)', fontSize: 12, whiteSpace: 'nowrap' }}>{l.issues.join(' · ')}</span>
            </div>
          ))}
          {expiring.length > 6 && <button className="btn btn-g btn-sm" style={{ alignSelf: 'flex-start', marginTop: 2 }} onClick={() => go('leads')}>View all {expiring.length} in Leads →</button>}
        </div>
      </div>}

      {/* Row 1 — Today's Route  |  Bid Deadlines */}
      <div className={isMgr ? 'fg2' : ''} style={{ marginBottom: 18 }}>
        <div>
          <div className="sec-hd"><span className="sec-t">Today's Route — {doneToday}/{todayJobs.length} done</span><button className="btn btn-g btn-sm" onClick={() => go('cal')}>Calendar →</button></div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {todayJobs.length === 0 ? <div className="empty" style={{ padding: 26 }}><Calendar size={22} /><p>No jobs scheduled today</p></div> :
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>{todayJobs.map(j => (
                <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                  <div><span style={{ fontWeight: 600 }}>{j.location_name}</span><span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 8 }}>{j.service_type}{j.subcontractor ? ` · ${j.subcontractor}` : ''}</span></div>
                  <span className={`bdg ${j.status === 'completed' ? 'bdg-g' : 'bdg-x'}`}>{j.status === 'completed' ? '✓ Done' : j.status}</span>
                </div>
              ))}</div>}
          </div>
        </div>
        {isMgr && <div>
          <div className="sec-hd"><span className="sec-t">Bid Deadlines</span><button className="btn btn-g btn-sm" onClick={() => go('bids')}>Bid Tracker →</button></div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {bids.length === 0 ? <div className="empty" style={{ padding: 26 }}><FileText size={22} /><p>No open bids</p></div> :
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>{bids.map(b => {
                const wSoon = b.walkthrough_date && b.walkthrough_date >= format(new Date(), 'yyyy-MM-dd') && b.walkthrough_date <= in14
                return (
                  <div key={b.id} onClick={() => go('bids')} style={{ cursor: 'pointer', padding: '10px 14px', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600 }}>{b.project}</span>
                      {b.gate && <span className={`bdg ${b.gate === 'PASS' ? 'bdg-g' : 'bdg-x'}`} style={{ fontSize: 9, flexShrink: 0 }}>{b.gate}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{b.city || b.county} · closes {b.due_date}{b.walkthrough_date ? <span style={{ color: wSoon ? 'var(--yellow)' : 'var(--t3)' }}> · walk {b.walkthrough_date}</span> : ''}</div>
                  </div>
                )
              })}</div>}
          </div>
        </div>}
      </div>

      {/* Row 2 — Recent Lead Activity  |  Recent Visits */}
      <div className={isMgr ? 'fg2' : ''}>
        {isMgr && <div>
          <div className="sec-hd"><span className="sec-t">Recent Lead Activity</span><button className="btn btn-g btn-sm" onClick={() => go('leads')}>Leads →</button></div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {leads.length === 0 ? <div className="empty" style={{ padding: 26 }}><Phone size={22} /><p>No leads yet</p></div> :
              leads.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                  <div><div style={{ fontWeight: 600 }}>{l.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{l.lead_type === 'cleaner' ? 'Janitorial' : l.lead_type === 'landscaper' ? 'Landscaping' : 'Customer'}{l.company ? ` · ${l.company}` : ''}</div></div>
                  <span className={`bdg ${l.status === 'won' ? 'bdg-g' : l.status === 'lost' ? 'bdg-r' : 'bdg-x'}`}>{l.status}</span>
                </div>
              ))}
          </div>
        </div>}
        <div>
          <div className="sec-hd"><span className="sec-t">Recent Visits</span><button className="btn btn-g btn-sm" onClick={() => go('visits')}>All Visits →</button></div>
          <div className="card card-f">
            {busy ? <div className="loader"><div className="spin" /></div> : recent.length === 0 ? <div className="empty"><Clock size={24} /><p>No visits yet</p></div> : (
              <div className="tw"><table><thead><tr><th>Crew</th><th>Location</th><th>In</th><th>Dur</th><th>Status</th></tr></thead><tbody>
                {recent.map(v => <tr key={v.id}><td style={{ fontWeight: 600 }}>{v.profiles?.full_name}</td><td><div>{v.locations?.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.locations?.city}</div></td><td className="mono" style={{ fontSize: 12 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d, h:mm a') : '—'}</td><td className="mono" style={{ fontSize: 12 }}>{dur(v.check_in_at, v.check_out_at)}</td><td><Bdg s={v.status} /></td></tr>)}
              </tbody></table></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ CALENDAR ═══ */
function CalendarView() {
  const { profile } = useAuth()
  const canEdit = profile?.role === 'manager'
  const [month, setMonth] = useState(new Date())
  const [visits, setVisits] = useState([])
  const [sched, setSched] = useState([])
  const [selDay, setSelDay] = useState(null)
  const [dayVisits, setDayVisits] = useState([])
  const [daySched, setDaySched] = useState([])
  const [locs, setLocs] = useState([])
  const [addJob, setAddJob] = useState(false), [savingJob, setSavingJob] = useState(false)
  const jobBlank = { service_date: format(new Date(), 'yyyy-MM-dd'), service_type: 'Landscaping', location_name: '', subcontractor: '', status: 'scheduled' }
  const [job, setJob] = useState(jobBlank)

  const loadSched = useCallback(async () => {
    const sd = format(startOfMonth(month), 'yyyy-MM-dd'), ed = format(endOfMonth(month), 'yyyy-MM-dd')
    const { data } = await supabase.from('schedule').select('*').gte('service_date', sd).lte('service_date', ed).order('service_date')
    setSched(data || [])
  }, [month])

  useEffect(() => {
    const s = startOfMonth(month).toISOString(), e = endOfMonth(month).toISOString()
    supabase.from('visits').select('*, profiles(full_name), locations(name, city)').gte('check_in_at', s).lte('check_in_at', e).order('check_in_at').then(({ data }) => setVisits(data || []))
    loadSched()
  }, [month, loadSched])

  useEffect(() => { supabase.from('locations').select('name').eq('active', true).order('name').then(({ data }) => setLocs(data || [])) }, [])

  const saveJob = async e => {
    e.preventDefault(); setSavingJob(true)
    await supabase.from('schedule').insert(job)
    setJob(jobBlank); setAddJob(false); setSavingJob(false)
    await loadSched()
  }
  const updateJob = async (j, action) => {
    if (action === 'delete') {
      if (!window.confirm(`Remove ${j.location_name} from ${j.service_date}?`)) return
      await supabase.from('schedule').delete().eq('id', j.id)
      setDaySched(prev => prev.filter(x => x.id !== j.id))
    } else {
      await supabase.from('schedule').update({ status: action }).eq('id', j.id)
      setDaySched(prev => prev.map(x => x.id === j.id ? { ...x, status: action } : x))
    }
    await loadSched()
  }

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDow = getDay(startOfMonth(month))
  const blanks = Array(firstDow).fill(null)
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // schedule dates are 'yyyy-MM-dd' — compare as local calendar day
  const schedOn = (d) => sched.filter(x => x.service_date === format(d, 'yyyy-MM-dd'))

  const selectDay = (d) => {
    setSelDay(d)
    setDayVisits(visits.filter(v => v.check_in_at && isSameDay(new Date(v.check_in_at), d)))
    setDaySched(schedOn(d))
  }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-p btn-sm" onClick={() => setAddJob(!addJob)} style={{ marginRight: 6 }}>{addJob ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Job</>}</button>
          <button className="btn btn-g btn-sm" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={14} /></button>
          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 130, textAlign: 'center' }}>{format(month, 'MMMM yyyy')}</span>
          <button className="btn btn-g btn-sm" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>
      {addJob && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>New Scheduled Job</div>
          <form onSubmit={saveJob}>
            <div className="fg2" style={{ marginBottom: 14 }}>
              <div className="field"><label className="field-lbl">Date</label><input className="inp" type="date" value={job.service_date} onChange={e => setJob({ ...job, service_date: e.target.value })} required /></div>
              <div className="field"><label className="field-lbl">Location</label>
                <input className="inp" list="loc-list" placeholder="Type or pick a location" value={job.location_name} onChange={e => setJob({ ...job, location_name: e.target.value })} required />
                <datalist id="loc-list">{locs.map(l => <option key={l.name} value={l.name} />)}</datalist>
              </div>
              <div className="field"><label className="field-lbl">Service Type</label><select className="inp" value={job.service_type} onChange={e => setJob({ ...job, service_type: e.target.value })}><option>Landscaping</option><option>Janitorial</option></select></div>
              <div className="field"><label className="field-lbl">Subcontractor</label><input className="inp" placeholder="e.g. Freddi" value={job.subcontractor} onChange={e => setJob({ ...job, subcontractor: e.target.value })} /></div>
              <div className="field"><label className="field-lbl">Status</label><select className="inp" value={job.status} onChange={e => setJob({ ...job, status: e.target.value })}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="skipped">Skipped</option></select></div>
            </div>
            <button className="btn btn-p" type="submit" disabled={savingJob}>{savingJob ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Add to Calendar'}</button>
          </form>
        </div>
      )}
      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div className="cal-grid">
          {dows.map(d => <div key={d} className="cal-hdr">{d}</div>)}
          {blanks.map((_, i) => <div key={`b${i}`} className="cal-day other" />)}
          {days.map(d => {
            const dv = visits.filter(v => v.check_in_at && isSameDay(new Date(v.check_in_at), d))
            const sv = schedOn(d)
            const active = dv.some(v => v.status === 'checked_in')
            const flagged = dv.some(v => v.status === 'flagged')
            return (
              <div key={d.toISOString()} className={`cal-day ${isToday(d) ? 'today' : ''} ${selDay && isSameDay(d, selDay) ? 'today' : ''}`} onClick={() => selectDay(d)}>
                <div className="cal-num">{format(d, 'd')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {dv.length > 0 && <span className={`cal-dot ${active ? 'green' : flagged ? 'red' : 'gray'}`} />}
                  {dv.length > 1 && <span style={{ fontSize: 10, color: 'var(--t3)' }}>{dv.length}</span>}
                  {sv.length > 0 && <span className="cal-dot blue" />}
                  {sv.length > 0 && <span style={{ fontSize: 10, color: 'var(--blue)' }}>{sv.length}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {selDay && (
        <div>
          {daySched.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="sec-hd"><span className="sec-t">Scheduled — {daySched.length} job{daySched.length !== 1 ? 's' : ''}</span></div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {daySched.map(j => (
                  <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{j.location_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{j.service_type}{j.subcontractor ? ` · ${j.subcontractor}` : ''}</div>
                    </div>
                    {canEdit ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={j.status} onChange={e => updateJob(j, e.target.value)}>
                          <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="skipped">Skipped</option>
                        </select>
                        <button className="btn btn-d btn-sm" onClick={() => updateJob(j, 'delete')} title="Remove job"><Trash2 size={11} /></button>
                      </div>
                    ) : <span className={`bdg ${j.status === 'completed' ? 'bdg-g' : 'bdg-x'}`}>{j.status}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="sec-hd"><span className="sec-t">{format(selDay, 'MMMM d, yyyy')} — {dayVisits.length} visit{dayVisits.length !== 1 ? 's' : ''}</span></div>
          {dayVisits.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 30, color: 'var(--t3)', fontSize: 13 }}>{daySched.length > 0 ? 'No clock-ins yet on this day' : 'No visits on this day'}</div> : (
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
                {v.notes && <div style={{ fontSize: 12, color: 'var(--yellow)', marginTop: 8 }}>📝 {v.notes}</div>}
                {(v.photo_url || v.signature_url || v.before_photos?.length || v.after_photos?.length || mapUrl(v.check_in_lat, v.check_in_lng)) && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {mapUrl(v.check_in_lat, v.check_in_lng) && <a href={mapUrl(v.check_in_lat, v.check_in_lng)} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><MapPin size={11} /> GPS</a>}
                    {photoLinks(v.before_photos, 'Before')}
                    {photoLinks(v.after_photos, 'After')}
                    {!v.before_photos?.length && !v.after_photos?.length && v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Camera size={11} /> Photo</a>}
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
  const [q, setQ] = useState(''), [status, setSt] = useState('all'), [days, setDays] = useState('7'), [flagErr, setFlagErr] = useState(''), [openProof, setOpenProof] = useState(null)

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
  const del = async (v) => {
    if (!window.confirm(`Delete this check-in — ${v.profiles?.full_name || 'crew'} at ${v.locations?.name || 'location'}? This frees the route stop and can't be undone.`)) return
    setFlagErr('')
    const { error } = await supabase.rpc('manager_delete_visit', { v_id: v.id })
    if (error) { setFlagErr(error.message); return }
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
            {filtered.map(v => { const n = proofCount(v); const hasProof = n > 0 || mapUrl(v.check_in_lat, v.check_in_lng) || v.signature_url; const isOpen = openProof === v.id; return <Fragment key={v.id}>
              <tr>
              <td><div style={{ fontWeight: 600 }}>{v.profiles?.full_name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.profiles?.phone}</div></td>
              <td><div>{v.locations?.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.locations?.city}</div>{v.notes && <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 2 }} title={v.notes}>📝 {v.notes.length > 44 ? v.notes.slice(0, 44) + '…' : v.notes}</div>}</td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d h:mm a') : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_out_at ? format(new Date(v.check_out_at), 'h:mm a') : v.status === 'checked_in' ? <span className="bdg bdg-g" style={{ fontSize: 10 }}>Live</span> : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{dur(v.check_in_at, v.check_out_at)}</td>
              <td><Bdg s={v.status} /></td>
              <td>{hasProof ? <button className="btn btn-g btn-sm" onClick={() => setOpenProof(isOpen ? null : v.id)}><Camera size={11} /> Proof{n ? ` (${n})` : ''} <ChevronDown size={11} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }} /></button> : <span style={{ color: 'var(--t3)', fontSize: 12 }}>—</span>}</td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {v.status === 'flagged' ? <button className="btn btn-g btn-sm" onClick={() => flag(v, v.check_out_at ? 'checked_out' : 'checked_in')}>Unflag</button> : <button className="btn btn-d btn-sm" onClick={() => flag(v, 'flagged')}><Flag size={10} /></button>}
                <button className="btn btn-d btn-sm" style={{ marginLeft: 4 }} onClick={() => del(v)} title="Delete this check-in"><Trash2 size={10} /></button>
              </td>
              </tr>
              {isOpen && <tr><td colSpan={8} style={{ padding: '0 8px 10px' }}><ProofPanel v={v} /></td></tr>}
            </Fragment> })}
          </tbody></table></div>
        )}
      </div>
    </div>
  )
}

/* ═══ LOCATIONS ═══ */
function Locations() {
  const [locs, setLocs] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false)
  const blank = { name: '', address: '', city: '', service_type: 'Landscaping', phone: '', frequency: 'Weekly', subcontractor: '' }
  const [f, setF] = useState(blank)
  const load = async () => { const { data } = await supabase.from('locations').select('*').order('name'); setLocs(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => { e.preventDefault(); setSaving(true); await supabase.from('locations').insert({ ...f, active: true }); setF(blank); setAdd(false); setSaving(false); load() }
  const toggle = async l => { await supabase.from('locations').update({ active: !l.active }).eq('id', l.id); load() }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>Customers</h1><button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add</>}</button></div>
      {add && <div className="card" style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, marginBottom: 14 }}>New Location</div><form onSubmit={save}>
        <div className="fg2" style={{ marginBottom: 14 }}>
          {[['name', 'Name', true], ['address', 'Address'], ['city', 'City, State'], ['phone', 'Phone'], ['subcontractor', 'Subcontractor']].map(([k, l, r]) => <div key={k} className="field"><label className="field-lbl">{l}</label><input className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required={r} /></div>)}
          <div className="field"><label className="field-lbl">Service Type</label><select className="inp" value={f.service_type} onChange={e => setF({ ...f, service_type: e.target.value })}><option>Landscaping</option><option>Janitorial</option><option>Floor Care</option><option>Pressure Washing</option></select></div>
          <div className="field"><label className="field-lbl">Frequency</label><select className="inp" value={f.frequency} onChange={e => setF({ ...f, frequency: e.target.value })}><option>Weekly</option><option>Biweekly</option><option>Monthly</option></select></div>
        </div>
        <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save'}</button>
      </form></div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : <div className="tw"><table><thead><tr><th>Name</th><th>Address</th><th>Service</th><th>Freq</th><th>Sub</th><th>Status</th><th></th></tr></thead><tbody>
          {locs.map(l => <tr key={l.id}><td style={{ fontWeight: 600 }}><MapPin size={12} style={{ color: 'var(--g-light)', marginRight: 5 }} />{l.name}</td><td style={{ fontSize: 12 }}><div>{l.address}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{l.city}</div></td><td style={{ fontSize: 12 }}>{l.service_type}</td><td style={{ fontSize: 12 }}>{l.frequency || '—'}</td><td style={{ fontSize: 12 }}>{l.subcontractor || '—'}</td><td>{l.active ? <span className="bdg bdg-g">Active</span> : <span className="bdg bdg-x">Off</span>}</td><td><button className="btn btn-g btn-sm" onClick={() => toggle(l)}>{l.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
        </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ CREW / ACCOUNTS ═══ */
const ROLE_LABEL = { manager: 'Manager', subcontractor: 'Crew', viewer: 'Employee' }
const Badge = ({ n }) => n > 0 ? <span style={{ marginLeft: 'auto', background: 'var(--g)', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 7px', lineHeight: 1.6 }}>{n}</span> : null
function Crew() {
  const [people, setPeople] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false), [err, setErr] = useState(''), [ok, setOk] = useState('')
  const [f, setF] = useState({ full_name: '', email: '', password: '', phone: '', role: 'subcontractor' })
  const load = async () => { const { data } = await supabase.from('profiles').select('*').order('role').order('full_name'); setPeople(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => {
    e.preventDefault(); setSaving(true); setErr(''); setOk('')
    try {
      const { error } = await createUserAccount({ email: f.email, password: f.password, full_name: f.full_name, role: f.role, phone: f.phone })
      if (error) throw error
      setOk(`${ROLE_LABEL[f.role]} account created for ${f.full_name}. Login: ${f.email} / ${f.password}`)
      setF({ full_name: '', email: '', password: '', phone: '', role: 'subcontractor' }); setAdd(false); setTimeout(load, 1500)
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }
  const changeRole = async (p, role) => { await supabase.rpc('set_user_role', { target: p.id, new_role: role }); load() }
  const changeService = async (p, svc) => { await supabase.rpc('set_user_service', { target: p.id, svc }); load() }
  const del = async (p) => {
    setErr(''); setOk('')
    if (!window.confirm(`Permanently delete ${p.full_name}'s account and disconnect them completely?\n\nThis removes their login, visits, time punches and cannot be undone.`)) return
    const { error } = await supabase.rpc('admin_delete_user', { target: p.id })
    if (error) { setErr(error.message); return }
    setOk(`${p.full_name}'s account was deleted and fully disconnected.`); load()
  }

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>Accounts</h1><button className="btn btn-p" onClick={() => { setAdd(!add); setErr(''); setOk('') }}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Account</>}</button></div>
      {ok && <div className="alrt alrt-ok" style={{ marginBottom: 14 }}><CheckCircle2 size={14} />{ok}</div>}
      {err && <div className="alrt alrt-err" style={{ marginBottom: 14 }}><AlertCircle size={14} />{err}</div>}
      {add && <div className="card" style={{ marginBottom: 16 }}><div style={{ fontWeight: 700, marginBottom: 14 }}>New Account</div><p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 14 }}>Create a login and pick their role. Share email + password with them.</p><form onSubmit={save}>
        <div className="fg2" style={{ marginBottom: 14 }}>
          {[['full_name', 'Full Name', 'text', true], ['phone', 'Phone', 'text'], ['email', 'Email', 'email', true], ['password', 'Password', 'password', true]].map(([k, l, t, r]) => <div key={k} className="field"><label className="field-lbl">{l}</label><input className="inp" type={t} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required={r} /></div>)}
          <div className="field"><label className="field-lbl">Role</label>
            <select className="inp" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
              <option value="subcontractor">Crew (field app)</option>
              <option value="manager">Manager (full access)</option>
              <option value="viewer">Employee (cold-caller / Leads CRM)</option>
            </select>
          </div>
        </div>
        <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Create Account'}</button>
      </form></div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : people.length === 0 ? <div className="empty"><Users size={24} /><p>No accounts yet</p></div> : <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Service Line</th><th>Since</th><th></th></tr></thead><tbody>
          {people.map(c => <tr key={c.id}>
            <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="av">{c.full_name?.[0]}</div><span style={{ fontWeight: 600 }}>{c.full_name}</span></div></td>
            <td style={{ fontSize: 12 }}>{c.email}</td>
            <td style={{ fontSize: 12 }}>{c.phone || '—'}</td>
            <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.role} onChange={e => changeRole(c, e.target.value)}>
              <option value="subcontractor">Crew</option><option value="manager">Manager</option><option value="viewer">Employee</option>
            </select></td>
            <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.service_type || ''} onChange={e => changeService(c, e.target.value)}>
              <option value="">All services</option><option value="Janitorial">Janitorial</option><option value="Landscaping">Landscaping</option>
            </select></td>
            <td className="mono" style={{ fontSize: 11 }}>{c.created_at ? format(new Date(c.created_at), 'MMM d, yyyy') : '—'}</td>
            <td><button className="btn btn-d btn-sm" title={`Delete ${c.full_name}`} onClick={() => del(c)}><Trash2 size={12} /></button></td>
          </tr>)}
        </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ LEADS + CRM ═══ */
const LEAD_STATUS = ['new', 'contacted', 'won', 'lost']
/* Lead detail — module scope so its inputs keep focus; rendered inline under the clicked row */
function LeadDetail({ sel, cf, setCf, saveCf, savingCf, convertToCrew, converting, crewMsg, canManage, todayStr, createProposal, creating, convertToCustomer, props_, propLink, copyLink, copied, emailLink, delProp, setCallLead, setSel }) {
  return (
    <div className="card" style={{ marginBottom: 4, borderColor: 'var(--g-edge)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{sel.name}{sel.company ? ` · ${sel.company}` : ''}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-p btn-sm" onClick={() => setCallLead(sel)}><Phone size={12} /> Log Call</button>
          <button className="btn btn-g btn-sm" onClick={() => setSel(null)}><X size={12} /> Close</button>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label className="field-lbl">Call Notes</label>
        <textarea className="inp" rows={2} style={{ resize: 'vertical' }} placeholder="Log what happened on the call…" value={cf.notes || ''} onChange={e => setCf({ ...cf, notes: e.target.value })} />
      </div>
      {['cleaner', 'landscaper'].includes(sel.lead_type) ? (
        <>
          <div className="fg2" style={{ marginBottom: 12 }}>
            {[['contact_person', 'Contact / Owner'], ['phone', 'Phone'], ['email', 'Email (needed for login)']].map(([k, lb]) =>
              <div key={k} className="field"><label className="field-lbl">{lb}</label><input className="inp" value={cf[k] || ''} onChange={e => setCf({ ...cf, [k]: e.target.value })} /></div>)}
          </div>
          <div style={{ borderTop: '1px solid var(--bd)', marginTop: 12, paddingTop: 12 }}>
            <div className="sec-t" style={{ marginBottom: 8 }}>Compliance Documents</div>
            <div className="alrt alrt-ok" style={{ display: 'block', marginBottom: 12, fontSize: 12, lineHeight: 1.6 }}>
              ⓘ Collect from every sub: <b>General Liability</b> (required). <b>Workers' Comp</b> — required <b>only if they have employees</b>. Signed <b>Vendor Agreement</b> (we sub work to them; they agree not to solicit our accounts).
            </div>
            <div className="fg2" style={{ marginBottom: 12 }}>
              <div className="field"><label className="field-lbl">Has employees?</label>
                <button type="button" className={`btn btn-sm ${cf.has_employees ? 'btn-p' : 'btn-g'}`} style={{ width: '100%' }} onClick={() => setCf({ ...cf, has_employees: !cf.has_employees })}>{cf.has_employees ? "Yes — Workers' Comp required" : 'No — GL only'}</button>
              </div>
              <div className="field"><label className="field-lbl">Vendor Agreement</label>
                <select className="inp" value={cf.vendor_agreement || 'pending'} onChange={e => setCf({ ...cf, vendor_agreement: e.target.value })}><option value="pending">Pending</option><option value="sent">Sent</option><option value="signed">Signed</option></select>
              </div>
              <div className="field"><label className="field-lbl">General Liability (expiry)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className={`btn btn-sm ${cf.gl_received ? 'btn-p' : 'btn-g'}`} onClick={() => setCf({ ...cf, gl_received: !cf.gl_received })}>{cf.gl_received ? '✓ On file' : 'Missing'}</button>
                  <input type="date" className="inp" style={{ padding: '4px 6px', fontSize: 12 }} value={cf.gl_expiry || ''} onChange={e => setCf({ ...cf, gl_expiry: e.target.value })} />
                </div>
              </div>
              {cf.has_employees && <div className="field"><label className="field-lbl">Workers' Comp (expiry)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className={`btn btn-sm ${cf.wc_received ? 'btn-p' : 'btn-g'}`} onClick={() => setCf({ ...cf, wc_received: !cf.wc_received })}>{cf.wc_received ? '✓ On file' : 'Missing'}</button>
                  <input type="date" className="inp" style={{ padding: '4px 6px', fontSize: 12 }} value={cf.wc_expiry || ''} onChange={e => setCf({ ...cf, wc_expiry: e.target.value })} />
                </div>
              </div>}
            </div>
            {(() => {
              const glOk = cf.gl_received && (!cf.gl_expiry || cf.gl_expiry >= todayStr)
              const wcOk = !cf.has_employees || (cf.wc_received && (!cf.wc_expiry || cf.wc_expiry >= todayStr))
              const agOk = cf.vendor_agreement === 'signed'
              const miss = [
                (!cf.gl_received ? 'General Liability' : (cf.gl_expiry && cf.gl_expiry < todayStr) ? 'General Liability (EXPIRED)' : null),
                (cf.has_employees && (!cf.wc_received ? "Workers' Comp" : (cf.wc_expiry && cf.wc_expiry < todayStr) ? "Workers' Comp (EXPIRED)" : null)),
                (!agOk ? 'Signed Vendor Agreement' : null),
              ].filter(Boolean)
              const ok = glOk && wcOk && agOk
              return <div className={`alrt ${ok ? 'alrt-ok' : 'alrt-err'}`} style={{ fontSize: 13 }}>{ok ? <><CheckCircle2 size={14} /> Compliant — cleared to sub</> : <><AlertCircle size={14} /> Missing: {miss.join(' · ')}</>}</div>
            })()}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn btn-g btn-sm" onClick={saveCf} disabled={savingCf}>{savingCf ? 'Saving…' : 'Save Info'}</button>
            {canManage && <button className="btn btn-p btn-sm" onClick={convertToCrew} disabled={converting}>{converting ? 'Creating…' : '★ Convert to Crew'}</button>}
          </div>
          {crewMsg && <div className="alrt alrt-ok" style={{ marginTop: 12, wordBreak: 'break-word' }}><CheckCircle2 size={14} />{crewMsg}</div>}
        </>
      ) : (
        <>
          <div className="fg2" style={{ marginBottom: 12 }}>
            {[['contact_person', 'Contact Person'], ['property_address', 'Property Address'], ['square_footage', 'Square Footage'], ['building_type', 'Building Type'], ['service_frequency', 'Service Frequency (e.g. 3x/week)']].map(([k, lb]) =>
              <div key={k} className="field"><label className="field-lbl">{lb}</label><input className="inp" value={cf[k] || ''} onChange={e => setCf({ ...cf, [k]: e.target.value })} /></div>)}
            <div className="field"><label className="field-lbl">Service Type</label><select className="inp" value={cf.service_type} onChange={e => setCf({ ...cf, service_type: e.target.value })}><option>Janitorial</option><option>Landscaping</option><option>Property Care</option><option>Residential Turnover</option></select></div>
            <div className="field"><label className="field-lbl">Monthly Price ($)</label><input className="inp" type="number" value={cf.monthly_price} onChange={e => setCf({ ...cf, monthly_price: e.target.value })} /></div>
            <div className="field"><label className="field-lbl">Customer</label><button type="button" className={`btn btn-sm ${cf.is_job ? 'btn-p' : 'btn-g'}`} style={{ width: '100%' }} onClick={() => setCf({ ...cf, is_job: !cf.is_job })}>{cf.is_job ? '✓ Active Customer/Site' : 'Mark as Customer/Site'}</button></div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-g btn-sm" onClick={saveCf} disabled={savingCf}>{savingCf ? 'Saving…' : 'Save Info'}</button>
            {canManage && <button className="btn btn-p btn-sm" onClick={createProposal} disabled={creating}><Plus size={11} /> {creating ? 'Creating…' : 'Create Proposal'}</button>}
            {canManage && <button className="btn btn-g btn-sm" onClick={convertToCustomer} disabled={converting} style={{ marginLeft: 'auto' }}>{converting ? 'Converting…' : '★ Convert to Customer'}</button>}
          </div>
          {canManage && props_.length > 0 && <div style={{ borderTop: '1px solid var(--bd)', marginTop: 14, paddingTop: 12 }}>
            <div className="sec-t" style={{ marginBottom: 8 }}>Proposals</div>
            {props_.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--bd)', fontSize: 13, flexWrap: 'wrap' }}>
                <div><b>{p.monthly_price ? `$${p.monthly_price}/mo` : 'No price'}</b> · <span className={`bdg ${p.status === 'accepted' ? 'bdg-g' : 'bdg-x'}`}>{p.status}</span>{p.accepted_name ? ` · signed by ${p.accepted_name}` : ''}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <a className="btn btn-g btn-sm" href={propLink(p)} target="_blank" rel="noreferrer">Open</a>
                  <button className="btn btn-g btn-sm" onClick={() => copyLink(p)}>{copied === p.id ? 'Copied!' : 'Copy link'}</button>
                  <a className="btn btn-g btn-sm" href={emailLink(p)}>Email</a>
                  <button className="btn btn-g btn-sm" onClick={() => downloadProposalPptx(p)}>PPTX</button>
                  <button className="btn btn-d btn-sm" onClick={() => delProp(p)}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>}
        </>
      )}
    </div>
  )
}
const CALL_SCRIPTS = [
  {
    type: 'cleaner',
    t: 'Cleaners & Landscapers — Partner / Overflow',
    sub: "Not a sale — build a network of local owners you can hand overflow to (and who feed you work).",
    sections: [
      { h: 'Voicemail', b: "Hi [Name], this is Fernando from Great Way Environmental — commercial cleaning and landscaping out of Stockton. I'm reaching out to other cleaning owners in the area, nothing to sell you. I think there's a way we could send each other work. Call me back when you get a sec at [number]. Thanks [Name]." },
      { h: 'Opener (they pick up)', b: "Hey [Name], Fernando here — account manager at Great Way Environmental, commercial cleaning and landscaping over in [city]. I'll be straight with you: I'm not selling anything. I run into more work than my crews can cover sometimes, and I'd rather hand it to a solid local owner than a franchise. Figured it was worth introducing myself — how long have you been running your shop?" },
      { h: "Value — what's in it for them", b: "Here's the idea: when we win a contract that's too far or too big, instead of turning it down we sub it to a trusted local owner. You do the work, we handle the client and the billing, and you get steady accounts without chasing them. When you're slammed, you send us work the same way." },
      { h: 'Qualify', b: "What areas do you cover? … Do you run your own crew or is it just you and a couple guys? … Can you provide a COI — general liability, and workers' comp if you've got employees?" },
      { h: 'Objections', b: "\"What's the catch / how do you make money?\" → We keep the client relationship and a small margin for managing it and guaranteeing the work. You get paid to clean, not to sell.\n\n\"I already have enough work.\" → Perfect — that's exactly who I want in my back pocket when I'm overloaded. And if you hit a slow month, you know where to call.\n\n\"How do I know I'll get paid?\" → We invoice the client, you invoice us, net terms — in writing. Happy to start you on one small account so you can see how we operate." },
      { h: 'Close', b: "Let's do this — I'll add you to our sub network. To keep it clean I just need a COI showing general liability (and workers' comp if you have employees), and I'll send a simple one-page agreement that says we're subbing work to you. Cool if I text you my info and the doc?" },
    ],
    t_es: 'Limpiadores y Jardineros — Socio / Desborde',
    sub_es: 'No es una venta — cree una red de dueños locales a quienes pasarles trabajo (y que le pasen a usted).',
    sections_es: [
      { h: 'Buzón de voz', b: "Hola [Name], le habla Fernando de Great Way Environmental — limpieza comercial y jardinería aquí en Stockton. Estoy contactando a otros dueños de compañías de limpieza en el área, no es para venderle nada. Creo que hay una forma en que podríamos pasarnos trabajo el uno al otro. Devuélvame la llamada cuando pueda al [number]. Gracias [Name]." },
      { h: 'Apertura (contestan)', b: "¿Qué tal [Name]? Le habla Fernando — gerente de cuentas en Great Way Environmental, limpieza comercial y jardinería por [city]. Le voy a ser directo: no le estoy vendiendo nada. A veces me llega más trabajo del que mis cuadrillas pueden cubrir, y prefiero pasárselo a un dueño local serio que a una franquicia. Por eso quise presentarme — ¿cuánto tiempo lleva con su compañía?" },
      { h: 'Valor — qué gana él', b: "La idea es esta: cuando ganamos un contrato que queda muy lejos o muy grande, en vez de rechazarlo se lo damos a un dueño local de confianza. Usted hace el trabajo, nosotros manejamos el cliente y la facturación, y usted consigue cuentas fijas sin tener que salir a buscarlas. Y cuando usted esté full, nos pasa trabajo de la misma forma." },
      { h: 'Calificar', b: "¿Qué áreas cubre? … ¿Tiene su propia cuadrilla o es usted con un par de muchachos? … ¿Me puede dar un COI — responsabilidad general (general liability), y workers' comp si tiene empleados?" },
      { h: 'Objeciones', b: "\"¿Cuál es el truco / cómo ganan ustedes?\" → Nosotros mantenemos la relación con el cliente y un pequeño margen por administrarlo y garantizar el trabajo. A usted le pagan por limpiar, no por vender.\n\n\"Ya tengo suficiente trabajo.\" → Perfecto — usted es justo la persona que quiero tener a mano cuando esté sobrecargado. Y si le llega un mes flojo, ya sabe a quién llamar.\n\n\"¿Cómo sé que me van a pagar?\" → Nosotros le facturamos al cliente, usted nos factura a nosotros, con términos por escrito. Con gusto empezamos con una cuenta pequeña para que vea cómo trabajamos." },
      { h: 'Cierre', b: "Hagamos esto — lo agrego a nuestra red de subcontratistas. Para dejarlo todo en orden solo necesito un COI que muestre responsabilidad general (general liability) — y workers' comp si tiene empleados — y le mando un acuerdo sencillo de una página que dice que le estamos pasando trabajo a usted. ¿Le parece bien si le mando mi información y el documento por mensaje?" },
    ],
    sections_quick: [
      { h: 'Voicemail', b: "Hi [Name], Fernando with Great Way Environmental in Stockton — commercial cleaning and landscaping. Not selling anything; I've got overflow work I'd rather hand to a good local owner. Call me at [number]." },
      { h: 'Opener', b: "Hey [Name], Fernando with Great Way Environmental. Real quick — I'm not selling anything. I get more cleaning and landscaping work than my crews can cover and I sub it to solid local owners. That something you'd want?" },
      { h: 'Value', b: "You do the work, we handle the client and billing, you get steady accounts. When you're slammed, you send us work too." },
      { h: 'Qualify', b: "You the owner? … What areas do you cover? … Room for more work? … You carry a COI — general liability, plus workers' comp if you have employees?" },
      { h: 'Objections', b: "\"How do you make money?\" → Small margin for managing the client.\n\"Already busy?\" → Perfect — you're my backup for overflow.\n\"Will I get paid?\" → We invoice the client, you invoice us, net terms in writing." },
      { h: 'Close', b: "I'll add you to our sub list. Send me your COI and I'll text a one-page sub agreement. Cool?" },
    ],
    sections_quick_es: [
      { h: 'Buzón de voz', b: "Hola [Name], Fernando de Great Way Environmental en Stockton — limpieza comercial y jardinería. No es para venderle nada; tengo trabajo de sobra que prefiero pasarle a un buen dueño local. Llámeme al [number]." },
      { h: 'Apertura', b: "¿Qué tal [Name]? Fernando de Great Way Environmental. Rápido — no le vendo nada. Me llega más trabajo de limpieza y jardinería del que cubro y se lo paso a dueños locales serios. ¿Le interesa?" },
      { h: 'Valor', b: "Usted hace el trabajo, nosotros manejamos el cliente y la facturación, y usted consigue cuentas fijas. Cuando esté full, usted nos pasa trabajo también." },
      { h: 'Calificar', b: "¿Es usted el dueño? … ¿Qué áreas cubre? … ¿Espacio para más trabajo? … ¿Tiene COI — responsabilidad general, y workers' comp si tiene empleados?" },
      { h: 'Objeciones', b: "\"¿Cómo ganan?\" → Un margen pequeño por manejar al cliente.\n\"¿Ya ocupado?\" → Perfecto — usted es mi respaldo para el desborde.\n\"¿Me pagan?\" → Facturamos al cliente, usted nos factura, términos por escrito." },
      { h: 'Cierre', b: "Lo agrego a la lista de subcontratistas. Mándeme su COI y le paso un acuerdo de una página por mensaje. ¿Le parece?" },
    ],
  },
  {
    type: 'customer',
    t: 'Customers — Bundle Pitch (Janitorial + Landscaping)',
    sub: 'Goal: book a 10-minute walkthrough.',
    sections: [
      { h: 'Opener', b: "Hi [Name], this is Fernando with Great Way Environmental — we handle both commercial janitorial and landscaping out of [city]. Quick reason for the call: most properties pay two separate vendors for cleaning and grounds. We bundle both under one contract — one crew, one invoice, one point of contact." },
      { h: 'Value', b: "Bundling means you stop playing middleman between the cleaner and the landscaper. One crew, one point of contact — if something's off, you call one number and it's handled." },
      { h: 'Social proof', b: "We already take care of the G&C, Lexus, and Hilton locations near you, so we're out in your area every week anyway." },
      { h: 'Qualify', b: "Who handles your cleaning and landscaping right now — in-house or contracted? … Are you happy with them, or is it more 'it's fine'? … When does your current agreement come up?" },
      { h: 'Objections', b: "\"We're already under contract.\" → No problem — when's it up for renewal? I'll send a quick side-by-side so you're ready.\n\n\"Just send pricing.\" → Every property's different — the only way to give you a real number is a quick 10-minute walkthrough. No guessing, no obligation.\n\n\"We're happy with who we have.\" → Love that. Most of our clients were too — until one vendor for both turned out to be a lot less hassle.\n\n\"How much?\" → That's exactly what the walkthrough is for — I'd rather see the space and give you a real number than throw out a guess over the phone." },
      { h: 'Close', b: "Here's what I'd suggest: a fast 10-minute walkthrough, then I put together a bundled proposal you can review and sign online. No pressure either way. Does [day] morning or afternoon work better?" },
    ],
    t_es: 'Clientes — Oferta Combinada (Limpieza + Jardinería)',
    sub_es: 'Meta: agendar una visita de 10 minutos.',
    sections_es: [
      { h: 'Apertura', b: "Hola [Name], le habla Fernando de Great Way Environmental — nosotros manejamos tanto la limpieza comercial como la jardinería aquí en [city]. La razón de mi llamada es rápida: la mayoría de las propiedades están pagando dos proveedores distintos, uno para limpieza y otro para las áreas verdes. Nosotros combinamos los dos en un solo contrato — una sola cuadrilla, una sola factura, un solo contacto." },
      { h: 'Valor', b: "Al combinarlo, usted deja de ser el intermediario entre el de limpieza y el de jardinería. Una sola cuadrilla, un solo contacto — si algo sale mal, llama a un solo número y se resuelve." },
      { h: 'Prueba social', b: "Ya nos encargamos de las ubicaciones de G&C, Lexus y Hilton cerca de usted, así que de todos modos estamos por su zona cada semana." },
      { h: 'Calificar', b: "¿Quién maneja su limpieza y jardinería ahora mismo — personal propio o contratado? … ¿Está contento con ellos, o es más bien un 'ahí va'? … ¿Cuándo se le vence el contrato actual?" },
      { h: 'Objeciones', b: "\"Ya estamos bajo contrato.\" → No hay problema — no le estoy pidiendo que rompa nada. ¿Cuándo se le vence? Le mando una comparación rápida para que esté listo.\n\n\"Solo mándeme el precio.\" → Cada propiedad es diferente — la única forma de darle un número real es una visita rápida de 10 minutos. Sin adivinar, sin compromiso.\n\n\"Estamos contentos con los que tenemos.\" → Me encanta. La mayoría de nuestros clientes también lo estaban — hasta que tener un solo proveedor para ambas cosas les resultó mucho menos complicado.\n\n\"¿Cuánto cuesta?\" → Para eso es justamente la visita — prefiero ver el espacio y darle un número real en vez de tirar un estimado por teléfono." },
      { h: 'Cierre', b: "Le propongo esto: una visita rápida de 10 minutos, le preparo una propuesta combinada que puede revisar y firmar en línea, y si no mejora lo que ya tiene, no pasa nada. ¿Le sirve mejor [day] por la mañana o por la tarde?" },
    ],
    sections_quick: [
      { h: 'Opener', b: "Hi [Name], Fernando with Great Way Environmental. Quick one — most properties pay two vendors, one for cleaning and one for grounds. We do both under one contract: one crew, one invoice, one contact." },
      { h: 'Value', b: "One number to call, no middleman between the cleaner and the landscaper." },
      { h: 'Social proof', b: "We already handle G&C, Lexus, and Hilton nearby — we're in your area every week." },
      { h: 'Qualify', b: "Who handles it now — in-house or contracted? … Happy with them? … When's your contract up?" },
      { h: 'Objections', b: "\"Under contract.\" → When's renewal? I'll send a quick comparison.\n\"Just send pricing.\" → Every property's different — a 10-min walkthrough gets you a real number.\n\"How much?\" → That's exactly what the walkthrough's for." },
      { h: 'Close', b: "Let's do a 10-minute walkthrough — I'll send a bundled proposal you can sign online. [day] morning or afternoon?" },
    ],
    sections_quick_es: [
      { h: 'Apertura', b: "Hola [Name], Fernando de Great Way Environmental. Rápido — casi todas las propiedades pagan dos proveedores, uno de limpieza y otro de jardinería. Nosotros hacemos ambos en un solo contrato: una cuadrilla, una factura, un contacto." },
      { h: 'Valor', b: "Un solo número, sin intermediar entre el de limpieza y el de jardinería." },
      { h: 'Prueba social', b: "Ya atendemos G&C, Lexus y Hilton cerca — estamos por su zona cada semana." },
      { h: 'Calificar', b: "¿Quién lo maneja ahora — propio o contratado? … ¿Contento con ellos? … ¿Cuándo se vence su contrato?" },
      { h: 'Objeciones', b: "\"Bajo contrato.\" → ¿Cuándo se vence? Le mando una comparación rápida.\n\"Mándeme precio.\" → Cada propiedad es distinta — una visita de 10 min le da un número real.\n\"¿Cuánto?\" → Para eso es justamente la visita." },
      { h: 'Cierre', b: "Hagamos una visita de 10 minutos — le mando una propuesta combinada que firma en línea. ¿[day] por la mañana o por la tarde?" },
    ],
  },
]
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s
function Leads() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'manager'   // employees (viewer) can work leads but not convert/propose
  const [leads, setLeads] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false), [filter, setFilter] = useState('all')
  const [scripts, setScripts] = useState(false), [scriptCopied, setScriptCopied] = useState(null), [callLead, setCallLead] = useState(null), [scriptLang, setScriptLang] = useState('en'), [scriptLen, setScriptLen] = useState('quick')
  const [leadType, setLeadType] = useState('customer')  // customer | cleaner
  const blank = { name: '', company: '', phone: '', email: '', source: '', notes: '' }
  const [f, setF] = useState(blank)
  const load = async () => { const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }); setLeads(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => { e.preventDefault(); setSaving(true); await supabase.from('leads').insert({ ...f, status: 'new', lead_type: leadType }); setF(blank); setAdd(false); setSaving(false); load() }
  const upd = async (id, patch) => { await supabase.from('leads').update(patch).eq('id', id); load() }
  const del = async (id) => { await supabase.from('leads').delete().eq('id', id); load() }

  // ── customer info + proposals ──
  const [sel, setSel] = useState(null), [props_, setProps] = useState([]), [cf, setCf] = useState({}), [savingCf, setSavingCf] = useState(false), [creating, setCreating] = useState(false), [copied, setCopied] = useState(null)
  const openLead = async (l) => {
    setSel(l)
    setCf({ contact_person: l.contact_person || '', phone: l.phone || '', email: l.email || '', property_address: l.property_address || '', square_footage: l.square_footage || '', building_type: l.building_type || '', service_frequency: l.service_frequency || '', service_type: l.service_type || 'Janitorial', monthly_price: l.monthly_price ?? '', is_job: !!l.is_job, has_employees: !!l.has_employees, gl_received: !!l.gl_received, gl_expiry: l.gl_expiry || '', wc_received: !!l.wc_received, wc_expiry: l.wc_expiry || '', vendor_agreement: l.vendor_agreement || 'pending', agreement_date: l.agreement_date || '', notes: l.notes || '' })
    setCrewMsg('')
    const { data } = await supabase.from('proposals').select('*').eq('lead_id', l.id).order('created_at', { ascending: false })
    setProps(data || [])
  }
  const saveCf = async () => {
    setSavingCf(true)
    await supabase.from('leads').update({ ...cf, monthly_price: cf.monthly_price === '' ? null : Number(cf.monthly_price), gl_expiry: cf.gl_expiry || null, wc_expiry: cf.wc_expiry || null, agreement_date: cf.agreement_date || null }).eq('id', sel.id)
    const { data } = await supabase.from('leads').select('*').eq('id', sel.id).single()
    if (data) setSel(data)
    setSavingCf(false); load()
  }
  const createProposal = async () => {
    setCreating(true)
    const { data, error } = await supabase.from('proposals').insert({
      lead_id: sel.id, service_type: cf.service_type || 'Janitorial',
      title: `Proposal for ${cf.service_type || 'Janitorial'} Services`,
      client_name: sel.name, company: sel.company, contact_person: cf.contact_person || sel.name,
      phone: sel.phone, email: sel.email, property_address: cf.property_address,
      square_footage: cf.square_footage, building_type: cf.building_type,
      service_frequency: cf.service_frequency, monthly_price: cf.monthly_price === '' ? null : Number(cf.monthly_price),
      status: 'draft',
    }).select().single()
    setCreating(false)
    if (!error && data) setProps(p => [data, ...p])
  }
  const [converting, setConverting] = useState(false)
  const convertToCustomer = async () => {
    if (!window.confirm(`Convert ${sel.name} to a customer? This marks the lead Won and adds it as a serviceable Location.`)) return
    setConverting(true)
    await supabase.from('leads').update({ ...cf, is_job: true, status: 'won', monthly_price: cf.monthly_price === '' ? null : Number(cf.monthly_price) }).eq('id', sel.id)
    const locName = sel.company || sel.name
    const { data: ex } = await supabase.from('locations').select('id').eq('name', locName).limit(1)
    if (!ex || ex.length === 0) {
      await supabase.from('locations').insert({ name: locName, address: cf.property_address || '', city: '', service_type: cf.service_type || 'Janitorial', frequency: cf.service_frequency || '', subcontractor: '', phone: sel.phone || '', active: true })
    }
    const { data } = await supabase.from('leads').select('*').eq('id', sel.id).single()
    if (data) { setSel(data); setCf(c => ({ ...c, is_job: true })) }
    setConverting(false); load()
  }
  const [crewMsg, setCrewMsg] = useState('')
  const convertToCrew = async () => {
    setCrewMsg('')
    if (!sel.email) { setCrewMsg('No email on file for this cleaner — add one (Save Info) before creating a login.'); return }
    const pw = 'GWE-' + Math.random().toString(36).slice(2, 7) + '!'
    if (!window.confirm(`Create a Crew login for ${sel.name} and mark the lead Won?`)) return
    setConverting(true)
    const { data, error } = await createUserAccount({ email: sel.email, password: pw, full_name: sel.company || sel.name, role: 'subcontractor', phone: sel.phone || '' })
    if (error) { setCrewMsg(error.message); setConverting(false); return }
    await supabase.from('leads').update({ status: 'won' }).eq('id', sel.id)
    const svcLine = sel.lead_type === 'landscaper' ? 'Landscaping' : 'Janitorial'
    if (data?.user?.id) setTimeout(() => supabase.rpc('set_user_service', { target: data.user.id, svc: svcLine }), 1500)
    setCrewMsg(`✅ Crew account created — login: ${sel.email} / ${pw}  (service line set to ${svcLine})`)
    setConverting(false); load()
  }
  const propLink = (p) => `${window.location.origin}/p/${p.share_token}`
  const copyLink = (p) => { try { navigator.clipboard.writeText(propLink(p)) } catch {} setCopied(p.id); setTimeout(() => setCopied(null), 1500) }
  const emailLink = (p) => `mailto:${sel.email || ''}?subject=${encodeURIComponent('Your Great Way Environmental Proposal')}&body=${encodeURIComponent(`Hi ${sel.contact_person || sel.name || ''},\n\nHere is your proposal from Great Way Environmental. You can review and sign it online:\n${propLink(p)}\n\nThank you,\nGreat Way Environmental\n(707) 718-3492`)}`
  const delProp = async (p) => { await supabase.from('proposals').delete().eq('id', p.id); setProps(ps => ps.filter(x => x.id !== p.id)) }

  const typed = leads.filter(l => (l.lead_type || 'customer') === leadType)
  const dead = l => l.status === 'lost'   // not interested / disconnected — sink to bottom
  const shown = (filter === 'all' ? typed : typed.filter(l => l.status === filter)).slice().sort((a, b) => (dead(a) ? 1 : 0) - (dead(b) ? 1 : 0))
  const dupLead = (add && f.phone && norm(f.phone).length >= 7) ? leads.find(l => norm(l.phone) === norm(f.phone)) : null
  const counts = LEAD_STATUS.reduce((a, s) => ({ ...a, [s]: typed.filter(l => l.status === s).length }), {})
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const dueSoon = (l) => l.status === 'contacted' && l.callback_date && l.callback_date <= todayStr
  const subCompliant = (l) => l.gl_received && (!l.gl_expiry || l.gl_expiry >= todayStr) && (!l.has_employees || (l.wc_received && (!l.wc_expiry || l.wc_expiry >= todayStr))) && l.vendor_agreement === 'signed'

  return (
    <div className="pg">
      {callLead && <LogCall lead={callLead} onClose={() => setCallLead(null)} onSaved={() => { load(); if (sel) openLead(sel) }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Leads</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-g" onClick={() => setScripts(!scripts)}><Phone size={13} /> {scripts ? 'Hide Scripts' : 'Call Scripts'}</button>
          <button className="btn btn-g" title="Export shown leads to CSV" onClick={() => downloadCSV(`gwe_leads_${leadType}_${todayStr}.csv`, [
            { label: 'Name', key: 'name' }, { label: 'Company', key: 'company' }, { label: 'Type', get: l => l.lead_type || 'customer' },
            { label: 'Contact', key: 'contact_person' }, { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' },
            { label: 'Status', key: 'status' }, { label: 'Callback', key: 'callback_date' }, { label: 'Source', key: 'source' },
            { label: 'GL exp', key: 'gl_expiry' }, { label: 'WC exp', key: 'wc_expiry' }, { label: 'Agreement', key: 'vendor_agreement' }, { label: 'Notes', key: 'notes' },
          ], shown)}><Download size={13} /> Export</button>
          <button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add {leadType === 'cleaner' ? 'Janitorial' : leadType === 'landscaper' ? 'Landscaper' : 'Customer'}</>}</button>
        </div>
      </div>
      {scripts && <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{ fontWeight: 700 }}>📞 {leadType === 'customer' ? 'Customer' : 'Partner'} Script{leadType === 'landscaper' ? ' (Landscaping)' : leadType === 'cleaner' ? ' (Janitorial)' : ''}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[['quick', 'Quick'], ['full', 'Full']].map(([v, lb]) => <button key={v} className={`btn btn-sm ${scriptLen === v ? 'btn-p' : 'btn-g'}`} onClick={() => setScriptLen(v)}>{lb}</button>)}
            <span style={{ width: 1, background: 'var(--bd2)', margin: '0 2px' }} />
            {[['en', 'EN'], ['es', 'ES']].map(([v, lb]) => <button key={v} className={`btn btn-sm ${scriptLang === v ? 'btn-p' : 'btn-g'}`} onClick={() => setScriptLang(v)}>{lb}</button>)}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>Swap [Name], [city], [number]. Never quote a price — book the walkthrough first. "Copy all" grabs the whole script.</p>
        {CALL_SCRIPTS.filter(s => s.type === (leadType === 'customer' ? 'customer' : 'cleaner')).map((s, i) => {
          const fullSecs = scriptLang === 'es' ? (s.sections_es || s.sections) : s.sections
          const quickSecs = scriptLang === 'es' ? (s.sections_quick_es || s.sections_quick || fullSecs) : (s.sections_quick || fullSecs)
          const secs = scriptLen === 'quick' ? quickSecs : fullSecs
          const title = scriptLang === 'es' ? (s.t_es || s.t) : s.t
          const sub = scriptLang === 'es' ? (s.sub_es || s.sub) : s.sub
          const full = `${title}\n\n` + secs.map(x => `${x.h}:\n${x.b}`).join('\n\n')
          return (
            <div key={i} style={{ borderTop: i ? '1px solid var(--bd)' : 'none', paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div><div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{sub}</div></div>
                <button className="btn btn-g btn-sm" style={{ flexShrink: 0 }} onClick={() => { try { navigator.clipboard.writeText(full) } catch { } setScriptCopied(i); setTimeout(() => setScriptCopied(null), 1500) }}>{scriptCopied === i ? 'Copied!' : 'Copy all'}</button>
              </div>
              {secs.map((x, j) => (
                <div key={j} style={{ marginBottom: 8 }}>
                  <div className="sec-t" style={{ marginBottom: 4 }}>{x.h}</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--bg3)', padding: '10px 12px', borderRadius: 'var(--r)' }}>{x.b}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['customer', 'Customers'], ['cleaner', 'Janitorial'], ['landscaper', 'Landscaping']].map(([v, lb]) => (
          <button key={v} className={`btn btn-sm ${leadType === v ? 'btn-p' : 'btn-g'}`} style={{ flex: 1, minWidth: 90 }} onClick={() => { setLeadType(v); setSel(null); setFilter('all') }}>{lb} ({leads.filter(l => (l.lead_type || 'customer') === v).length})</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {['all', ...LEAD_STATUS].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-p' : 'btn-g'}`} onClick={() => setFilter(s)}>{cap(s)}{s !== 'all' ? ` (${counts[s] || 0})` : ''}</button>
        ))}
      </div>
      {add && <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>New Lead</div>
        <form onSubmit={save}>
          <div className="fg2" style={{ marginBottom: 14 }}>
            {[['name', 'Name / Contact', true], ['company', 'Company'], ['phone', 'Phone'], ['email', 'Email'], ['source', 'Source (referral, web…)']].map(([k, l, r]) =>
              <div key={k} className="field"><label className="field-lbl">{l}</label><input className="inp" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required={r} /></div>)}
          </div>
          <div className="field" style={{ marginBottom: 14 }}><label className="field-lbl">Notes</label><input className="inp" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></div>
          {dupLead && <div className="alrt alrt-err" style={{ marginBottom: 12, fontSize: 12 }}><AlertCircle size={13} /> This phone is already on a lead: <b>{dupLead.name}</b> ({dupLead.status}). You can still save.</div>}
          <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save Lead'}</button>
        </form>
      </div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><Phone size={24} /><p>No leads{filter !== 'all' ? ` (${filter})` : ''}</p></div> :
          <div className="tw"><table><thead><tr><th>Lead</th><th>Contact</th><th>Status</th><th>Callback</th><th>Notes</th><th></th></tr></thead><tbody>
            {shown.map(l => { const isOpen = sel?.id === l.id; return <Fragment key={l.id}>
              <tr style={{ ...(dueSoon(l) ? { background: 'rgba(212,160,23,.06)' } : {}), ...(dead(l) ? { opacity: 0.5 } : {}), ...(isOpen ? { background: 'var(--bg-h)' } : {}) }}>
              <td><button type="button" onClick={() => isOpen ? setSel(null) : openLead(l)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}><ChevronDown size={13} style={{ color: 'var(--t3)', flexShrink: 0, transform: isOpen ? 'none' : 'rotate(-90deg)', transition: 'transform .12s' }} /><span><span style={{ fontWeight: 600, color: 'var(--g-light)', display: 'block' }}>{l.name}</span><span style={{ fontSize: 11, color: 'var(--t3)' }}>{l.company}{l.source ? ` · ${l.source}` : ''}</span></span></button></td>
              <td style={{ fontSize: 12 }}>{l.phone && <div><a href={`tel:${l.phone}`} style={{ color: 'var(--g-light)' }}>{l.phone}</a></div>}{l.email && <div style={{ color: 'var(--t3)' }}>{l.email}</div>}</td>
              <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={l.status} onChange={e => upd(l.id, { status: e.target.value })}>{LEAD_STATUS.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></td>
              <td><input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={l.callback_date || ''} onChange={e => upd(l.id, { callback_date: e.target.value || null })} />{dueSoon(l) && <div style={{ fontSize: 10, color: 'var(--yellow)', marginTop: 2 }}>due</div>}</td>
              <td style={{ fontSize: 12, color: 'var(--t3)', maxWidth: 200 }}>{['cleaner', 'landscaper'].includes(leadType) && <span className={`bdg ${subCompliant(l) ? 'bdg-g' : 'bdg-x'}`} style={{ marginRight: 6, fontSize: 9 }}>{subCompliant(l) ? '✓ DOCS' : 'DOCS'}</span>}{l.notes}</td>
              <td>{canManage && <button className="btn btn-d btn-sm" onClick={() => del(l.id)} title="Delete lead"><X size={11} /></button>}</td>
              </tr>
              {isOpen && <tr><td colSpan={6} style={{ padding: '0 8px 10px' }}><LeadDetail sel={sel} cf={cf} setCf={setCf} saveCf={saveCf} savingCf={savingCf} convertToCrew={convertToCrew} converting={converting} crewMsg={crewMsg} canManage={canManage} todayStr={todayStr} createProposal={createProposal} creating={creating} convertToCustomer={convertToCustomer} props_={props_} propLink={propLink} copyLink={copyLink} copied={copied} emailLink={emailLink} delProp={delProp} setCallLead={setCallLead} setSel={setSel} /></td></tr>}
            </Fragment> })}
          </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ BID TRACKER (manager only) ═══ */
const BID_STATUS = ['prospect', 'submitted', 'won', 'lost']
function Bids() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'manager'
  const [bids, setBids] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false), [filter, setFilter] = useState('all')
  const blank = { project: '', client: '', city: '', service_type: 'Janitorial', amount: '', due_date: '', contact: '', notes: '' }
  const [f, setF] = useState(blank)
  const load = async () => { const { data } = await supabase.from('bids').select('*').order('due_date', { ascending: true, nullsFirst: false }); setBids(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const save = async e => {
    e.preventDefault(); setSaving(true)
    await supabase.from('bids').insert({ ...f, amount: f.amount === '' ? null : Number(f.amount), due_date: f.due_date || null, status: 'prospect' })
    setF(blank); setAdd(false); setSaving(false); load()
  }
  const upd = async (id, patch) => { await supabase.from('bids').update(patch).eq('id', id); load() }
  const del = async (id) => { if (!window.confirm('Delete this bid?')) return; await supabase.from('bids').delete().eq('id', id); load() }

  const [selBid, setSelBid] = useState(null), [copiedEmail, setCopiedEmail] = useState(false), [showEmail, setShowEmail] = useState(false)
  const emailFor = (b) => b.intent_email || `Subject: GWE - Intent to Bid, ${b.solicitation_no || ''} ${b.project}\n\nHi ${(b.contact_name || '').split(' ')[0] || 'there'},\n\nGreat Way Environmental is a licensed, insured commercial janitorial contractor. We're reviewing ${b.solicitation_no || ''} - ${b.project}${b.issuer ? ` (${b.issuer}` : ''}${b.due_date ? `, closing ${b.due_date})` : b.issuer ? ')' : ''} and want to make sure our submission is complete.\n\nCould you confirm the walkthrough/registration steps and the required insurance & bond limits?\n\nAppreciate it,\nFernando Gonzalez\nGreat Way Environmental\n(707) 718-3492`
  const openBid = (b) => { setSelBid(b); setShowEmail(false) }
  const shown = filter === 'all' ? bids : bids.filter(b => b.status === filter)
  const counts = BID_STATUS.reduce((a, s) => ({ ...a, [s]: bids.filter(b => b.status === s).length }), {})
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const in14 = format(new Date(Date.now() + 14 * 864e5), 'yyyy-MM-dd')
  const overdue = (b) => b.status === 'prospect' && b.due_date && b.due_date < todayStr
  const walkSoon = (b) => b.walkthrough_date && b.walkthrough_date >= todayStr && b.walkthrough_date <= in14

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Bid Tracker</h1>
        {canManage && <button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Bid</>}</button>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {['all', ...BID_STATUS].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-p' : 'btn-g'}`} onClick={() => setFilter(s)}>{cap(s)}{s !== 'all' ? ` (${counts[s] || 0})` : ''}</button>
        ))}
      </div>
      {add && <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>New Bid</div>
        <form onSubmit={save}>
          <div className="fg2" style={{ marginBottom: 14 }}>
            <div className="field"><label className="field-lbl">Project / RFP</label><input className="inp" value={f.project} onChange={e => setF({ ...f, project: e.target.value })} required /></div>
            <div className="field"><label className="field-lbl">Client / Agency</label><input className="inp" value={f.client} onChange={e => setF({ ...f, client: e.target.value })} /></div>
            <div className="field"><label className="field-lbl">City</label><input className="inp" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} /></div>
            <div className="field"><label className="field-lbl">Service Type</label><select className="inp" value={f.service_type} onChange={e => setF({ ...f, service_type: e.target.value })}><option>Janitorial</option><option>Landscaping</option><option>Property Care</option><option>Other</option></select></div>
            <div className="field"><label className="field-lbl">Bid Amount ($)</label><input className="inp" type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></div>
            <div className="field"><label className="field-lbl">Due / Reminder Date</label><input className="inp" type="date" value={f.due_date} onChange={e => setF({ ...f, due_date: e.target.value })} /></div>
            <div className="field"><label className="field-lbl">Contact</label><input className="inp" value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} /></div>
          </div>
          <div className="field" style={{ marginBottom: 14 }}><label className="field-lbl">Notes</label><input className="inp" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></div>
          <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save Bid'}</button>
        </form>
      </div>}
      {selBid && (() => {
        const b = selBid
        return (
          <div className="card" style={{ marginBottom: 16, borderColor: b.gate === 'PASS' ? 'var(--g-edge)' : 'var(--bd2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>{b.project}</div><div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{b.issuer}{b.solicitation_no ? ` · ${b.solicitation_no}` : ''}</div></div>
              <button className="btn btn-g btn-sm" onClick={() => setSelBid(null)}><X size={12} /> Close</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {b.gate && <span className={`bdg ${b.gate === 'PASS' ? 'bdg-g' : 'bdg-x'}`}>{b.gate}</span>}
              {b.due_date && <span className="bdg bdg-x">Closes {b.due_date}</span>}
              {b.walkthrough_date && <span className={`bdg ${walkSoon(b) ? 'bdg-r' : 'bdg-x'}`}><Flag size={9} /> Walk {b.walkthrough_date}</span>}
              {b.questions_due && <span className="bdg bdg-x">Q's due {b.questions_due}</span>}
            </div>
            {b.reason && <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12 }}>{b.reason}</p>}
            <div className="alrt alrt-ok" style={{ display: 'block', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ⓘ Important Info</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div><b>Contact:</b> {b.contact_name || '—'} &nbsp;{b.contact_phone && <a href={`tel:${b.contact_phone}`} style={{ color: 'var(--g-light)' }}>{b.contact_phone}</a>} &nbsp;{b.contact_email && <a href={`mailto:${b.contact_email}`} style={{ color: 'var(--g-light)' }}>{b.contact_email}</a>}</div>
                <div><b>Walkthrough:</b> {b.walkthrough || '—'}</div>
                {b.scope && <div style={{ marginTop: 6 }}><b>Scope:</b> {b.scope}</div>}
              </div>
            </div>
            {b.steps_apply && <div style={{ marginBottom: 10 }}><div className="sec-t" style={{ marginBottom: 4 }}>Step-by-step — Apply / Submit</div><div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{b.steps_apply}</div></div>}
            {b.steps_walk && <div style={{ marginBottom: 12 }}><div className="sec-t" style={{ marginBottom: 4 }}>Step-by-step — Confirm Walkthrough</div><div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{b.steps_walk}</div></div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {b.portal_link && <a className="btn btn-p btn-sm" href={b.portal_link} target="_blank" rel="noreferrer"><FileText size={11} /> Open Portal</a>}
              <button className="btn btn-g btn-sm" onClick={() => setShowEmail(v => !v)}>✉ {showEmail ? 'Hide Email' : 'Email Template'}</button>
              {b.contact_phone && <a className="btn btn-g btn-sm" href={`tel:${b.contact_phone}`}><Phone size={11} /> Call</a>}
            </div>
            {showEmail && (() => {
              const txt = emailFor(b)
              const mail = `mailto:${b.contact_email || ''}?subject=${encodeURIComponent((txt.split('\n')[0] || '').replace(/^Subject:\s*/, ''))}&body=${encodeURIComponent(txt.split('\n').slice(2).join('\n'))}`
              return (
                <div style={{ marginTop: 12 }}>
                  <div className="sec-t" style={{ marginBottom: 6 }}>Intent-to-Bid Email {b.intent_email ? '' : '(auto-drafted)'}</div>
                  <textarea className="inp" rows={9} style={{ fontSize: 12, resize: 'vertical' }} defaultValue={txt} id={`bidmail-${b.id}`} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-g btn-sm" onClick={() => { const el = document.getElementById(`bidmail-${b.id}`); const v = el ? el.value : txt; try { navigator.clipboard.writeText(v) } catch { } setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 1500) }}>{copiedEmail ? 'Copied!' : 'Copy email'}</button>
                    {b.contact_email && <a className="btn btn-p btn-sm" href={mail}>Open in Mail</a>}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      })()}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><FileText size={24} /><p>No bids{filter !== 'all' ? ` (${filter})` : ''}</p></div> :
          <div className="tw"><table><thead><tr><th>Project</th><th>Client</th><th>Amount</th><th>Status</th><th>Due</th><th>Notes</th><th></th></tr></thead><tbody>
            {shown.map(b => <tr key={b.id} style={overdue(b) ? { background: 'rgba(224,82,82,.07)' } : walkSoon(b) ? { background: 'rgba(212,160,23,.06)' } : {}}>
              <td><button type="button" onClick={() => openBid(b)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}><div style={{ fontWeight: 600, color: 'var(--g-light)' }}>{b.project}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{b.gate && <span className={`bdg ${b.gate === 'PASS' ? 'bdg-g' : 'bdg-x'}`} style={{ marginRight: 6, fontSize: 9 }}>{b.gate}</span>}{b.city || b.county}{b.solicitation_no ? ` · ${b.solicitation_no}` : ''}</div></button></td>
              <td style={{ fontSize: 12 }}>{b.client || b.issuer}{b.walkthrough_date ? <div style={{ color: walkSoon(b) ? 'var(--yellow)' : 'var(--t3)' }}>walk {b.walkthrough_date}</div> : ''}</td>
              <td className="mono" style={{ fontSize: 12 }}>{b.amount != null ? `$${Number(b.amount).toLocaleString()}` : '—'}</td>
              <td>{canManage ? <select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={b.status} onChange={e => upd(b.id, { status: e.target.value, ...(e.target.value === 'submitted' && !b.submitted_date ? { submitted_date: todayStr } : {}) })}>{BID_STATUS.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select> : <span className={`bdg ${b.status === 'won' ? 'bdg-g' : b.status === 'lost' ? 'bdg-r' : 'bdg-x'}`}>{cap(b.status)}</span>}</td>
              <td>{canManage ? <input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={b.due_date || ''} onChange={e => upd(b.id, { due_date: e.target.value || null })} /> : <span className="mono" style={{ fontSize: 12 }}>{b.due_date || '—'}</span>}{overdue(b) && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>overdue</div>}</td>
              <td style={{ fontSize: 12, color: 'var(--t3)', maxWidth: 200 }}>{b.notes}</td>
              <td>{canManage && <button className="btn btn-d btn-sm" onClick={() => del(b.id)}><Trash2 size={11} /></button>}</td>
            </tr>)}
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
  const [menuOpen, setMenuOpen] = useState(true)
  // badge: open team tasks assigned to me (in-app "you've been assigned" notification)
  const [taskBadge, setTaskBadge] = useState(0)
  useEffect(() => {
    if (!profile?.id) return
    let live = true
    const loadBadge = async () => {
      const { count } = await supabase.from('team_tasks').select('*', { count: 'exact', head: true }).eq('assignee', profile.id).neq('status', 'done')
      if (live) setTaskBadge(count || 0)
    }
    loadBadge()
    const iv = setInterval(loadBadge, 60000)
    return () => { live = false; clearInterval(iv) }
  }, [profile?.id, tab])
  const allMenu = [
    { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'clock', label: 'Time Clock', icon: <Clock size={16} /> },
    { id: 'cal', label: 'Calendar', icon: <Calendar size={16} /> },
    { id: 'visits', label: 'All Visits', icon: <History size={16} /> },
    { id: 'locs', label: 'Customers', icon: <MapPin size={16} /> },
    { id: 'leads', label: 'Leads', icon: <Phone size={16} /> },
    { id: 'calls', label: 'Call Logs', icon: <PhoneCall size={16} /> },
    { id: 'ttasks', label: 'Team Tasks', icon: <ListChecks size={16} /> },
    { id: 'bids', label: 'Bids', icon: <FileText size={16} /> },
    { id: 'crew', label: 'Accounts', icon: <Users size={16} /> },
  ]
  const allMobile = [
    { id: 'dash', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'clock', label: 'Clock', icon: <Clock size={20} /> },
    { id: 'cal', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'visits', label: 'Visits', icon: <History size={20} /> },
    { id: 'leads', label: 'Leads', icon: <Phone size={20} /> },
    { id: 'calls', label: 'Calls', icon: <PhoneCall size={20} /> },
    { id: 'ttasks', label: 'Tasks', icon: <ListChecks size={20} /> },
    { id: 'bids', label: 'Bids', icon: <FileText size={20} /> },
    { id: 'locs', label: 'Customers', icon: <MapPin size={20} /> },
    { id: 'crew', label: 'Team', icon: <Users size={20} /> },
  ]
  // Viewers get read-only access: no Locations / Leads / Crew management
  // Employees (viewer): Leads CRM + Calls + Team Tasks + Bids (read-only). No Customers/Accounts.
  const menuItems = isViewer ? allMenu.filter(i => !['locs', 'crew'].includes(i.id)) : allMenu
  const mobileItems = isViewer ? allMobile.filter(i => !['locs', 'crew'].includes(i.id)) : allMobile

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div className="app-body" style={{ display: 'flex', flex: 1 }}>
        <aside className="side" style={{ width: menuOpen ? 200 : 60, padding: menuOpen ? '14px 8px' : '14px 6px', transition: 'width .15s ease' }}>
          <button className="side-btn" onClick={() => setMenuOpen(o => !o)} title={menuOpen ? 'Hide menu' : 'Show menu'} style={{ justifyContent: menuOpen ? 'space-between' : 'center', color: 'var(--t3)', marginBottom: 4 }}>
            {menuOpen && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Menu</span>}
            {menuOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          {menuItems.map(i => <button key={i.id} className={`side-btn ${tab === i.id ? 'on' : ''}`} onClick={() => setTab(i.id)} title={i.label} style={{ justifyContent: menuOpen ? 'flex-start' : 'center', position: 'relative' }}>{i.icon}{menuOpen && i.label}{i.id === 'ttasks' && (menuOpen ? <Badge n={taskBadge} /> : taskBadge > 0 && <span style={{ position: 'absolute', top: 2, right: 4, width: 8, height: 8, borderRadius: 4, background: 'var(--g)' }} />)}</button>)}
          {menuOpen && <div style={{ marginTop: 'auto', paddingTop: 12 }}><ClockWidget onPunch={() => {}} compact /></div>}
        </aside>
        <main style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'dash' && <Dashboard go={setTab} />}
          {tab === 'clock' && <TimeClockPage />}
          {tab === 'cal' && <CalendarView />}
          {tab === 'visits' && <AllVisits />}
          {tab === 'locs' && !isViewer && <Locations />}
          {tab === 'leads' && <Leads />}
          {tab === 'calls' && <CallLogs />}
          {tab === 'ttasks' && <TeamTasks />}
          {tab === 'bids' && <Bids />}
          {tab === 'crew' && !isViewer && <Crew />}
        </main>
      </div>
      <nav className="tabs">
        {mobileItems.map(i => <button key={i.id} className={tab === i.id ? 'on' : ''} onClick={() => setTab(i.id)} style={{ position: 'relative' }}>{i.icon}{i.label}{i.id === 'ttasks' && taskBadge > 0 && <span style={{ position: 'absolute', top: 2, right: '50%', marginRight: -18, background: 'var(--g)', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 10, padding: '0 5px' }}>{taskBadge}</span>}</button>)}
      </nav>
    </div>
  )
}
