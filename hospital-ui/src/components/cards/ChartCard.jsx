export default function ChartCard({ title, description, actions, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="text-xs text-slate">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
