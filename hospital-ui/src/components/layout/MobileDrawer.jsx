import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useUI } from '../../context/UIContext'
import Sidebar from './Sidebar'

export default function MobileDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUI()
  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="relative z-10 h-full w-64 bg-surface shadow-cardHover"
          >
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate hover:bg-slate-100"
            >
              <FiX size={18} />
            </button>
            <Sidebar mobile />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
