import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import { MdLogout } from 'react-icons/md'
import { navItems } from '../../constants/nav'
import { iconMap } from './navIcons'
import { useUI } from '../../context/UIContext'
import { useAuth } from '../../context/AuthContext'

function PulseLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <svg width="30" height="30" viewBox="0 0 40 40" className="shrink-0">
        <circle cx="20" cy="20" r="19" fill="#0F6FDE" />
        <polyline points="8,21 14,21 17,13 22,28 25,17 28,21 32,21" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-ink">Meridian</p>
          <p className="-mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-light">Health System</p>
        </div>
      )}
    </div>
  )
}

function NavItem({ item, collapsed }) {
  const { user } = useAuth()
  const Icon = iconMap[item.icon]
  if (item.roles && (!user || !item.roles.includes(user.role))) return null
  const content = (
    <>
      <Icon size={19} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.disabled && (
        <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-light">Soon</span>
      )}
    </>
  )

  if (item.disabled) {
    return (
      <div
        title={collapsed ? `${item.label} (Coming soon)` : undefined}
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-light/70"
      >
        {content}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-primary text-white shadow-sm' : 'text-slate hover:bg-primary-light hover:text-primary'
        }`
      }
    >
      {content}
    </NavLink>
  )
}

export default function Sidebar({ mobile = false }) {
  const { sidebarCollapsed, toggleSidebar, setMobileDrawerOpen } = useUI()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const collapsed = mobile ? false : sidebarCollapsed

  const handleLogout = () => {
    logout()
    setMobileDrawerOpen(false)
    navigate('/')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex h-full flex-col justify-between border-r border-line bg-surface py-5"
    >
      <div>
        <div className="mb-6 flex items-center justify-between px-4">
          <PulseLogo collapsed={collapsed} />
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 px-3">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose transition-colors hover:bg-rose-light"
        >
          <MdLogout size={19} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {!mobile && (
          <button
            onClick={toggleSidebar}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-line py-2 text-xs font-medium text-slate hover:border-primary/30 hover:text-primary"
          >
            {collapsed ? <FiChevronsRight size={15} /> : <><FiChevronsLeft size={15} /> Collapse</>}
          </button>
        )}
      </div>
    </motion.aside>
  )
}
