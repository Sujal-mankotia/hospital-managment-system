import { FiUserPlus, FiCalendar, FiUsers, FiFileText } from 'react-icons/fi'
import { useUI } from '../../context/UIContext'

const icons = { patient: FiUserPlus, appointment: FiCalendar, doctor: FiUsers, report: FiFileText }

export default function QuickActions({ items }) {
  const { pushToast } = useUI()
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = icons[item.icon]
        return (
          <button
            key={item.label}
            onClick={() => pushToast({ type: 'success', title: item.label, description: 'Demo action — no backend connected.' })}
            className="flex flex-col items-start gap-2.5 rounded-xl border border-line p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary-light"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
              <Icon size={16} />
            </span>
            <span className="text-xs font-medium text-ink">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
