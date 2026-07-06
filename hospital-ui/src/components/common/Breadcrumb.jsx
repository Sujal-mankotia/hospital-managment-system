import { Link } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary">
        <FiHome size={14} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <FiChevronRight size={13} className="text-slate-light" />
          {item.path ? (
            <Link to={item.path} className="hover:text-primary">{item.label}</Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
