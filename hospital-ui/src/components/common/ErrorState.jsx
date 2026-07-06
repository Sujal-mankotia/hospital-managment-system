import { FiAlertTriangle } from 'react-icons/fi'
import Button from './Button'

export default function ErrorState({ title = 'Something went wrong', description = "We couldn't load this data. Try again.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-light text-rose">
        <FiAlertTriangle size={24} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-xs text-sm text-slate">{description}</p>
      {onRetry && <Button size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  )
}
