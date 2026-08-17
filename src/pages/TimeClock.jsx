import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Coffee, Play, Square, RefreshCw } from 'lucide-react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../stores/auth'

/* ── format ms → "Xh Ym" ── */
const fmt = (ms) => {
  if (!ms || ms < 0) ms = 0
  const m = Math.round(ms / 60000)
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`
}
const clock = (t) => t ? format(new Date(t), 'h:mm a') : '—'

/* ── walk punch events → current state + totals ── */
function reduce(punches, nowMs) {
  let status = 'out', segStart = null, breakStart = null
  let worked = 0, shift = 0, breakTot = 0, breaks = 0, firstIn = null, lastOut = null
  for (const p of punches) {
    const t = new Date(p.at).getTime()
    if (p.kind === 'in') { status = 'working'; segStart = t; if (firstIn == null) firstIn = t; shift = 0 }
    else if (p.kind === 'break_start') { if (segStart != null) { const d = t - segStart; worked += d; shift += d; segStart = null } status = 'break'; breakStart = t; breaks++ }
    else if (p.kind === 'break_end') { if (breakStart != null) { breakTot += t - breakStart; breakStart = null } status = 'working'; segStart = t }
    else if (p.kind === 'out') { if (segStart != null) { const d = t - segStart; worked += d; shift += d; segStart = null } if (breakStart != null) { breakTot += t - breakStart; breakStart = null } status = 'out'; lastOut = t }
  }
  let breakElapsed = 0
  if (status === 'working' && segStart != null) { const d = nowMs - segStart; worked += d; shift += d }
  if (status === 'break' && breakStart != null) { breakElapsed = nowMs - breakStart; breakTot += breakElapsed }
  return { status, firstIn, lastOut, workedMs: worked, shiftMs: shift, breakMs: breakTot, breakElapsed, breaks }
}

/* ═══ PUNCH CARD — clock in / break / out (all non-crew staff) ═══ */
export function ClockWidget({ onPunch, compact }) {
  const { profile } = useAuth()
  const [punches, setPunches] = useState([])
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())

  const load = useCallback(async () => {
    if (!profile?.id) return
    const from = startOfDay(new Date()).toISOString()
    const { data } = await supabase.from('time_punches').select('*').eq('user_id', profile.id).gte('at', from).order('at', { ascending: true })
    setPunches(data || [])
  }, [profile?.id])
  useEffect(() => { load() }, [load])
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [])
  // keep every clock widget (sidebar + page) in sync: on another widget's punch, on refocus, and every 20s
  useEffect(() => {
    const reload = () => load()
    const onVis = () => { if (!document.hidden) load() }
    window.addEventListener('gwe-punch', reload)
    window.addEventListener('focus', reload)
    document.addEventListener('visibilitychange', onVis)
    const poll = setInterval(load, 20000)
    return () => { window.removeEventListener('gwe-punch', reload); window.removeEventListener('focus', reload); document.removeEventListener('visibilitychange', onVis); clearInterval(poll) }
  }, [load])

  const st = reduce(punches, now)
  const punch = async (kind) => {
    setBusy(true)
    await supabase.from('time_punches').insert({ kind })   // user_id defaults to auth.uid()
    await load(); setBusy(false)
    window.dispatchEvent(new Event('gwe-punch'))   // sync the other clock widgets instantly
    onPunch && onPunch()
  }

  const big = st.status === 'break' ? st.breakElapsed : st.status === 'working' ? st.shiftMs : st.workedMs
  const meta = st.status === 'out'
    ? (st.lastOut ? `Clocked out at ${clock(st.lastOut)}` : 'Not clocked in yet today')
    : `Today total: ${fmt(st.workedMs)}`

  const sz = compact ? 27 : 34
  return (
    <div className="card" style={compact ? { maxWidth: '100%', padding: 12 } : { maxWidth: 340 }}>
      <div className="mono" style={{ fontSize: sz, fontWeight: 800, color: 'var(--blue)', lineHeight: 1.1 }}>{fmt(big)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontWeight: 800, fontSize: 12, letterSpacing: .5,
        color: st.status === 'working' ? 'var(--g-light)' : st.status === 'break' ? '#e9b949' : 'var(--t3)' }}>
        <Clock size={12} /> {st.status === 'working' ? 'WORKING' : st.status === 'break' ? 'ON BREAK' : 'CLOCKED OUT'}
      </div>
      <div style={{ color: 'var(--t3)', fontSize: 11, marginTop: 6 }}>{meta}</div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {st.status === 'out' && (
          <button className="btn btn-f btn-sm" disabled={busy} onClick={() => punch('in')}
            style={{ flex: 1, background: 'var(--g)', color: '#04160b', fontWeight: 700 }}><Play size={14} /> Clock In</button>
        )}
        {st.status === 'working' && <>
          <button className="btn btn-f btn-sm" disabled={busy} onClick={() => punch('break_start')}
            style={{ flex: 1, background: '#e9b949', color: '#2a1e00', fontWeight: 700 }}><Coffee size={14} /> Break</button>
          <button className="btn btn-f btn-sm" disabled={busy} onClick={() => punch('out')}
            style={{ flex: 1, background: 'var(--red)', color: '#fff', fontWeight: 700 }}><Square size={13} /> Out</button>
        </>}
        {st.status === 'break' && <>
          <button className="btn btn-f btn-sm" disabled={busy} onClick={() => punch('break_end')}
            style={{ flex: 1, background: 'var(--g)', color: '#04160b', fontWeight: 700 }}><Play size={14} /> End Break</button>
          <button className="btn btn-f btn-sm" disabled={busy} onClick={() => punch('out')}
            style={{ flex: 1, background: 'var(--red)', color: '#fff', fontWeight: 700 }}><Square size={13} /> Out</button>
        </>}
      </div>
    </div>
  )
}

const STAT = {
  working: { lb: 'Working', cls: 'bdg-g' },
  break: { lb: 'On break', cls: 'bdg-y' },
  out: { lb: 'Out', cls: 'bdg-x' },
}

/* ═══ MANAGER STATUS REPORT — clock ins / breaks / clock outs ═══ */
export function TimeReport() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(true)
  const [now, setNow] = useState(Date.now())
  const isToday = date === format(new Date(), 'yyyy-MM-dd')

  const load = useCallback(async () => {
    setBusy(true)
    const d = new Date(date + 'T00:00:00')
    const from = startOfDay(d).toISOString(), to = endOfDay(d).toISOString()
    const [{ data: staff }, { data: punches }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role').in('role', ['manager', 'viewer']).order('full_name'),
      supabase.from('time_punches').select('*').gte('at', from).lte('at', to).order('at', { ascending: true }),
    ])
    const byUser = {}
    ;(punches || []).forEach(p => { (byUser[p.user_id] = byUser[p.user_id] || []).push(p) })
    const nowMs = isToday ? Date.now() : to === null ? Date.now() : new Date(to).getTime()
    const out = (staff || []).map(u => {
      const st = reduce(byUser[u.id] || [], isToday ? Date.now() : new Date(to).getTime())
      return { ...u, ...st, has: (byUser[u.id] || []).length > 0 }
    })
    // active/on-break first, then clocked-in today, then rest; by worked desc
    out.sort((a, b) => (b.has - a.has) || (b.workedMs - a.workedMs))
    setRows(out); setBusy(false)
  }, [date, isToday])
  useEffect(() => { load() }, [load])
  useEffect(() => { const i = setInterval(() => { setNow(Date.now()); if (isToday) load() }, 30000); return () => clearInterval(i) }, [isToday, load])

  const clockedIn = rows.filter(r => r.status !== 'out').length
  const totalWorked = rows.reduce((a, r) => a + r.workedMs, 0)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Team Time Report</div>
          <div style={{ color: 'var(--t3)', fontSize: 12, marginTop: 2 }}>{clockedIn} on the clock · {fmt(totalWorked)} worked {isToday ? 'today' : 'that day'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="inp" style={{ width: 'auto' }} value={date} max={format(new Date(), 'yyyy-MM-dd')} onChange={e => setDate(e.target.value)} />
          <button className="btn btn-g btn-sm" onClick={load}><RefreshCw size={13} /></button>
        </div>
      </div>

      {busy ? <div style={{ color: 'var(--t3)', fontSize: 13, padding: '10px 0' }}>Loading…</div>
        : rows.length === 0 ? <div style={{ color: 'var(--t3)', fontSize: 13, padding: '10px 0' }}>No staff found.</div>
          : <div style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--t3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: .5 }}>
                  <th style={{ padding: '6px 8px' }}>Name</th>
                  <th style={{ padding: '6px 8px' }}>Status</th>
                  <th style={{ padding: '6px 8px' }}>Clock In</th>
                  <th style={{ padding: '6px 8px' }}>Clock Out</th>
                  <th style={{ padding: '6px 8px' }}>Breaks</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Worked</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const s = STAT[r.status]
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--bd)' }}>
                      <td style={{ padding: '8px' }}>
                        <div style={{ fontWeight: 600 }}>{r.full_name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{r.role === 'manager' ? 'Manager' : 'Employee'}</div>
                      </td>
                      <td style={{ padding: '8px' }}><span className={`bdg ${s.cls}`}>{s.lb}</span></td>
                      <td style={{ padding: '8px' }} className="mono">{clock(r.firstIn)}</td>
                      <td style={{ padding: '8px' }} className="mono">{r.status === 'out' ? clock(r.lastOut) : '—'}</td>
                      <td style={{ padding: '8px' }}>{r.breaks ? `${r.breaks} · ${fmt(r.breakMs)}` : '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }} className="mono">{r.has ? fmt(r.workedMs) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>}
    </div>
  )
}

/* ═══ PAGE — widget for everyone + report for managers ═══ */
export default function TimeClockPage() {
  const { profile } = useAuth()
  const isMgr = profile?.role === 'manager'
  const [k, setK] = useState(0)
  return (
    <div className="pg">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Time Clock</h1>
      <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 18 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ClockWidget onPunch={() => setK(k + 1)} />
        {isMgr && <div style={{ flex: 1, minWidth: 300 }}><TimeReport key={k} /></div>}
      </div>
    </div>
  )
}
