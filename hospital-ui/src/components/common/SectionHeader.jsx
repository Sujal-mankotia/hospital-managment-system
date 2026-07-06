export default function SectionHeader({ title, description, actions }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="text-xs text-slate">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
