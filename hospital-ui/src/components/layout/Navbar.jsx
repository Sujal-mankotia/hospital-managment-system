import { useState, useRef, useEffect } from 'react'
import { FiMenu, FiCheck } from 'react-icons/fi'
import { MdPalette } from 'react-icons/md'
import SearchBar from '../common/SearchBar'
import ProfileDropdown from './ProfileDropdown'
import { NotificationBell, MessageBell } from './BellDropdown'
import { useUI } from '../../context/UIContext'
import { todayLabel } from '../../utils/format'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { setMobileDrawerOpen, theme, setTheme } = useUI()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const themesList = [
    { id: 'light', name: 'Clinical Blue', primaryColor: '#0F6FDE', bgColor: '#F5F8FB' },
    { id: 'dark', name: 'Midnight Dark', primaryColor: '#3B82F6', bgColor: '#0B121A' },
    { id: 'emerald', name: 'Emerald Wellness', primaryColor: '#059669', bgColor: '#F0FDF4' },
    { id: 'purple', name: 'Royal Amethyst', primaryColor: '#7C3AED', bgColor: '#FAF5FF' },
  ]

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
      <button
        onClick={() => setMobileDrawerOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate hover:bg-slate-100 lg:hidden"
      >
        <FiMenu size={19} />
      </button>

      <div className="hidden max-w-xs flex-1 sm:block">
        <SearchBar placeholder="Search patients, doctors, records…" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate md:inline-block">
          {todayLabel()}
        </span>

        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate hover:bg-slate-100 transition-colors"
            title="Switch Theme"
          >
            <MdPalette size={18} className="text-slate hover:text-primary transition-colors" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-surface p-2.5 shadow-card z-50"
              >
                <div className="px-2.5 pb-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-light">Select Theme</p>
                </div>
                <div className="flex flex-col gap-1">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id)
                        setDropdownOpen(false)
                      }}
                      className={`flex items-center gap-3 w-full rounded-xl px-2.5 py-2 text-sm font-medium transition-all ${
                        theme === t.id
                          ? 'bg-primary-light text-primary'
                          : 'text-slate hover:bg-slate-100'
                      }`}
                    >
                      {/* Theme Colors Preview bubble */}
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-line/50 overflow-hidden shadow-sm"
                        style={{ background: t.bgColor }}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.primaryColor }}
                        />
                      </div>
                      <span className="truncate">{t.name}</span>
                      {theme === t.id && (
                        <FiCheck size={16} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MessageBell />
        <NotificationBell />
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
        <ProfileDropdown />
      </div>
    </header>
  )
}
