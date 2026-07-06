const typeTone = { vitals: 'bg-primary', test: 'bg-teal', admission: 'bg-amber', medication: 'bg-rose' }

export default function MedicalTimeline({ items = [] }) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-slate">No recorded medical history yet.</p>
  }
  return (
    <ol className="relative ml-2 border-l-2 border-line pl-6">
      {items.map((h, i) => (
        <li key={i} className="mb-6 last:mb-0">
          <span className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-surface ${typeTone[h.type] || 'bg-slate-light'}`} />
          <p className="text-xs font-medium text-slate-light">{h.date}</p>
          <p className="text-sm font-semibold text-ink">{h.title}</p>
          <p className="text-sm text-slate">{h.detail}</p>
        </li>
      ))}
    </ol>
  )
}
