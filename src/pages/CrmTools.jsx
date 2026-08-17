import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../stores/auth'
import { format, formatDistanceToNow, startOfWeek } from 'date-fns'
import { Phone, Plus, X, RefreshCw, ListChecks, CheckCircle2, Trash2, Bell, Download, BarChart3 } from 'lucide-react'

const cap = s => s ? s[0].toUpperCase() + s.slice(1).replace(/_/g, ' ') : s
// generic client-side CSV download
function downloadCSV(filename, cols, rows) {
  const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  const csv = [cols.map(c => esc(c.label)).join(',')].concat((rows || []).map(r => cols.map(c => esc(c.get ? c.get(r) : r[c.key])).join(','))).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
const OUTCOMES = ['connected', 'interested', 'callback', 'voicemail', 'no_answer', 'left_message', 'disconnected', 'not_interested']
// outcomes that should auto-schedule a follow-up call
const AUTO_CB = ['voicemail', 'no_answer', 'callback']
// next business day (skips Sat/Sun) as yyyy-MM-dd — used for auto callbacks
const nextBiz = () => { const d = new Date(); d.setDate(d.getDate() + 1); const g = d.getDay(); if (g === 6) d.setDate(d.getDate() + 2); else if (g === 0) d.setDate(d.getDate() + 1); return format(d, 'yyyy-MM-dd') }

const SCRIPTS = {
  cleaner: [
    { h: 'Voicemail', b: "Hi [Name], this is Fernando from Great Way Environmental — commercial cleaning and landscaping out of Stockton. I'm reaching out to other cleaning owners in the area, nothing to sell you. I think there's a way we could send each other work. Call me back when you get a sec at [number]. Thanks [Name]." },
    { h: 'Opener (they pick up)', b: "Hey [Name], Fernando here — account manager at Great Way Environmental, commercial cleaning and landscaping over in [city]. I'll be straight with you: I'm not selling anything. I run into more work than my crews can cover sometimes, and I'd rather hand it to a solid local owner than a franchise. Figured it was worth introducing myself — how long have you been running your shop?" },
    { h: 'Value', b: "Here's the idea: when we win a contract that's too far or too big, instead of turning it down we sub it to a trusted local owner. You do the work, we handle the client and the billing, and you get steady accounts without chasing them. When you're slammed, you send us the same way." },
    { h: 'Qualify', b: "Nice, that's a long time. Are you the owner and out in the field too, or do you have a team running it? … What areas do you cover? … Are you turning work away these days, or hungry for more? … Can you provide a COI — general liability, and workers' comp if you've got employees? … Do you have someone coming up behind you to take it over eventually, or is it pretty much you holding it together?" },
    { h: 'Objections', b: "\"What's the catch / how do you make money?\" → We keep the client relationship and a small margin for managing it and guaranteeing the work. You get paid to clean, not to sell.\n\n\"I already have enough work.\" → Perfect — that's exactly who I want in my back pocket when I'm overloaded. And if you hit a slow month, you know where to call.\n\n\"How do I know I'll get paid?\" → We invoice the client, you invoice us, net terms — in writing. Happy to start you on one small account so you can see how we operate." },
    { h: 'Close', b: "Let's do this — I'll add you to our sub network. To keep it clean I just need a COI showing general liability (and workers' comp if you have employees), and I'll send a simple one-page agreement that says we're subbing work to you. Cool if I text you my info and the doc?" },
  ],
  customer: [
    { h: 'Opener', b: "Hi [Name], this is Fernando with Great Way Environmental — we handle both commercial janitorial and landscaping out of [city]. Quick reason for the call: most properties are paying two separate vendors for cleaning and grounds. We bundle both under one contract — one crew, one invoice, one point of contact." },
    { h: 'Value', b: "Bundling means you stop playing middleman between the cleaner and the landscaper. One crew, one point of contact — if something's off, you call one number and it's handled." },
    { h: 'Social proof', b: "We already take care of the G&C, Lexus, and Hilton locations near you, so we're out in your area every week anyway." },
    { h: 'Qualify', b: "Who handles your cleaning and landscaping right now — in-house or contracted? … Are you happy with them, or is it more of a 'it's fine' situation? … When does your current agreement come up?" },
    { h: 'Objections', b: "\"We're already under contract.\" → Totally fine — I'm not asking you to break anything. When's it up for renewal? I'll send a quick side-by-side so you're ready.\n\n\"Just send me pricing.\" → Every property's different — the only way to give you a real number is a quick 10-minute walkthrough. No guessing, no obligation.\n\n\"We're happy with who we have.\" → Love that. Most of our clients were too — until one vendor for both turned out to be a lot less hassle.\n\n\"How much?\" → That's exactly what the walkthrough is for — I'd rather see the space and give you a real number than throw out a guess over the phone." },
    { h: 'Close', b: "Here's what I'd suggest: a fast 10-minute walkthrough, I put together a bundled proposal you can review and sign online, and if it doesn't beat what you've got, no harm done. Does [day] morning or afternoon work better?" },
  ],
}

/* ── Spanish scripts (same structure) ── */
const SCRIPTS_ES = {
  cleaner: [
    { h: 'Buzón de voz', b: "Hola [Name], le habla Fernando de Great Way Environmental — limpieza comercial y jardinería aquí en Stockton. Estoy contactando a otros dueños de compañías de limpieza en el área, no es para venderle nada. Creo que hay una forma en que podríamos pasarnos trabajo el uno al otro. Devuélvame la llamada cuando pueda al [number]. Gracias [Name]." },
    { h: 'Apertura (contestan)', b: "¿Qué tal [Name]? Le habla Fernando — gerente de cuentas en Great Way Environmental, limpieza comercial y jardinería por [city]. Le voy a ser directo: no le estoy vendiendo nada. A veces me llega más trabajo del que mis cuadrillas pueden cubrir, y prefiero pasárselo a un dueño local serio que a una franquicia. Por eso quise presentarme — ¿cuánto tiempo lleva con su compañía?" },
    { h: 'Valor', b: "La idea es esta: cuando ganamos un contrato que queda muy lejos o muy grande, en vez de rechazarlo se lo damos a un dueño local de confianza. Usted hace el trabajo, nosotros manejamos el cliente y la facturación, y usted consigue cuentas fijas sin tener que salir a buscarlas. Y cuando usted esté full, nos pasa trabajo de la misma forma." },
    { h: 'Calificar', b: "Qué bueno, bastante tiempo. ¿Usted es el dueño y también está en el campo, o tiene un equipo manejándolo? … ¿Qué áreas cubre? … ¿Está rechazando trabajo estos días, o busca más? … ¿Me puede dar un COI — responsabilidad general (general liability), y workers' comp si tiene empleados? … ¿Tiene a alguien detrás para quedarse con esto algún día, o prácticamente es usted quien lo sostiene todo?" },
    { h: 'Objeciones', b: "\"¿Cuál es el truco / cómo ganan ustedes?\" → Nosotros mantenemos la relación con el cliente y un pequeño margen por administrarlo y garantizar el trabajo. A usted le pagan por limpiar, no por vender.\n\n\"Ya tengo suficiente trabajo.\" → Perfecto — usted es justo la persona que quiero tener a mano cuando esté sobrecargado. Y si le llega un mes flojo, ya sabe a quién llamar.\n\n\"¿Cómo sé que me van a pagar?\" → Nosotros le facturamos al cliente, usted nos factura a nosotros, con términos por escrito. Con gusto empezamos con una cuenta pequeña para que vea cómo trabajamos." },
    { h: 'Cierre', b: "Hagamos esto — lo agrego a nuestra red de subcontratistas. Para dejarlo todo en orden solo necesito un COI que muestre responsabilidad general (general liability) — y workers' comp si tiene empleados — y le mando un acuerdo sencillo de una página que dice que le estamos pasando trabajo a usted. ¿Le parece bien si le mando mi información y el documento por mensaje?" },
  ],
  customer: [
    { h: 'Apertura', b: "Hola [Name], le habla Fernando de Great Way Environmental — nosotros manejamos tanto la limpieza comercial como la jardinería aquí en [city]. La razón de mi llamada es rápida: la mayoría de las propiedades están pagando dos proveedores distintos, uno para limpieza y otro para las áreas verdes. Nosotros combinamos los dos en un solo contrato — una sola cuadrilla, una sola factura, un solo contacto." },
    { h: 'Valor', b: "Al combinarlo, usted deja de ser el intermediario entre el de limpieza y el de jardinería. Una sola cuadrilla, un solo contacto — si algo sale mal, llama a un solo número y se resuelve." },
    { h: 'Prueba social', b: "Ya nos encargamos de las ubicaciones de G&C, Lexus y Hilton cerca de usted, así que de todos modos estamos por su zona cada semana." },
    { h: 'Calificar', b: "¿Quién maneja su limpieza y jardinería ahora mismo — personal propio o contratado? … ¿Está contento con ellos, o es más bien un 'ahí va'? … ¿Cuándo se le vence el contrato actual?" },
    { h: 'Objeciones', b: "\"Ya estamos bajo contrato.\" → No hay problema — no le estoy pidiendo que rompa nada. ¿Cuándo se le vence? Le mando una comparación rápida para que esté listo.\n\n\"Solo mándeme el precio.\" → Cada propiedad es diferente — la única forma de darle un número real es una visita rápida de 10 minutos. Sin adivinar, sin compromiso.\n\n\"Estamos contentos con los que tenemos.\" → Me encanta. La mayoría de nuestros clientes también lo estaban — hasta que tener un solo proveedor para ambas cosas les resultó mucho menos complicado.\n\n\"¿Cuánto cuesta?\" → Para eso es justamente la visita — prefiero ver el espacio y darle un número real en vez de tirar un estimado por teléfono." },
    { h: 'Cierre', b: "Le propongo esto: una visita rápida de 10 minutos, le preparo una propuesta combinada que puede revisar y firmar en línea, y si no mejora lo que ya tiene, no pasa nada. ¿Le sirve mejor [day] por la mañana o por la tarde?" },
  ],
}
const SCRIPT_SETS = { en: SCRIPTS, es: SCRIPTS_ES }

/* question wrapper — defined at module scope so inputs keep focus while typing */
const Q = ({ prompt, children, opt }) => (
  <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 12, marginBottom: 14 }}>
    <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--t1)', marginBottom: 6 }}>“{prompt}” {opt && <span style={{ color: 'var(--t3)', fontStyle: 'normal' }}>(optional)</span>}</div>
    {children}
  </div>
)

/* ═══ GUIDED CALL INTAKE MODAL (launch from a lead's "Log Call") ═══ */
export function LogCall({ lead, onClose, onSaved }) {
  const { profile } = useAuth()
  const [leadMode, setLeadMode] = useState(lead ? 'attached' : 'new') // attached | existing | new | none
  const [leadQ, setLeadQ] = useState(''), [leadHits, setLeadHits] = useState([]), [picked, setPicked] = useState(lead || null), [newType, setNewType] = useState('cleaner')
  const activeLead = lead || picked
  const partnerType = activeLead?.lead_type || (leadMode === 'new' ? newType : null)
  const isCleaner = partnerType === 'cleaner' || partnerType === 'landscaper'  // both are sub/partner (same script)
  const [f, setF] = useState({
    business: lead?.name || '', contact_name: lead?.contact_person || '', phone: lead?.phone || '', email: lead?.email || '',
    purpose: ['cleaner', 'landscaper'].includes(lead?.lead_type) ? 'Partner / overflow outreach' : 'Bundle pitch', outcome: 'connected', callback_date: '', notes: '',
    has_employees: !!lead?.has_employees, gl: !!lead?.gl_received, wc: !!lead?.wc_received,
  })
  const [busy, setBusy] = useState(false)
  const [showScript, setShowScript] = useState(true)
  const [lang, setLang] = useState('en')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const [searching, setSearching] = useState(false)
  useEffect(() => {
    if (lead || leadMode !== 'existing') { setLeadHits([]); return }
    const s = leadQ.trim()
    if (!s) { setLeadHits([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(async () => {
      const term = s.replace(/[,()*]/g, ' ').trim()   // sanitize for PostgREST or()
      const { data, error } = await supabase.from('leads')
        .select('id,name,company,lead_type,phone,email,contact_person,notes,callback_date,has_employees,gl_received,wc_received')
        .or(`name.ilike.*${term}*,company.ilike.*${term}*,contact_person.ilike.*${term}*,phone.ilike.*${term}*`)
        .limit(10)
      if (!error) setLeadHits(data || [])
      setSearching(false)
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
    const cbDate = f.callback_date || (AUTO_CB.includes(f.outcome) ? nextBiz() : '')
    const stamp = `[${format(new Date(), 'MMM d')}] ${notePreview}`
    const newStatus = f.outcome === 'not_interested' ? 'lost' : 'contacted'
    let target = lead || picked || null
    let leadId = target?.id || null
    // create a lead from this call
    if (!lead && leadMode === 'new' && (f.business || f.contact_name || f.phone)) {
      const { data: nl } = await supabase.from('leads').insert({
        name: f.business || f.contact_name || 'New lead', company: f.business || null, contact_person: f.contact_name || null,
        phone: f.phone || null, email: f.email || null, lead_type: newType, source: 'Call log',
        status: newStatus, callback_date: cbDate || null, notes: stamp,
        ...(['cleaner', 'landscaper'].includes(newType) ? { has_employees: f.has_employees, gl_received: f.gl, wc_received: f.wc } : {}),
      }).select().single()
      leadId = nl?.id || null; target = null // already populated at insert
    }
    await supabase.from('call_logs').insert({
      lead_id: leadId, business: f.business, contact_name: f.contact_name, phone: f.phone, email: f.email,
      purpose: f.purpose, outcome: f.outcome, callback_date: cbDate || null, notes: notePreview, agent: profile?.id || null,
    })
    // update an attached/existing lead
    if (target?.id) {
      const patch = { status: newStatus, callback_date: cbDate || target.callback_date || null, contact_person: f.contact_name || target.contact_person, notes: [target.notes, stamp].filter(Boolean).join('\n') }
      if (isCleaner) { patch.has_employees = f.has_employees; patch.gl_received = f.gl; patch.wc_received = f.wc }
      await supabase.from('leads').update(patch).eq('id', target.id)
    }
    setBusy(false); onSaved && onSaved(); onClose()
  }

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
            {[['cleaner', 'Janitorial'], ['landscaper', 'Landscaping'], ['customer', 'Customer']].map(([v, lb]) => <button key={v} type="button" className={`btn btn-sm ${newType === v ? 'btn-p' : 'btn-g'}`} onClick={() => setNewType(v)}>{lb}</button>)}
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>New lead uses the name / phone you enter below.</span>
          </div>}
          {leadMode === 'existing' && (picked ? (
            <button type="button" className="loc-selected" onClick={() => setPicked(null)}><div><div className="loc-name">{picked.name}</div><div className="loc-street">{picked.lead_type} · {picked.phone || ''}</div></div><span className="loc-change">Change</span></button>
          ) : (
            <>
              <input className="inp" placeholder="Search by name, company, or phone…" value={leadQ} onChange={e => setLeadQ(e.target.value)} autoFocus />
              {leadHits.length > 0 && <div className="loc-list" style={{ marginTop: 6 }}>{leadHits.map(h => (
                <button type="button" key={h.id} className="loc-item" onClick={() => { setPicked(h); setLeadHits([]); setF(p => ({ ...p, business: h.name, contact_name: h.contact_person || p.contact_name, phone: h.phone || p.phone, email: h.email || p.email })) }}><div className="loc-name">{h.name}{h.company && h.company !== h.name ? ` · ${h.company}` : ''}</div><div className="loc-street">{h.lead_type === 'landscaper' ? 'Landscaping' : h.lead_type === 'cleaner' ? 'Janitorial' : 'Customer'}{h.phone ? ` · ${h.phone}` : ''}</div></button>
              ))}</div>}
              {leadQ.trim() && !searching && leadHits.length === 0 && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>No matches. Try a company name or phone, or use “Create new lead”.</div>}
              {searching && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>Searching…</div>}
            </>
          ))}
        </div>}

        <div className="fg2">
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                <div className="sec-t">📖 {isCleaner ? 'Cleaner / Partner' : 'Customer'} Script — read aloud</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[['en', 'EN'], ['es', 'ES']].map(([v, lb]) => <button key={v} type="button" className={`btn btn-sm ${lang === v ? 'btn-p' : 'btn-g'}`} onClick={() => setLang(v)}>{lb}</button>)}
                </div>
              </div>
              <div className="card script-box" style={{ maxHeight: 340, overflowY: 'auto', background: 'rgba(74,158,255,.06)', border: '1px solid rgba(74,158,255,.22)' }}>
                {SCRIPT_SETS[lang][isCleaner ? 'cleaner' : 'customer'].map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div className="sec-t" style={{ marginBottom: 3, color: 'var(--blue)' }}>{s.h}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{s.b}</div>
                  </div>
                ))}
              </div>
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
              <div style={{ fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>“Can you provide a COI — general liability, and workers' comp if you have employees?”</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className={`btn btn-sm ${f.has_employees ? 'btn-p' : 'btn-g'}`} onClick={() => set('has_employees', !f.has_employees)}>{f.has_employees ? '✓ Has employees' : 'No employees'}</button>
                <button type="button" className={`btn btn-sm ${f.gl ? 'btn-p' : 'btn-g'}`} onClick={() => set('gl', !f.gl)}>{f.gl ? '✓ GL' : 'GL?'}</button>
                {f.has_employees && <button type="button" className={`btn btn-sm ${f.wc ? 'btn-p' : 'btn-g'}`} onClick={() => set('wc', !f.wc)}>{f.wc ? '✓ WC' : 'WC?'}</button>}
              </div>
            </div>}
            <div className="fg2" style={{ marginBottom: 14 }}>
              <div className="field"><label className="field-lbl">Outcome</label><select className="inp" value={f.outcome} onChange={e => { const v = e.target.value; setF(p => ({ ...p, outcome: v, callback_date: (!p.callback_date && AUTO_CB.includes(v)) ? nextBiz() : p.callback_date })) }}>{OUTCOMES.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select></div>
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

/* ═══ CALL DETAIL / REVIEW MODAL ═══ */
function CallDetail({ call, onClose, onSaved, canManage }) {
  const [notes, setNotes] = useState(call.notes || '')
  const [outcome, setOutcome] = useState(call.outcome)
  const [cb, setCb] = useState(call.callback_date || '')
  const [busy, setBusy] = useState(false)
  const save = async () => { setBusy(true); await supabase.from('call_logs').update({ notes, outcome, callback_date: cb || null }).eq('id', call.id); setBusy(false); onSaved && onSaved(); onClose() }
  const del = async () => { if (!window.confirm('Delete this call log?')) return; setBusy(true); await supabase.from('call_logs').delete().eq('id', call.id); setBusy(false); onSaved && onSaved(); onClose() }
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}><Phone size={15} /> {call.business || 'Call'}</div>
          <button className="btn btn-g btn-sm" onClick={onClose}><X size={13} /></button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14 }}>
          {call.contact_name ? `${call.contact_name} · ` : ''}{call.phone ? <a href={`tel:${call.phone}`} style={{ color: 'var(--g-light)' }}>{call.phone}</a> : 'no phone'}
          {call.created_at ? ` · ${format(new Date(call.created_at), 'MMM d, yyyy h:mm a')}` : ''}
          {call.purpose ? ` · ${call.purpose}` : ''}
        </div>
        <div className="fg2" style={{ marginBottom: 14 }}>
          <div className="field"><label className="field-lbl">Outcome</label><select className="inp" value={outcome} onChange={e => setOutcome(e.target.value)}>{OUTCOMES.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select></div>
          <div className="field"><label className="field-lbl">Callback date</label><input type="date" className="inp" value={cb} onChange={e => setCb(e.target.value)} /></div>
        </div>
        <div className="field" style={{ marginBottom: 14 }}><label className="field-lbl">Call notes</label>
          <textarea className="inp" rows={8} style={{ resize: 'vertical', whiteSpace: 'pre-line', lineHeight: 1.6 }} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {canManage ? <button className="btn btn-d btn-sm" onClick={del} disabled={busy}><Trash2 size={13} /> Delete</button> : <span />}
          <button className="btn btn-p" onClick={save} disabled={busy}>{busy ? <span className="spin" style={{ borderTopColor: '#fff' }} /> : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

/* ═══ CALL LOGS TAB ═══ */
export function CallLogs() {
  const { profile } = useAuth()
  const canManage = profile?.role === 'manager'
  const [calls, setCalls] = useState([]), [people, setPeople] = useState([]), [busy, setBusy] = useState(true), [filter, setFilter] = useState('all'), [q, setQ] = useState(''), [modal, setModal] = useState(false), [sel, setSel] = useState(null), [showStats, setShowStats] = useState(false)
  const load = async () => {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('profiles').select('id, full_name'),
    ])
    setCalls(c || []); setPeople(p || []); setBusy(false)
  }
  useEffect(() => { load() }, [])
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
  const nameOf = id => people.find(p => p.id === id)?.full_name || 'Unassigned'
  const wkCalls = calls.filter(c => c.created_at >= weekStart)
  const repStats = [...new Set(wkCalls.map(c => c.agent || 'null'))].map(a => {
    const cs = wkCalls.filter(c => (c.agent || 'null') === a)
    return {
      agent: a, name: a === 'null' ? 'Unassigned' : nameOf(a), total: cs.length,
      connects: cs.filter(c => ['connected', 'interested'].includes(c.outcome)).length,
      callbacks: cs.filter(c => c.callback_date || c.outcome === 'callback').length,
      vm: cs.filter(c => c.outcome === 'voicemail').length,
      disc: cs.filter(c => c.outcome === 'disconnected').length,
    }
  }).sort((a, b) => b.total - a.total)
  const upd = async (id, patch) => { await supabase.from('call_logs').update(patch).eq('id', id); load() }
  const today = format(new Date(), 'yyyy-MM-dd')
  const isDue = c => c.callback_date && c.callback_date <= today && !['not_interested', 'disconnected'].includes(c.outcome)
  const due = calls.filter(isDue).sort((a, b) => (a.callback_date || '').localeCompare(b.callback_date || ''))
  const counts = OUTCOMES.reduce((a, o) => ({ ...a, [o]: calls.filter(c => c.outcome === o).length }), {})
  let shown = filter === 'all' ? calls : filter === 'due' ? calls.filter(isDue) : calls.filter(c => c.outcome === filter)
  if (q) { const s = q.toLowerCase(); shown = shown.filter(c => (c.business + ' ' + (c.contact_name || '') + ' ' + (c.phone || '') + ' ' + (c.notes || '')).toLowerCase().includes(s)) }

  return (
    <div className="pg">
      {modal && <LogCall onClose={() => setModal(false)} onSaved={load} />}
      {sel && <CallDetail call={sel} canManage={canManage} onClose={() => setSel(null)} onSaved={load} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800 }}>Call Logs</h1><p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 2 }}>{calls.length} total · {shown.length} shown</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-g" onClick={() => setShowStats(s => !s)}><BarChart3 size={13} /> Rep Stats</button>
          <button className="btn btn-g" title="Export shown calls to CSV" onClick={() => downloadCSV(`gwe_calls_${format(new Date(), 'yyyy-MM-dd')}.csv`, [
            { label: 'When', get: c => c.created_at ? format(new Date(c.created_at), 'yyyy-MM-dd HH:mm') : '' }, { label: 'Business', key: 'business' }, { label: 'Contact', key: 'contact_name' },
            { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }, { label: 'Purpose', key: 'purpose' }, { label: 'Outcome', key: 'outcome' },
            { label: 'Callback', key: 'callback_date' }, { label: 'Agent', get: c => nameOf(c.agent) }, { label: 'Notes', key: 'notes' },
          ], shown)}><Download size={13} /> Export</button>
          <button className="btn btn-p" onClick={() => setModal(true)}><Plus size={13} /> New Call</button>
          <button className="btn btn-g btn-sm" onClick={load}><RefreshCw size={13} /></button>
        </div>
      </div>
      {showStats && <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>📊 Rep Stats — this week</div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>{wkCalls.length} calls since {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}</p>
        {repStats.length === 0 ? <div style={{ color: 'var(--t3)', fontSize: 13 }}>No calls logged this week yet.</div> :
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--t3)', fontSize: 11, textTransform: 'uppercase' }}>
              <th style={{ padding: '6px 8px' }}>Rep</th><th style={{ padding: '6px 8px', textAlign: 'right' }}>Calls</th><th style={{ padding: '6px 8px', textAlign: 'right' }}>Connects</th><th style={{ padding: '6px 8px', textAlign: 'right' }}>Callbacks</th><th style={{ padding: '6px 8px', textAlign: 'right' }}>VM</th><th style={{ padding: '6px 8px', textAlign: 'right' }}>Disc.</th>
            </tr></thead>
            <tbody>{repStats.map(r => <tr key={r.agent} style={{ borderTop: '1px solid var(--bd)' }}>
              <td style={{ padding: '8px', fontWeight: 600 }}>{r.name}</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }} className="mono">{r.total}</td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'var(--g-light)' }} className="mono">{r.connects}</td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'var(--yellow)' }} className="mono">{r.callbacks}</td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'var(--t3)' }} className="mono">{r.vm}</td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'var(--red)' }} className="mono">{r.disc}</td>
            </tr>)}</tbody>
          </table></div>}
      </div>}
      {due.length > 0 && <div className="alrt" style={{ display: 'block', background: 'rgba(212,160,23,.08)', border: '1px solid rgba(212,160,23,.25)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--yellow)', marginBottom: 8 }}><Bell size={14} /> {due.length} callback{due.length > 1 ? 's' : ''} due — call these clients back</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {due.slice(0, 6).map(c => (
            <button key={c.id} onClick={() => setSel(c)} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, background: 'var(--bg3)', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', textAlign: 'left', color: 'var(--t1)' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.business || c.contact_name || 'Lead'} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>· {c.phone || 'no phone'}</span></span>
              <span style={{ fontSize: 12, color: c.callback_date < today ? 'var(--red)' : 'var(--yellow)', whiteSpace: 'nowrap' }}>{c.callback_date < today ? 'overdue' : 'due'} {c.callback_date}</span>
            </button>
          ))}
          {due.length > 6 && <button className="btn btn-g btn-sm" style={{ alignSelf: 'flex-start', marginTop: 2 }} onClick={() => setFilter('due')}>View all {due.length}</button>}
        </div>
      </div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {['all', 'due', ...OUTCOMES].map(o => <button key={o} className={`btn btn-sm ${filter === o ? 'btn-p' : 'btn-g'}`} onClick={() => setFilter(o)}>{o === 'due' ? '🔔 Due' : cap(o)}{o === 'all' ? ` (${calls.length})` : o === 'due' ? ` (${due.length})` : ` (${counts[o] || 0})`}</button>)}
      </div>
      <input className="inp" placeholder="Search name, caller, phone, notes…" value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12 }} />
      <div className="card card-f">
        {busy ? <div className="loader"><div className="spin spin-lg" /></div> : shown.length === 0 ? <div className="empty"><Phone size={24} /><p>No calls logged</p></div> :
          <div className="tw"><table><thead><tr><th>Business</th><th>Contact</th><th>Phone</th><th>Outcome</th><th>Callback</th><th>When</th><th></th></tr></thead><tbody>
            {shown.map(c => <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSel(c)}>
              <td style={{ fontWeight: 600 }}>{c.business || '—'}<div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400, maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.notes}</div></td>
              <td style={{ fontSize: 12 }}>{c.contact_name || '—'}</td>
              <td style={{ fontSize: 12 }} onClick={e => e.stopPropagation()}>{c.phone ? <a href={`tel:${c.phone}`} style={{ color: c.outcome === 'disconnected' ? 'var(--red)' : 'var(--g-light)', textDecoration: c.outcome === 'disconnected' ? 'line-through' : 'none' }}>{c.phone}</a> : '—'}{c.outcome === 'disconnected' && <span className="bdg bdg-r" style={{ marginLeft: 6, fontSize: 9 }}>disconnected</span>}</td>
              <td onClick={e => e.stopPropagation()}><select className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.outcome} onChange={e => { const v = e.target.value; const patch = { outcome: v }; if (!c.callback_date && AUTO_CB.includes(v)) patch.callback_date = nextBiz(); upd(c.id, patch) }}>{OUTCOMES.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select></td>
              <td onClick={e => e.stopPropagation()}><input type="date" className="inp" style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }} value={c.callback_date || ''} onChange={e => upd(c.id, { callback_date: e.target.value || null })} /></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>{c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : '—'}</td>
              <td style={{ fontSize: 11, color: 'var(--g-light)', whiteSpace: 'nowrap' }}>Review →</td>
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
