import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiBell, FiMessageSquare } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import { notifications as notifData, messages as msgData } from '../../data/notifications'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = notifData.filter((n) => n.unread).length

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate hover:bg-slate-100">
        <FiBell size={17} />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose ring-2 ring-surface" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-cardHover"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">{unread} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifData.map((n) => (
                <div key={n.id} className="flex gap-3 border-b border-line/60 px-4 py-3 last:border-0 hover:bg-slate-50">
                  {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <div className={n.unread ? '' : 'pl-3.5'}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-xs text-slate">{n.detail}</p>
                    <p className="mt-0.5 text-[11px] text-slate-light">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MessageBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = msgData.filter((m) => m.unread).length

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate hover:bg-slate-100">
        <FiMessageSquare size={17} />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal ring-2 ring-surface" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-cardHover"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">Messages</p>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {msgData.map((m) => (
                <div key={m.id} className="flex gap-3 border-b border-line/60 px-4 py-3 last:border-0 hover:bg-slate-50">
                  <Avatar src={m.avatar} name={m.from} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{m.from}</p>
                    <p className="truncate text-xs text-slate">{m.preview}</p>
                    <p className="mt-0.5 text-[11px] text-slate-light">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
