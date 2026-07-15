import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SignaturePad from '../components/SignaturePad'

const money = (n) => (n == null || n === '') ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
const fmtDate = (d) => {
  if (!d) return '—'
  const dt = typeof d === 'string' && d.length <= 10 ? new Date(d + 'T00:00:00') : new Date(d)
  return isNaN(dt) ? '—' : dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export const DEFAULT_SCOPE = [
  'Trash removal — all bins emptied & relined',
  'Surface disinfection — desks, counters & shared surfaces',
  'Restroom cleaning — sanitized, restocked & deodorized',
  'Vacuuming — carpets, mats & upholstery',
  'Mopping — hard floors cleaned & polished',
  'Break room — sinks, appliances & surfaces',
]

const ADDL = [
  ['PROPERTY CARE', ['Graffiti Removal', 'High-Rise Window Cleaning', 'Water Damage Restoration', 'Carpet & Rug Care', 'Interior/Exterior Paint', 'Floor Care', 'Pressure Washing', 'Fence Repair', 'Solar Panel Cleaning', 'Debris Removal']],
  ['LANDSCAPING', ['Shrub & Tree Removal', 'Lawn Care', 'Design & Plant', 'Leaf & Debris Removal', 'Pebble, Bark & Mulch', 'Retaining Wall Build']],
  ['RESIDENTIAL TURNOVER', ['Pest Removal', 'Junk Removal', 'Appliance Removal', 'Flooring & Carpet', 'Bio-Hazard Disinfection', 'Window Cleaning', 'High Dusting', 'Debris Disposal']],
]

export function ProposalDoc({ p }) {
  const scope = (p.scope && p.scope.length) ? p.scope : DEFAULT_SCOPE
  const info = [
    ['Company', p.company], ['Contact Person', p.contact_person], ['Phone', p.phone], ['Email', p.email],
    ['Property Address', p.property_address], ['Square Footage', p.square_footage], ['Building Type', p.building_type],
    ['Service Frequency', p.service_frequency], ['Walkthrough Date', fmtDate(p.walkthrough_date)], ['Prepared By', p.sales_rep],
  ]
  return (
    <div className="gwe-proposal">
      <style>{PROPOSAL_CSS}</style>

      <section className="gp-cover gp-page">
        <img src="/logo.svg" alt="Great Way Environmental" className="gp-logo" onError={e => { e.currentTarget.style.display = 'none' }} />
        <div className="gp-hero">
          <div className="gp-h1">CLEAN SPACES.</div>
          <div className="gp-h1 grn">BETTER PLACES.</div>
          <div className="gp-title">{p.title || 'Proposal for Services'}</div>
          <div className="gp-meta">
            <div><span>Prepared For</span><b>{p.client_name || p.company || '—'}</b></div>
            <div><span>Property</span><b>{p.property_address || '—'}</b></div>
            <div><span>Date</span><b>{fmtDate(p.created_at)}</b></div>
          </div>
        </div>
        <div className="gp-foot">Great Way Environmental &nbsp;•&nbsp; greatwaye.com &nbsp;•&nbsp; (707) 718-3492</div>
      </section>

      <section className="gp-page">
        <h2 className="gp-h2">Customer Information</h2>
        <div className="gp-grid2">
          {info.map(([k, v]) => (
            <div key={k} className="gp-field"><span>{k}</span><b>{v || '—'}</b></div>
          ))}
        </div>
      </section>

      <section className="gp-page">
        <h2 className="gp-h2">Thank You for Considering Great Way Environmental</h2>
        <p className="gp-body">Dear {p.client_name || p.contact_person || 'Valued Client'},</p>
        <p className="gp-body">We appreciate the opportunity to provide a customized solution for your property. Our goal is to deliver reliable service, clear communication, and consistent results — every single visit. With over 50+ years of combined experience serving commercial and residential properties, Great Way Environmental is your trusted partner in cleanliness and property care.</p>
        <div className="gp-badges">
          {['50+ Years Combined Experience', 'Licensed & Fully Insured', 'Minority Certified Business', 'Satisfaction Guaranteed', '24/7 Responsive Service'].map(b => <span key={b} className="gp-badge">✔ {b}</span>)}
        </div>
      </section>

      <section className="gp-page">
        <h2 className="gp-h2">Scope of Work</h2>
        <div className="gp-sub">WHAT'S INCLUDED IN EVERY VISIT</div>
        <div className="gp-scope">
          {scope.map((s, i) => (
            <div key={i} className="gp-scope-item"><span className="gp-check">✔</span>{s}</div>
          ))}
        </div>
      </section>

      <section className="gp-page">
        <h2 className="gp-h2">Service Schedule</h2>
        <div className="gp-field" style={{ marginBottom: 14 }}><span>Frequency</span><b>{p.service_frequency || '—'}</b></div>
        <p className="gp-body">{p.schedule_note}</p>
        <div className="gp-sub" style={{ marginTop: 10 }}>Adjustable by agreement.</div>
      </section>

      <section className="gp-page gp-invest">
        <h2 className="gp-h2">Your Investment</h2>
        <div className="gp-sub">TRANSPARENT PRICING. NO SURPRISES.</div>
        <div className="gp-price">
          <div className="gp-price-amt">{money(p.monthly_price)}<small>/ month</small></div>
          <ul>
            <li>✔ Labor & Equipment</li>
            <li>✔ Cleaning Supplies (if applicable)</li>
            <li>✔ Quality Control Inspections</li>
            <li>✔ Licensed & Insured Coverage</li>
          </ul>
        </div>
        <div className="gp-terms">{p.terms}</div>
      </section>

      <section className="gp-page">
        <h2 className="gp-h2">Additional Services Available</h2>
        <div className="gp-grid3">
          {ADDL.map(([cat, items]) => (
            <div key={cat}><div className="gp-cat">{cat}</div>{items.map(x => <div key={x} className="gp-addl">• {x}</div>)}</div>
          ))}
        </div>
      </section>

      <section className="gp-page gp-accept-doc">
        <h2 className="gp-h2">Proposal Acceptance</h2>
        <p className="gp-body">By signing below, both parties agree to the scope of services and pricing outlined in this proposal.</p>
        <div className="gp-grid2">
          <div className="gp-sign">
            <div className="gp-sign-lbl">ACCEPTED BY — CLIENT</div>
            {p.status === 'accepted' ? (
              <>
                {p.accepted_signature && <img src={p.accepted_signature} alt="signature" className="gp-sig-img" />}
                <div className="gp-sign-line">{p.accepted_name}{p.accepted_title ? `, ${p.accepted_title}` : ''}</div>
                <div className="gp-sign-date">Signed {fmtDate(p.accepted_at)}</div>
              </>
            ) : <div className="gp-sign-line gp-sign-blank">Awaiting signature</div>}
          </div>
          <div className="gp-sign">
            <div className="gp-sign-lbl">AUTHORIZED BY — GREAT WAY ENVIRONMENTAL</div>
            <div className="gp-sign-line">Che Al Barri</div>
            <div className="gp-sign-date">Owner & Representative</div>
          </div>
        </div>
        <div className="gp-foot" style={{ color: '#5b6b78' }}>Questions? (707) 718-3492 • che@greatwaye.com • greatwaye.com</div>
      </section>
    </div>
  )
}

/* ═══ PUBLIC SIGNABLE PAGE (/p/:token) ═══ */
export default function PublicProposal() {
  const { token } = useParams()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [sig, setSig] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => supabase.rpc('get_proposal', { p_token: token }).then(({ data }) => { setP(data && data[0]); setLoading(false) })
  useEffect(() => { load() }, [token])

  const accept = async () => {
    if (!name || !sig) return
    setBusy(true)
    const { error } = await supabase.rpc('accept_proposal', { p_token: token, p_name: name, p_title: title, p_signature: sig })
    setBusy(false)
    if (!error) load()
  }

  if (loading) return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef1f4' }}><div className="spin spin-lg" /></div>
  if (!p) return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#eef1f4', color: '#0e2438', fontFamily: 'Arial, sans-serif' }}>Proposal not found or the link has expired.</div>

  return (
    <div style={{ background: '#eef1f4', minHeight: '100dvh', paddingBottom: 60 }}>
      <div className="gp-bar no-print">
        <span>Great Way Environmental — Proposal</span>
        <button onClick={() => window.print()}>🖨 Print / Save PDF</button>
      </div>
      <ProposalDoc p={p} />
      <div className="gp-signbox no-print gwe-proposal">
        <style>{PROPOSAL_CSS}</style>
        {p.status === 'accepted' ? (
          <div className="gp-accepted">✔ Accepted by <b>{p.accepted_name}</b> on {fmtDate(p.accepted_at)}. Thank you!</div>
        ) : (
          <div className="gp-page" style={{ maxWidth: 720 }}>
            <h2 className="gp-h2">Accept & Sign</h2>
            <div className="gp-grid2">
              <div className="gp-field-in"><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
              <div className="gp-field-in"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Facilities Manager" /></div>
            </div>
            <div className="gp-field-in"><label>Signature</label><SignaturePad onSave={setSig} height={160} /></div>
            <button className="gp-accept-btn" onClick={accept} disabled={busy || !name || !sig}>{busy ? 'Submitting…' : 'Accept Proposal & Sign'}</button>
            <p style={{ fontSize: 12, color: '#5b6b78', marginTop: 8 }}>By signing you agree to the scope and pricing above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const PROPOSAL_CSS = `
.gwe-proposal{--navy:#0e2438;--grn:#4ca85e;--grn2:#6cbf78;color:#1e2a33;font-family:Arial,Helvetica,sans-serif;max-width:900px;margin:0 auto;background:#fff}
.gwe-proposal *{box-sizing:border-box}
.gp-page{padding:40px 48px;border-bottom:1px solid #e5e9ec}
.gp-cover{background:var(--navy);color:#fff;padding-bottom:34px}
.gp-logo{width:88px;height:88px;object-fit:contain;margin-bottom:18px}
.gp-h1{font-size:44px;font-weight:900;line-height:1.02;letter-spacing:-1px}
.gp-h1.grn{color:var(--grn2)}
.gp-title{margin-top:16px;font-size:15px;font-weight:700;letter-spacing:2px;color:var(--grn2);text-transform:uppercase}
.gp-meta{margin-top:26px;display:flex;gap:36px;flex-wrap:wrap}
.gp-meta span{display:block;font-size:11px;letter-spacing:1px;color:#9fb2c0;text-transform:uppercase}
.gp-meta b{font-size:15px}
.gp-foot{margin-top:26px;font-size:12px;color:#9fb2c0}
.gp-h2{color:var(--navy);font-size:24px;font-weight:800;margin:0 0 6px}
.gp-sub{font-size:12px;font-weight:700;letter-spacing:1.5px;color:var(--grn);text-transform:uppercase;margin-bottom:16px}
.gp-body{font-size:14px;line-height:1.6;color:#33424d;margin:8px 0}
.gp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px 28px;margin-top:14px}
.gp-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:8px}
.gp-field{border-bottom:1px solid #e5e9ec;padding-bottom:8px}
.gp-field span{display:block;font-size:11px;letter-spacing:1px;color:#8a99a5;text-transform:uppercase}
.gp-field b{font-size:15px;color:#1e2a33}
.gp-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.gp-badge{background:#eaf5ec;color:#2f7d43;font-size:12px;font-weight:600;padding:6px 12px;border-radius:20px}
.gp-scope{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}
.gp-scope-item{display:flex;gap:10px;font-size:14px;color:#33424d;align-items:flex-start}
.gp-check{color:var(--grn);font-weight:900}
.gp-invest{background:#f6f9f7}
.gp-price{display:flex;gap:30px;align-items:center;flex-wrap:wrap;margin-top:6px}
.gp-price-amt{font-size:44px;font-weight:900;color:var(--navy)}
.gp-price-amt small{font-size:16px;font-weight:600;color:#5b6b78;margin-left:6px}
.gp-price ul{list-style:none;padding:0;margin:0;font-size:14px;color:#33424d}
.gp-price li{margin:5px 0}
.gp-terms{margin-top:18px;font-size:12px;color:#5b6b78;border-top:1px solid #e5e9ec;padding-top:12px}
.gp-cat{color:var(--grn);font-size:12px;font-weight:800;letter-spacing:1px;margin-bottom:8px}
.gp-addl{font-size:13px;color:#33424d;margin:3px 0}
.gp-sign{margin-top:10px}
.gp-sign-lbl{font-size:11px;font-weight:800;letter-spacing:1px;color:var(--navy);margin-bottom:8px}
.gp-sig-img{max-height:70px;display:block;margin-bottom:4px}
.gp-sign-line{border-top:2px solid #1e2a33;padding-top:6px;font-weight:700}
.gp-sign-blank{color:#9aa7b1;font-weight:500;font-style:italic}
.gp-sign-date{font-size:12px;color:#5b6b78;margin-top:2px}
.gp-bar{position:sticky;top:0;z-index:10;background:var(--navy,#0e2438);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;font-size:14px;font-weight:600}
.gp-bar button{background:#4ca85e;color:#fff;border:none;padding:9px 16px;border-radius:8px;font-weight:700;cursor:pointer}
.gp-signbox{margin-top:18px}
.gp-field-in{margin-bottom:14px}
.gp-field-in label{display:block;font-size:12px;font-weight:700;color:#5b6b78;margin-bottom:6px}
.gp-field-in input{width:100%;padding:11px 12px;border:1px solid #cfd8de;border-radius:8px;font-size:15px}
.gp-accept-btn{width:100%;background:#4ca85e;color:#fff;border:none;padding:15px;border-radius:10px;font-size:16px;font-weight:800;cursor:pointer}
.gp-accept-btn:disabled{opacity:.5;cursor:default}
.gp-accepted{max-width:720px;margin:18px auto;background:#eaf5ec;color:#2f7d43;padding:18px;border-radius:12px;font-size:15px;text-align:center;font-weight:600}
@media(max-width:640px){.gp-grid2,.gp-grid3,.gp-scope{grid-template-columns:1fr}.gp-page{padding:28px 20px}.gp-h1{font-size:34px}.gp-price-amt{font-size:36px}}
@media print{.no-print{display:none!important}.gp-page{page-break-inside:avoid}body{background:#fff}}
`
