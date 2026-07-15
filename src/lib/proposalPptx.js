// Generate a branded PowerPoint proposal in the browser (mirrors the 2026 template).
const NAVY = '0E2438', GREEN = '4CA85E', LGREEN = '6CBF78', GRAY = '5B6B78'
const money = (n) => (n == null || n === '') ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
const fdate = (d) => {
  if (!d) return '—'
  const t = typeof d === 'string' && d.length <= 10 ? new Date(d + 'T00:00:00') : new Date(d)
  return isNaN(t) ? '—' : t.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}
const DEFAULT_SCOPE = [
  'Trash removal — all bins emptied & relined',
  'Surface disinfection — desks, counters & shared surfaces',
  'Restroom cleaning — sanitized, restocked & deodorized',
  'Vacuuming — carpets, mats & upholstery',
  'Mopping — hard floors cleaned & polished',
  'Break room — sinks, appliances & surfaces',
]

export async function downloadProposalPptx(p) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'GWE', width: 10, height: 5.625 })
  pptx.layout = 'GWE'
  const foot = (s) => s.addText('greatwaye.com   •   (707) 718-3492   •   che@greatwaye.com',
    { x: 0.5, y: 5.2, w: 9, h: 0.3, fontSize: 9, color: GRAY, align: 'center' })
  const content = (title, sub) => {
    const s = pptx.addSlide(); s.background = { color: 'FFFFFF' }
    s.addText(title, { x: 0.6, y: 0.4, w: 8.8, h: 0.6, fontSize: 24, bold: true, color: NAVY })
    if (sub) s.addText(sub.toUpperCase(), { x: 0.6, y: 1.0, w: 8.8, h: 0.3, fontSize: 11, bold: true, color: GREEN, charSpacing: 1 })
    foot(s); return s
  }

  // COVER
  let s = pptx.addSlide(); s.background = { color: NAVY }
  s.addText('CLEAN SPACES.', { x: 0.6, y: 1.0, w: 8.8, h: 0.9, fontSize: 40, bold: true, color: 'FFFFFF' })
  s.addText('BETTER PLACES.', { x: 0.6, y: 1.85, w: 8.8, h: 0.9, fontSize: 40, bold: true, color: LGREEN })
  s.addText((p.title || 'Proposal for Services').toUpperCase(), { x: 0.6, y: 2.85, w: 8.8, h: 0.4, fontSize: 13, bold: true, color: LGREEN, charSpacing: 2 })
  s.addText([
    { text: 'Prepared For:  ', options: { color: '9FB2C0' } }, { text: (p.client_name || p.company || '—') + '\n', options: { color: 'FFFFFF', bold: true } },
    { text: 'Property:  ', options: { color: '9FB2C0' } }, { text: (p.property_address || '—') + '\n', options: { color: 'FFFFFF', bold: true } },
    { text: 'Date:  ', options: { color: '9FB2C0' } }, { text: fdate(p.created_at), options: { color: 'FFFFFF', bold: true } },
  ], { x: 0.6, y: 3.5, w: 8.8, h: 1.2, fontSize: 13, lineSpacingMultiple: 1.35 })
  s.addText('Great Way Environmental  •  greatwaye.com  •  (707) 718-3492', { x: 0.6, y: 5.2, w: 8.8, h: 0.3, fontSize: 9, color: '9FB2C0' })

  // CUSTOMER INFO
  s = content('Customer Information')
  const info = [['Company', p.company], ['Contact Person', p.contact_person], ['Phone', p.phone], ['Email', p.email], ['Property Address', p.property_address], ['Square Footage', p.square_footage], ['Building Type', p.building_type], ['Service Frequency', p.service_frequency], ['Walkthrough Date', fdate(p.walkthrough_date)], ['Prepared By', p.sales_rep]]
  info.forEach(([k, v], i) => {
    const x = 0.6 + (i % 2) * 4.5, y = 1.5 + Math.floor(i / 2) * 0.72
    s.addText(String(k).toUpperCase(), { x, y, w: 4.2, h: 0.25, fontSize: 9, color: GRAY, charSpacing: 1 })
    s.addText(v || '—', { x, y: y + 0.24, w: 4.2, h: 0.32, fontSize: 13, bold: true, color: NAVY })
  })

  // THANK YOU
  s = content('Thank You for Considering Great Way Environmental')
  s.addText(`Dear ${p.client_name || p.contact_person || 'Valued Client'},`, { x: 0.6, y: 1.4, w: 8.8, h: 0.3, fontSize: 13, bold: true, color: NAVY })
  s.addText('We appreciate the opportunity to provide a customized solution for your property. Our goal is reliable service, clear communication, and consistent results — every visit. With 50+ years of combined experience serving commercial and residential properties, Great Way Environmental is your trusted partner in cleanliness and property care.', { x: 0.6, y: 1.8, w: 8.8, h: 1.2, fontSize: 12, color: '33424D', lineSpacingMultiple: 1.3 });
  ['50+ Years Experience', 'Licensed & Insured', 'Minority Certified', 'Satisfaction Guaranteed', '24/7 Responsive'].forEach((b, i) =>
    s.addText('✔ ' + b, { x: 0.6 + (i % 3) * 3, y: 3.3 + Math.floor(i / 3) * 0.5, w: 2.9, h: 0.4, fontSize: 11, color: '2F7D43', fill: { color: 'EAF5EC' }, align: 'center' }))

  // SCOPE
  s = content('Scope of Work', "What's included in every visit")
  const scope = (p.scope && p.scope.length) ? p.scope : DEFAULT_SCOPE
  scope.forEach((item, i) => s.addText([{ text: '✔  ', options: { color: GREEN, bold: true } }, { text: item, options: { color: '33424D' } }],
    { x: 0.6 + (i % 2) * 4.5, y: 1.6 + Math.floor(i / 2) * 0.55, w: 4.3, h: 0.5, fontSize: 12 }))

  // SCHEDULE
  s = content('Service Schedule')
  s.addText('FREQUENCY', { x: 0.6, y: 1.5, w: 4, h: 0.3, fontSize: 10, color: GRAY, charSpacing: 1 })
  s.addText(p.service_frequency || '—', { x: 0.6, y: 1.8, w: 8, h: 0.5, fontSize: 20, bold: true, color: NAVY })
  s.addText(p.schedule_note || '', { x: 0.6, y: 2.6, w: 8.8, h: 0.6, fontSize: 12, color: '33424D' })
  s.addText('Adjustable by agreement.', { x: 0.6, y: 3.3, w: 8, h: 0.3, fontSize: 11, italic: true, color: GRAY })

  // INVESTMENT
  s = content('Your Investment', 'Transparent pricing. No surprises.')
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 3.6, h: 1.7, fill: { color: 'F6F9F7' }, line: { color: GREEN, width: 1 }, rectRadius: 0.1 })
  s.addText(money(p.monthly_price), { x: 0.6, y: 1.8, w: 3.6, h: 0.9, fontSize: 38, bold: true, color: NAVY, align: 'center' })
  s.addText('per month', { x: 0.6, y: 2.75, w: 3.6, h: 0.4, fontSize: 12, color: GRAY, align: 'center' });
  ['Labor & Equipment', 'Cleaning Supplies (if applicable)', 'Quality Control Inspections', 'Licensed & Insured Coverage'].forEach((li, i) =>
    s.addText('✔  ' + li, { x: 4.6, y: 1.7 + i * 0.45, w: 4.8, h: 0.4, fontSize: 13, color: '33424D' }))
  s.addText(p.terms || '', { x: 0.6, y: 3.7, w: 8.8, h: 0.3, fontSize: 10, color: GRAY })

  // ACCEPTANCE
  s = content('Proposal Acceptance')
  s.addText('By signing below, both parties agree to the scope of services and pricing outlined in this proposal.', { x: 0.6, y: 1.4, w: 8.8, h: 0.5, fontSize: 12, color: '33424D' })
  s.addText('ACCEPTED BY — CLIENT', { x: 0.6, y: 2.3, w: 4, h: 0.3, fontSize: 10, bold: true, color: NAVY })
  if (p.status === 'accepted') {
    if (p.accepted_signature) { try { s.addImage({ data: p.accepted_signature, x: 0.6, y: 2.6, w: 2.4, h: 0.55 }) } catch { /* ignore */ } }
    s.addText(`${p.accepted_name || ''}${p.accepted_title ? ', ' + p.accepted_title : ''}`, { x: 0.6, y: 3.25, w: 4, h: 0.3, fontSize: 13, bold: true, color: NAVY })
    s.addText('Signed ' + fdate(p.accepted_at), { x: 0.6, y: 3.55, w: 4, h: 0.3, fontSize: 10, color: GRAY })
  } else {
    s.addText('Name: __________________   Date: __________', { x: 0.6, y: 3.1, w: 4.2, h: 0.3, fontSize: 11, color: GRAY })
  }
  s.addText('AUTHORIZED BY — GREAT WAY ENVIRONMENTAL', { x: 5.2, y: 2.3, w: 4.2, h: 0.3, fontSize: 10, bold: true, color: NAVY })
  s.addText('Che Al Barri', { x: 5.2, y: 3.1, w: 4, h: 0.3, fontSize: 13, bold: true, color: NAVY })
  s.addText('Owner & Representative', { x: 5.2, y: 3.4, w: 4, h: 0.3, fontSize: 10, color: GRAY })

  const fn = `GWE Proposal - ${String(p.company || p.client_name || 'Client').replace(/[^a-z0-9]+/gi, ' ').trim()}.pptx`
  await pptx.writeFile({ fileName: fn })
}
