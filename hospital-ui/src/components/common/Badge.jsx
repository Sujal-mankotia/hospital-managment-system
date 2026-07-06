const styles = {
  success: 'bg-teal-light text-teal',
  info: 'bg-primary-light text-primary',
  warning: 'bg-amber-light text-amber',
  danger: 'bg-rose-light text-rose',
  neutral: 'bg-slate-100 text-slate',
}

const statusMap = {
  Admitted: 'info',
  Critical: 'danger',
  Stable: 'success',
  Discharged: 'neutral',
  Active: 'success',
  'On Leave': 'warning',
  Available: 'success',
  'In Surgery': 'warning',
  Confirmed: 'success',
  'In Progress': 'info',
  Waiting: 'warning',
  Cancelled: 'danger',
  Emergency: 'danger',
  Routine: 'info',
  'Follow-up': 'neutral',
}

export default function Badge({ children, tone, className = '' }) {
  const resolvedTone = tone || statusMap[children] || 'neutral'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[resolvedTone]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
