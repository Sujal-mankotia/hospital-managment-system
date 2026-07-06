import { FiMenu, FiSun, FiMoon } from 'react-icons/fi'
import SearchBar from '../common/SearchBar'
import ProfileDropdown from './ProfileDropdown'
import { NotificationBell, MessageBell } from './BellDropdown'
import { useUI } from '../../context/UIContext'
import { todayLabel } from '../../utils/format'

export default function Navbar() {
  const { setMobileDrawerOpen, darkMode, toggleDarkMode } = useUI()

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
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate hover:bg-slate-100"
          title="Toggle dark mode (UI only)"
        >
          {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>
        <MessageBell />
        <NotificationBell />
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
        <ProfileDropdown />
      </div>
    </header>
  )
}
