import { FiClock, FiAlertCircle } from 'react-icons/fi'
import Badge from '../common/Badge'

export function WaitingListPanel({ items }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <FiClock className="text-primary" size={16} />
        <h3 className="text-sm font-semibold text-ink">Waiting List</h3>
      </div>
      <div className="space-y-3">
        {items.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-xl border border-line p-3">
            <div>
              <p className="text-sm font-medium text-ink">{w.patient}</p>
              <p className="text-xs text-slate-light">{w.department} · waiting since {w.waitSince}</p>
            </div>
            <span className="rounded-lg bg-amber-light px-2.5 py-1 text-xs font-medium text-amber">~{w.estWait}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmergencyQueuePanel({ items }) {
  return (
    <div className="card border-rose/20 p-5">
      <div className="mb-4 flex items-center gap-2">
        <FiAlertCircle className="text-rose" size={16} />
        <h3 className="text-sm font-semibold text-ink">Emergency Queue</h3>
      </div>
      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-rose/20 bg-rose-light/40 p-3">
            <div>
              <p className="text-sm font-medium text-ink">{e.patient}</p>
              <p className="text-xs text-slate-light">{e.condition} · arrived {e.arrivedAt}</p>
            </div>
            <Badge tone={e.severity === 'Critical' ? 'danger' : 'warning'}>{e.severity}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
