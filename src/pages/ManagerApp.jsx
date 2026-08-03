import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, MapPin, Users, Calendar, History, RefreshCw, Plus, Search, Flag, X, CheckCircle2, AlertCircle, Clock, Camera, Pen, ChevronLeft, ChevronRight, Phone, Trash2, FileText, PhoneCall, ListChecks } from 'lucide-react'
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { supabase, createUserAccount } from '../lib/supabase'
import { downloadProposalPptx } from '../lib/proposalPptx'
import { CallLogs, TeamTasks, LogCall } from './CrmTools'
import { useAuth } from '../stores/auth'
import Topbar from '../components/Topbar'

const dur = (a, b) => { if (!a || !b) return '—'; const m = Math.round((new Date(b) - new Date(a)) / 60000); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m` }
const mapUrl = (lat, lng) => (lat != null && lng != null) ? `https://www.google.com/maps?q=${lat},${lng}` : null
const photoLinks = (arr, label) => (arr || []).map((u, i) => (
  <a key={label + i} href={u} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }}><Camera size={10} /> {label}{arr.length > 1 ? ` ${i + 1}` : ''}</a>
))
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
  const [busy, setBusy] = useState(true)

  const load = useCallback(async () => {
    setBusy(true)
    const td = startOfDay(new Date()).toISOString(), wk = subDays(new Date(), 7).toISOString()
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const [a, t, w, si, fl, r, sc, bd, ld] = await Promise.all([
      supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'checked_in'),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', td),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('check_in_at', wk),
      supabase.from('locations').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
      supabase.from('visits').select('*, profiles(full_name), locations(name, city)').order('created_at', { ascending: false }).limit(6),
      supabase.from('schedule').select('*').eq('service_date', todayStr).order('location_name'),
      supabase.from('bids').select('*').eq('status', 'prospect').gte('due_date', todayStr).order('due_date').limit(6),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(6),
    ])
    setS({ active: a.count || 0, today: t.count || 0, week: w.count || 0, sites: si.count || 0, flagged: fl.count || 0 })
    setRecent(r.data || []); setTodayJobs(sc.data || []); setBids(bd.data || []); setLeads(ld.data || [])
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
                  <div><div style={{ fontWeight: 600 }}>{l.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{l.lead_type === 'cleaner' ? 'Cleaner' : 'Customer'}{l.company ? ` · ${l.company}` : ''}</div></div>
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
            {filtered.map(v => <tr key={v.id}>
              <td><div style={{ fontWeight: 600 }}>{v.profiles?.full_name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.profiles?.phone}</div></td>
              <td><div>{v.locations?.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{v.locations?.city}</div>{v.notes && <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 2 }} title={v.notes}>📝 {v.notes.length > 44 ? v.notes.slice(0, 44) + '…' : v.notes}</div>}</td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_in_at ? format(new Date(v.check_in_at), 'MMM d h:mm a') : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{v.check_out_at ? format(new Date(v.check_out_at), 'h:mm a') : v.status === 'checked_in' ? <span className="bdg bdg-g" style={{ fontSize: 10 }}>Live</span> : '—'}</td>
              <td className="mono" style={{ fontSize: 11 }}>{dur(v.check_in_at, v.check_out_at)}</td>
              <td><Bdg s={v.status} /></td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {mapUrl(v.check_in_lat, v.check_in_lng) && <a href={mapUrl(v.check_in_lat, v.check_in_lng)} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }} title="Check-in GPS location"><MapPin size={10} /></a>}
                {photoLinks(v.before_photos, 'B')}
                {photoLinks(v.after_photos, 'A')}
                {!v.before_photos?.length && !v.after_photos?.length && v.photo_url && <a href={v.photo_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm" style={{ marginRight: 4 }}><Camera size={10} /></a>}
                {v.signature_url && <a href={v.signature_url} target="_blank" rel="noreferrer" className="btn btn-g btn-sm"><Pen size={10} /></a>}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {v.status === 'flagged' ? <button className="btn btn-g btn-sm" onClick={() => flag(v, v.check_out_at ? 'checked_out' : 'checked_in')}>Unflag</button> : <button className="btn btn-d btn-sm" onClick={() => flag(v, 'flagged')}><Flag size={10} /></button>}
                <button className="btn btn-d btn-sm" style={{ marginLeft: 4 }} onClick={() => del(v)} title="Delete this check-in"><Trash2 size={10} /></button>
              </td>
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
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : people.length === 0 ? <div className="empty"><Users size={24} /><p>No accounts yet</p></div> : <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Service Line</th><th>Since</th></tr></thead><tbody>
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
          </tr>)}
        </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ LEADS + CRM ═══ */
const LEAD_STATUS = ['new', 'contacted', 'won', 'lost']
const CALL_SCRIPTS = [
  {
    t: 'Cleaners & Landscapers — Partner / Overflow',
    sub: "Not a sale — build a network of local owners you can hand overflow to (and who feed you work).",
    sections: [
      { h: 'Voicemail', b: "Hi [Name], this is Fernando from Great Way Environmental — commercial cleaning and landscaping out of Stockton. I'm reaching out to other cleaning owners in the area, nothing to sell you. I think there's a way we could send each other work. Call me back when you get a sec at [number]. Thanks [Name]." },
      { h: 'Opener (they pick up)', b: "Hey [Name], Fernando here — account manager at Great Way Environmental, commercial cleaning and landscaping over in [city]. I'll be straight with you: I'm not selling anything. I run into more work than my crews can cover sometimes, and I'd rather hand it to a solid local owner than a franchise. Figured it was worth introducing myself — how long have you been running your shop?" },
      { h: "Value — what's in it for them", b: "Here's the idea: when we win a contract that's too far or too big, instead of turning it down we sub it to a trusted local owner. You do the work, we handle the client and the billing, and you get steady accounts without chasing them. When you're slammed, you send us work the same way." },
      { h: 'Qualify', b: "What areas do you cover? … Do you run your own crew or is it just you and a couple guys? … You carry general liability, right? And workers' comp if you've got employees?" },
      { h: 'Objections', b: "\"What's the catch / how do you make money?\" → We keep the client relationship and a small margin for managing it and guaranteeing the work. You get paid to clean, not to sell.\n\n\"I already have enough work.\" → Perfect — that's exactly who I want in my back pocket when I'm overloaded. And if you hit a slow month, you know where to call.\n\n\"How do I know I'll get paid?\" → We invoice the client, you invoice us, net terms — in writing. Happy to start you on one small account so you can see how we operate." },
      { h: 'Close', b: "Let's do this — I'll add you to our sub network. To keep it clean I just need a certificate of insurance (and workers' comp if you have employees), and I'll send a simple one-page agreement that says we're subbing work to you. Cool if I text you my info and the doc?" },
    ],
  },
  {
    t: 'Customers — Bundle Pitch (Janitorial + Landscaping)',
    sub: 'Goal: book a 10-minute walkthrough / quote.',
    sections: [
      { h: 'Opener', b: "Hi [Name], this is Fernando with Great Way Environmental — we handle both commercial janitorial and landscaping out of [city]. Quick reason for the call: most properties pay two separate vendors for cleaning and grounds. We bundle both under one contract — one crew, one invoice, one point of contact." },
      { h: 'Value', b: "Bundling usually saves 10–20% versus two vendors, and you stop playing middleman between the cleaner and the landscaper. If something's off, you call one number and it's handled." },
      { h: 'Social proof', b: "We already take care of the G&C, Lexus, and Hilton locations near you, so we're out in your area every week anyway." },
      { h: 'Qualify', b: "Who handles your cleaning and landscaping right now — in-house or contracted? … Are you happy with them, or is it more 'it's fine'? … When does your current agreement come up?" },
      { h: 'Objections', b: "\"We're already under contract.\" → No problem — when's it up for renewal? I'll send a quick side-by-side so you're ready.\n\n\"Just send pricing.\" → Pricing depends on square footage and frequency — let me do a 10-min walkthrough so you get a real number, not a guess.\n\n\"We're happy with who we have.\" → Love that. Most of our clients were too — until one vendor for both turned out to be less hassle and less money.\n\n\"How much?\" → For a property your size, bundled usually lands around [range]/mo — let me confirm with a walkthrough so I'm not overpromising." },
      { h: 'Close', b: "Here's what I'd suggest: a fast 10-minute walkthrough, I put together a bundled proposal you can review and sign online, and if it doesn't beat what you've got, no harm done. Does [day] morning or afternoon work better?" },
    ],
  },
]
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s
function Leads() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'manager'   // employees (viewer) can work leads but not convert/propose
  const [leads, setLeads] = useState([]), [busy, setBusy] = useState(true), [add, setAdd] = useState(false), [saving, setSaving] = useState(false), [filter, setFilter] = useState('all')
  const [scripts, setScripts] = useState(false), [scriptCopied, setScriptCopied] = useState(null), [callLead, setCallLead] = useState(null)
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
    if (data?.user?.id) setTimeout(() => supabase.rpc('set_user_service', { target: data.user.id, svc: 'Janitorial' }), 1500)
    setCrewMsg(`✅ Crew account created — login: ${sel.email} / ${pw}  (service line set to Janitorial)`)
    setConverting(false); load()
  }
  const propLink = (p) => `${window.location.origin}/p/${p.share_token}`
  const copyLink = (p) => { try { navigator.clipboard.writeText(propLink(p)) } catch {} setCopied(p.id); setTimeout(() => setCopied(null), 1500) }
  const emailLink = (p) => `mailto:${sel.email || ''}?subject=${encodeURIComponent('Your Great Way Environmental Proposal')}&body=${encodeURIComponent(`Hi ${sel.contact_person || sel.name || ''},\n\nHere is your proposal from Great Way Environmental. You can review and sign it online:\n${propLink(p)}\n\nThank you,\nGreat Way Environmental\n(707) 718-3492`)}`
  const delProp = async (p) => { await supabase.from('proposals').delete().eq('id', p.id); setProps(ps => ps.filter(x => x.id !== p.id)) }

  const typed = leads.filter(l => (l.lead_type || 'customer') === leadType)
  const shown = filter === 'all' ? typed : typed.filter(l => l.status === filter)
  const counts = LEAD_STATUS.reduce((a, s) => ({ ...a, [s]: typed.filter(l => l.status === s).length }), {})
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const dueSoon = (l) => l.status === 'contacted' && l.callback_date && l.callback_date <= todayStr
  const subCompliant = (l) => l.gl_received && (!l.gl_expiry || l.gl_expiry >= todayStr) && (!l.has_employees || (l.wc_received && (!l.wc_expiry || l.wc_expiry >= todayStr))) && l.vendor_agreement === 'signed'

  return (
    <div className="pg">
      {callLead && <LogCall lead={callLead} onClose={() => setCallLead(null)} onSaved={() => { load(); if (sel) openLead(sel) }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Leads</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-g" onClick={() => setScripts(!scripts)}><Phone size={13} /> {scripts ? 'Hide Scripts' : 'Call Scripts'}</button>
          <button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add {leadType === 'cleaner' ? 'Cleaner' : 'Customer'}</>}</button>
        </div>
      </div>
      {scripts && <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>📞 Call Scripts</div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>Swap [Name], [city], [number], [range]. "Copy all" grabs the whole script.</p>
        {CALL_SCRIPTS.map((s, i) => {
          const full = `${s.t}\n\n` + s.sections.map(x => `${x.h}:\n${x.b}`).join('\n\n')
          return (
            <div key={i} style={{ borderTop: i ? '1px solid var(--bd)' : 'none', paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{s.t}</div><div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{s.sub}</div></div>
                <button className="btn btn-g btn-sm" style={{ flexShrink: 0 }} onClick={() => { try { navigator.clipboard.writeText(full) } catch { } setScriptCopied(i); setTimeout(() => setScriptCopied(null), 1500) }}>{scriptCopied === i ? 'Copied!' : 'Copy all'}</button>
              </div>
              {s.sections.map((x, j) => (
                <div key={j} style={{ marginBottom: 8 }}>
                  <div className="sec-t" style={{ marginBottom: 4 }}>{x.h}</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--bg3)', padding: '10px 12px', borderRadius: 'var(--r)' }}>{x.b}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['customer', 'Customers'], ['cleaner', 'Cleaners']].map(([v, lb]) => (
          <button key={v} className={`btn btn-sm ${leadType === v ? 'btn-p' : 'btn-g'}`} style={{ flex: 1 }} onClick={() => { setLeadType(v); setSel(null); setFilter('all') }}>{lb} ({leads.filter(l => (l.lead_type || 'customer') === v).length})</button>
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
          <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save Lead'}</button>
        </form>
      </div>}
      {sel && (
        <div className="card" style={{ marginBottom: 16 }}>
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
          {sel.lead_type === 'cleaner' ? (
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
      )}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><Phone size={24} /><p>No leads{filter !== 'all' ? ` (${filter})` : ''}</p></div> :
          <div className="tw"><table><thead><tr><th>Lead</th><th>Contact</th><th>Status</th><th>Callback</th><th>Notes</th><th></th></tr></thead><tbody>
            {shown.map(l => <tr key={l.id} style={dueSoon(l) ? { background: 'rgba(212,160,23,.06)' } : {}}>
              <td><button type="button" onClick={() => openLead(l)} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}><div style={{ fontWeight: 600, color: 'var(--g-light)' }}>{l.name}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{l.company}{l.source ? ` · ${l.source}` : ''}</div></button></td>
              <td style={{ fontSize: 12 }}>{l.phone && <div><a href={`tel:${l.phone}`} style={{ color: 'var(--g-light)' }}>{l.phone}</a></div>}{l.email && <div style={{ color: 'var(--t3)' }}>{l.email}</div>}</td>
              <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={l.status} onChange={e => upd(l.id, { status: e.target.value })}>{LEAD_STATUS.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></td>
              <td><input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={l.callback_date || ''} onChange={e => upd(l.id, { callback_date: e.target.value || null })} />{dueSoon(l) && <div style={{ fontSize: 10, color: 'var(--yellow)', marginTop: 2 }}>due</div>}</td>
              <td style={{ fontSize: 12, color: 'var(--t3)', maxWidth: 200 }}>{leadType === 'cleaner' && <span className={`bdg ${subCompliant(l) ? 'bdg-g' : 'bdg-x'}`} style={{ marginRight: 6, fontSize: 9 }}>{subCompliant(l) ? '✓ DOCS' : 'DOCS'}</span>}{l.notes}</td>
              <td><button className="btn btn-d btn-sm" onClick={() => del(l.id)} title="Delete lead"><X size={11} /></button></td>
            </tr>)}
          </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ BID TRACKER (manager only) ═══ */
const BID_STATUS = ['prospect', 'submitted', 'won', 'lost']
function Bids() {
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
        <button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Bid</>}</button>
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
              <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={b.status} onChange={e => upd(b.id, { status: e.target.value, ...(e.target.value === 'submitted' && !b.submitted_date ? { submitted_date: todayStr } : {}) })}>{BID_STATUS.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></td>
              <td><input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={b.due_date || ''} onChange={e => upd(b.id, { due_date: e.target.value || null })} />{overdue(b) && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>overdue</div>}</td>
              <td style={{ fontSize: 12, color: 'var(--t3)', maxWidth: 200 }}>{b.notes}</td>
              <td><button className="btn btn-d btn-sm" onClick={() => del(b.id)}><Trash2 size={11} /></button></td>
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
  const allMenu = [
    { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
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
  // Employees (viewer role) are cold-callers: they get Leads (CRM), not Customers/Bids/Accounts
  const menuItems = isViewer ? allMenu.filter(i => !['locs', 'bids', 'crew'].includes(i.id)) : allMenu
  const mobileItems = isViewer ? allMobile.filter(i => !['locs', 'bids', 'crew'].includes(i.id)) : allMobile

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
          {tab === 'leads' && <Leads />}
          {tab === 'calls' && <CallLogs />}
          {tab === 'ttasks' && <TeamTasks />}
          {tab === 'bids' && !isViewer && <Bids />}
          {tab === 'crew' && !isViewer && <Crew />}
        </main>
      </div>
      <nav className="tabs">
        {mobileItems.map(i => <button key={i.id} className={tab === i.id ? 'on' : ''} onClick={() => setTab(i.id)}>{i.icon}{i.label}</button>)}
      </nav>
    </div>
  )
}
