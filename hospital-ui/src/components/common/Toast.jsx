import { AnimatePresence, motion } from 'framer-motion'
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi'
import { useUI } from '../../context/UIContext'

const icons = { success: FiCheckCircle, info: FiInfo, warning: FiAlertTriangle, error: FiAlertTriangle }
const tones = {
  success: 'text-teal bg-teal-light',
  info: 'text-primary bg-primary-light',
  warning: 'text-amber bg-amber-light',
  error: 'text-rose bg-rose-light',
}

export default function ToastStack() {
  const { toasts, dismissToast } = useUI()
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] || FiInfo
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-cardHover"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[t.type] || tones.info}`}>
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="text-xs text-slate">{t.description}</p>}
              </div>
              <button onClick={() => dismissToast(t.id)} className="text-slate-light hover:text-slate">
                <FiX size={15} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
