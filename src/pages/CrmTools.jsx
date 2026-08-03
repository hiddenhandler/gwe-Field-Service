import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../stores/auth'
import { format, formatDistanceToNow } from 'date-fns'
import { Phone, Plus, X, RefreshCw, ListChecks, CheckCircle2 } from 'lucide-react'

const cap = s => s ? s[0].toUpperCase() + s.slice(1).replace(/_/g, ' ') : s
const OUTCOMES = ['connected', 'interested', 'callback', 'voicemail', 'no_answer', 'left_message', 'not_interested']

const GREETING = {
  cleaner: "Hey [Name], Fernando here — account manager at Great Way Environmental, commercial cleaning & landscaping out of [city]. I'm not selling anything — I run into more work than my crews can cover and I'd rather hand it to a solid local owner than a franchise. How long have you been running your shop?",
  customer: "Hi [Name], this is Fernando with Great Way Environmental — we handle both commercial janitorial and landscaping. Most properties pay two separate vendors for cleaning and grounds; we bundle both under one contract, usually saves 10–20% and gives you one point of contact. We already service the G&C, Lexus, and Hilton spots near you — worth a quick look?",
}

/* ═══ GUIDED CALL INTAKE MODAL (launch from a lead's "Log Call") ═══ */
export function LogCall({ lead, onClose, onSaved }) {
  const { profile } = useAuth()
  const [leadMode, setLeadMode] = useState(lead ? 'attached' : 'new') // attached | existing | new | none
  const [leadQ, setLeadQ] = useState(''), [leadHits, setLeadHits] = useState([]), [picked, setPicked] = useState(lead || null), [newType, setNewType] = useState('cleaner')
  const activeLead = lead || picked
  const isCleaner = (activeLead?.lead_type || (leadMode === 'new' ? newType : null)) === 'cleaner'
  const [f, setF] = useState({
    business: lead?.name || '', contact_name: lead?.contact_person || '', phone: lead?.phone || '', email: lead?.email || '',
    purpose: (lead?.lead_type === 'cleaner') ? 'Partner / overflow outreach' : 'Bundle pitch', outcome: 'connected', callback_date: '', notes: '',
    has_employees: !!lead?.has_employees, gl: !!lead?.gl_received, wc: !!lead?.wc_received,
  })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (lead || leadMode !== 'existing') return
    const t = setTimeout(async () => {
      const s = leadQ.trim(); if (!s) { setLeadHits([]); return }
      const { data } = await supabase.from('leads').select('id,name,company,lead_type,phone,email,contact_person,notes,callback_date,has_employees,gl_received,wc_received').ilike('name', `%${s}%`).limit(8)
      setLeadHits(data || [])
    }, 250)
    return () => clearTimeout(t)
  }, [leadQ, leadMode, lead])

  const notePreview = [
    `${f.purpose} — ${cap(f.outcome)}`,
    f.contact_name && `Spoke with: ${f.contact_name}`,
    isCleaner && `Employees: ${f.has_employees ? 'yes' : 'no'} · GL: ${f.gl ? 'yes' : 'no'}${f.has_employees ? ` · WC: ${f.wc ? 'yes' : 'no'}` : ''}`,
    f.callback_date && `Callback: ${f.callback_date}`,
    f.notes && `Notes: ${f.notes}`,
  ].filter(Boolean).join('\n')

  const save = async () => {
    setBusy(true)
    const stamp = `[${format(new Date(), 'MMM d')}] ${notePreview}`
    const newStatus = f.outcome === 'not_interested' ? 'lost' : 'contacted'
    let target = lead || picked || null
    let leadId = target?.id || null
    // create a lead from this call
    if (!lead && leadMode === 'new' && (f.business || f.contact_name || f.phone)) {
      const { data: nl } = await supabase.from('leads').insert({
        name: f.business || f.contact_name || 'New lead', company: f.business || null, contact_person: f.contact_name || null,
        phone: f.phone || null, email: f.email || null, lead_type: newType, source: 'Call log',
        status: newStatus, callback_date: f.callback_date || null, notes: stamp,
        ...(newType === 'cleaner' ? { has_employees: f.has_employees, gl_received: f.gl, wc_received: f.wc } : {}),
      }).select().single()
      leadId = nl?.id || null; target = null // already populated at insert
    }
    await supabase.from('call_logs').insert({
      lead_id: leadId, business: f.business, contact_name: f.contact_name, phone: f.phone, email: f.email,
      purpose: f.purpose, outcome: f.outcome, callback_date: f.callback_date || null, notes: notePreview, agent: profile?.id || null,
    })
    // update an attached/existing lead
    if (target?.id) {
      const patch = { status: newStatus, callback_date: f.callback_date || target.callback_date || null, contact_person: f.contact_name || target.contact_person, notes: [target.notes, stamp].filter(Boolean).join('\n') }
      if (isCleaner) { patch.has_employees = f.has_employees; patch.gl_received = f.gl; patch.wc_received = f.wc }
      await supabase.from('leads').update(patch).eq('id', target.id)
    }
    setBusy(false); onSaved && onSaved(); onClose()
  }

  const Q = ({ prompt, children, opt }) => (
    <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--t1)', marginBottom: 6 }}>“{prompt}” {opt && <span style={{ color: 'var(--t3)', fontStyle: 'normal' }}>(optional)</span>}</div>
      {children}
    </div>
  )

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}><Phone size={15} /> Log Call{lead ? ` — ${lead.name}` : ''}</div>
          <button className="btn btn-g btn-sm" onClick={onClose}><X size={13} /></button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14 }}>Read each line aloud · fill the answers · the note builds itself.</p>

        {!lead && <div className="field" style={{ marginBottom: 14 }}>
          <label className="field-lbl">Lead</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {[['new', 'Create new lead'], ['existing', 'Attach existing'], ['none', 'No lead']].map(([v, lb]) =>
              <button key={v} type="button" className={`btn btn-sm ${leadMode === v ? 'btn-p' : 'btn-g'}`} onClick={() => { setLeadMode(v); setPicked(null) }}>{lb}</button>)}
          </div>
          {leadMode === 'new' && <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {[['cleaner', 'Cleaner'], ['customer', 'Customer']].map(([v, lb]) => <button key={v} type="button" className={`btn btn-sm ${newType === v ? 'btn-p' : 'btn-g'}`} onClick={() => setNewType(v)}>{lb}</button>)}
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>New lead uses the name / phone you enter below.</span>
          </div>}
          {leadMode === 'existing' && (picked ? (
            <button type="button" className="loc-selected" onClick={() => setPicked(null)}><div><div className="loc-name">{picked.name}</div><div className="loc-street">{picked.lead_type} · {picked.phone || ''}</div></div><span className="loc-change">Change</span></button>
          ) : (
            <>
              <input className="inp" placeholder="Search a lead by name…" value={leadQ} onChange={e => setLeadQ(e.target.value)} />
              {leadHits.length > 0 && <div className="loc-list" style={{ marginTop: 6 }}>{leadHits.map(h => (
                <button type="button" key={h.id} className="loc-item" onClick={() => { setPicked(h); setF(p => ({ ...p, business: h.name, contact_name: h.contact_person || p.contact_name, phone: h.phone || p.phone, email: h.email || p.email })) }}><div className="loc-name">{h.name}</div><div className="loc-street">{h.lead_type} · {h.phone || ''}</div></button>
              ))}</div>}
            </>
          ))}
        </div>}

        <div className="fg2">
          <div>
            <div className="alrt" style={{ display: 'block', background: 'rgba(74,158,255,.08)', border: '1px solid rgba(74,158,255,.25)', marginBottom: 14 }}>
              <div className="sec-t" style={{ marginBottom: 4 }}>Opening (read aloud)</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{GREETING[isCleaner ? 'cleaner' : 'customer']}</div>
            </div>
            <div className="field" style={{ marginBottom: 14 }}><label className="field-lbl">Purpose</label>
              <select className="inp" value={f.purpose} onChange={e => set('purpose', e.target.value)}>
                <option>Partner / overflow outreach</option><option>Bundle pitch</option><option>Follow-up</option><option>Other</option>
              </select>
            </div>
            <Q prompt="Who am I speaking with?"><input className="inp" value={f.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Name / title" /></Q>
            <Q prompt="Best number to reach you?"><input className="inp" value={f.phone} onChange={e => set('phone', e.target.value)} /></Q>
            <Q prompt="Email to send info to?" opt><input className="inp" value={f.email} onChange={e => set('email', e.target.value)} /></Q>
            {isCleaner && <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>“Do you have employees, and do you carry insurance?”</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className={`btn btn-sm ${f.has_employees ? 'btn-p' : 'btn-g'}`} onClick={() => set('has_employees', !f.has_employees)}>{f.has_employees ? '✓ Has employees' : 'No employees'}</button>
                <button type="button" className={`btn btn-sm ${f.gl ? 'btn-p' : 'btn-g'}`} onClick={() => set('gl', !f.gl)}>{f.gl ? '✓ GL' : 'GL?'}</button>
                {f.has_employees && <button type="button" className={`btn btn-sm ${f.wc ? 'btn-p' : 'btn-g'}`} onClick={() => set('wc', !f.wc)}>{f.wc ? '✓ WC' : 'WC?'}</button>}
              </div>
            </div>}
            <div className="fg2" style={{ marginBottom: 14 }}>
              <div className="field"><label className="field-lbl">Outcome</label><select className="inp" value={f.outcome} onChange={e => set('outcome', e.target.value)}>{OUTCOMES.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select></div>
              <div className="field"><label className="field-lbl">Callback date</label><input type="date" className="inp" value={f.callback_date} onChange={e => set('callback_date', e.target.value)} /></div>
            </div>
            <div className="field"><label className="field-lbl">Notes</label><textarea className="inp" rows={3} style={{ resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything else worth logging…" /></div>
          </div>
          <div>
            <div className="sec-t" style={{ marginBottom: 6 }}>Live note preview</div>
            <div className="card" style={{ minHeight: 160, whiteSpace: 'pre-line', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{notePreview || 'Fill the fields to build the note…'}</div>
            <button className="big big-in" style={{ marginTop: 12 }} onClick={save} disabled={busy}>{busy ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : <><Plus size={16} /> Save Call Log</>}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ CALL LOGS TAB ═══ */
export function CallLogs() {
  const [calls, setCalls] = useState([]), [busy, setBusy] = useState(true), [filter, setFilter] = useState('all'), [q, setQ] = useState(''), [modal, setModal] = useState(false)
  const load = async () => { const { data } = await supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(500); setCalls(data || []); setBusy(false) }
  useEffect(() => { load() }, [])
  const upd = async (id, patch) => { await supabase.from('call_logs').update(patch).eq('id', id); load() }
  const counts = OUTCOMES.reduce((a, o) => ({ ...a, [o]: calls.filter(c => c.outcome === o).length }), {})
  let shown = filter === 'all' ? calls : calls.filter(c => c.outcome === filter)
  if (q) { const s = q.toLowerCase(); shown = shown.filter(c => (c.business + ' ' + (c.contact_name || '') + ' ' + (c.phone || '') + ' ' + (c.notes || '')).toLowerCase().includes(s)) }

  return (
    <div className="pg">
      {modal && <LogCall onClose={() => setModal(false)} onSaved={load} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800 }}>Call Logs</h1><p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 2 }}>{calls.length} total · {shown.length} shown</p></div>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-p" onClick={() => setModal(true)}><Plus size={13} /> New Call</button><button className="btn btn-g btn-sm" onClick={load}><RefreshCw size={13} /></button></div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['all', ...OUTCOMES].map(o => <button key={o} className={`btn btn-sm ${filter === o ? 'btn-p' : 'btn-g'}`} onClick={() => setFilter(o)}>{cap(o)}{o !== 'all' ? ` (${counts[o] || 0})` : ` (${calls.length})`}</button>)}
      </div>
      <input className="inp" placeholder="Search name, caller, phone, notes…" value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12 }} />
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><Phone size={24} /><p>No calls logged</p></div> :
          <div className="tw"><table><thead><tr><th>Business</th><th>Contact</th><th>Phone</th><th>Outcome</th><th>Callback</th><th>When</th></tr></thead><tbody>
            {shown.map(c => <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.business || '—'}<div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400, maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.notes}</div></td>
              <td style={{ fontSize: 12 }}>{c.contact_name || '—'}</td>
              <td style={{ fontSize: 12 }}>{c.phone ? <a href={`tel:${c.phone}`} style={{ color: 'var(--g-light)' }}>{c.phone}</a> : '—'}</td>
              <td><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.outcome} onChange={e => upd(c.id, { outcome: e.target.value })}>{OUTCOMES.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select></td>
              <td><input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.callback_date || ''} onChange={e => upd(c.id, { callback_date: e.target.value || null })} /></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : '—'}</td>
            </tr>)}
          </tbody></table></div>}
      </div>
    </div>
  )
}

/* ═══ TEAM TASKS TAB ═══ */
const TT_STATUS = ['open', 'in_progress', 'done']
const TT_CAT = ['Customer Follow-up', 'Cleaner Follow-up', 'Sales', 'Scheduling', 'Admin', 'Other']
const TT_TEMPLATES = ['Follow up with customer', 'Follow up with cleaner', 'Call back customers', 'Confirm tomorrow’s schedule', 'Collect subcontractor docs (COI / WC)', 'Review email inbox']
function TeamTasks() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'manager'
  const [tasks, setTasks] = useState([]), [people, setPeople] = useState([]), [busy, setBusy] = useState(true), [filter, setFilter] = useState('all'), [add, setAdd] = useState(false), [saving, setSaving] = useState(false)
  const blank = { title: '', description: '', category: 'Other', priority: 'normal', assignee: '', due_date: '', recurring: 'one_time' }
  const [f, setF] = useState(blank)
  const load = async () => {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('team_tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('profiles').select('id, full_name'),
    ])
    setTasks(t || []); setPeople(p || []); setBusy(false)
  }
  useEffect(() => { load() }, [])
  const save = async e => { e.preventDefault(); setSaving(true); await supabase.from('team_tasks').insert({ ...f, assignee: f.assignee || null, due_date: f.due_date || null, created_by: profile?.id || null }); setF(blank); setAdd(false); setSaving(false); load() }
  const upd = async (id, patch) => { await supabase.from('team_tasks').update(patch).eq('id', id); load() }
  const del = async (id) => { if (!window.confirm('Delete task?')) return; await supabase.from('team_tasks').delete().eq('id', id); load() }
  const nameOf = (id) => people.find(p => p.id === id)?.full_name || 'Unassigned'
  const counts = TT_STATUS.reduce((a, s) => ({ ...a, [s]: tasks.filter(t => t.status === s).length }), {})
  const shown = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div className="pg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Team Tasks</h1>
        <button className="btn btn-p" onClick={() => setAdd(!add)}>{add ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Task</>}</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['all', ...TT_STATUS].map(s => <button key={s} className={`btn btn-sm ${filter === s ? 'btn-p' : 'btn-g'}`} onClick={() => setFilter(s)}>{cap(s)}{s !== 'all' ? ` (${counts[s] || 0})` : ` (${tasks.length})`}</button>)}
      </div>
      {add && <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>New Team Task</div>
        <div className="field" style={{ marginBottom: 12 }}><label className="field-lbl">Quick template</label>
          <select className="inp" value="" onChange={e => e.target.value && setF({ ...f, title: e.target.value })}><option value="">— pick a common task —</option>{TT_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <form onSubmit={save}>
          <div className="field" style={{ marginBottom: 12 }}><label className="field-lbl">Title</label><input className="inp" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required /></div>
          <div className="field" style={{ marginBottom: 12 }}><label className="field-lbl">Description</label><textarea className="inp" rows={2} style={{ resize: 'vertical' }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
          <div className="fg2" style={{ marginBottom: 12 }}>
            <div className="field"><label className="field-lbl">Category</label><select className="inp" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{TT_CAT.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label className="field-lbl">Priority</label><select className="inp" value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="field"><label className="field-lbl">Assign to</label><select className="inp" value={f.assignee} onChange={e => setF({ ...f, assignee: e.target.value })}><option value="">— Unassigned —</option>{people.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
            <div className="field"><label className="field-lbl">Due date</label><input type="date" className="inp" value={f.due_date} onChange={e => setF({ ...f, due_date: e.target.value })} /></div>
          </div>
          <button className="btn btn-p" type="submit" disabled={saving}>{saving ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Create Task'}</button>
        </form>
      </div>}
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><ListChecks size={24} /><p>No tasks</p></div> :
          shown.map(t => (
            <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderBottom: '1px solid var(--bd)', opacity: t.status === 'done' ? 0.6 : 1 }}>
              <button className="route-check" onClick={() => upd(t.id, { status: t.status === 'done' ? 'open' : 'done' })} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}>{t.status === 'done' ? <CheckCircle2 size={20} style={{ color: 'var(--g-light)' }} /> : <span className="route-dot" />}</button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title} {t.priority !== 'normal' && <span className={`bdg ${t.priority === 'urgent' || t.priority === 'high' ? 'bdg-r' : 'bdg-x'}`} style={{ fontSize: 9 }}>{t.priority}</span>}</div>
                {t.description && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{t.description}</div>}
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{t.category} · {nameOf(t.assignee)}{t.due_date ? ` · due ${t.due_date}` : ''}{t.recurring && t.recurring !== 'one_time' ? ` · ${t.recurring}` : ''}</div>
              </div>
              <select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={t.status} onChange={e => upd(t.id, { status: e.target.value })}>{TT_STATUS.map(s => <option key={s} value={s}>{cap(s)}</option>)}</select>
              {canManage && <button className="btn btn-d btn-sm" onClick={() => del(t.id)}><X size={11} /></button>}
            </div>
          ))}
      </div>
    </div>
  )
}
export { TeamTasks }
