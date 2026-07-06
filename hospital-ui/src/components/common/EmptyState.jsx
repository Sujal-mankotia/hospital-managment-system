import { FiInbox } from 'react-icons/fi'

export default function EmptyState({ title = 'Nothing to show yet', description = 'New records will appear here once added.', icon: Icon = FiInbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-xs text-sm text-slate">{description}</p>
      {action}
    </div>
  )
}
