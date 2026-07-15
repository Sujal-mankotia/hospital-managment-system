import { FiClock, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi'
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

export function EmergencyQueuePanel({ items, onDelete, onAddClick }) {
  return (
    <div className="card border-rose/20 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-rose" size={16} />
          <h3 className="text-sm font-semibold text-ink">Emergency Queue</h3>
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 rounded-full bg-rose-light text-rose hover:bg-rose/10 px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <FiPlus size={14} /> Add Patient
          </button>
        )}
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-light py-4 text-center">No patients in emergency queue.</p>
        ) : (
          items.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-rose/20 bg-rose-light/40 p-3">
              <div>
                <p className="text-sm font-medium text-ink">{e.patient}</p>
                <p className="text-xs text-slate-light">{e.condition} · arrived {e.arrivedAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={e.severity === 'Critical' ? 'danger' : 'warning'}>{e.severity}</Badge>
                {onDelete && (
                  <button
                    onClick={() => onDelete(e.id, e.patient)}
                    className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose transition-colors"
                    title="Remove from Queue"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
