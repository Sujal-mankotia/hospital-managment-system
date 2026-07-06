import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import { useAuth } from '../../context/AuthContext'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-slate-100">
        <Avatar src={user?.avatar} name={user?.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-ink">{user?.name}</span>
          <span className="block text-xs text-slate-light">{user?.role}</span>
        </span>
        <FiChevronDown size={14} className="hidden text-slate-light sm:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-cardHover"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-slate-light">{user?.email}</p>
            </div>
            <div className="p-1.5">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate hover:bg-slate-100">
                <FiUser size={15} /> My Profile
              </button>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate hover:bg-slate-100">
                <FiSettings size={15} /> Account Settings
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose hover:bg-rose-light">
                <FiLogOut size={15} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
