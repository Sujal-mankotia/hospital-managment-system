const dotTone = {
  update: 'bg-primary', admission: 'bg-teal', discharge: 'bg-slate-light',
  billing: 'bg-amber', appointment: 'bg-primary', lab: 'bg-rose',
}

export default function ActivityFeed({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTone[a.type] || 'bg-slate-light'}`} />
          <div>
            <p className="text-sm text-ink">
              <span className="font-medium">{a.actor}</span> {a.action} <span className="font-medium">{a.target}</span>
            </p>
            <p className="text-xs text-slate-light">{a.time}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
