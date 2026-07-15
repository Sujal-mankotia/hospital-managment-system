import { useState, useEffect, useMemo } from 'react'
import {
  FiUsers, FiSearch, FiTrash2, FiEdit2, FiUserPlus,
  FiFilter, FiShield, FiUser, FiActivity,
} from 'react-icons/fi'
import { MdOutlineLocalHospital, MdOutlinePersonOutline } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { useUI } from '../../context/UIContext'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
const PAGE_SIZE = 8

function authHeaders() {
  const token = localStorage.getItem('hospital_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Role badge styling
const ROLE_CONFIG = {
  admin:         { label: 'Admin',          color: 'bg-violet-100 text-violet-700 border-violet-200',  icon: FiShield },
  doctor:        { label: 'Doctor',         color: 'bg-sky-100 text-sky-700 border-sky-200',            icon: MdOutlineLocalHospital },
  receptionist:  { label: 'Receptionist',   color: 'bg-amber-100 text-amber-700 border-amber-200',     icon: FiUser },
  patient:       { label: 'Patient',        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: MdOutlinePersonOutline },
  lab_technician:{ label: 'Lab Tech',       color: 'bg-rose-100 text-rose-700 border-rose-200',        icon: FiActivity },
  pharmacist:    { label: 'Pharmacist',     color: 'bg-orange-100 text-orange-700 border-orange-200',  icon: FiActivity },
}

const ALL_ROLES = ['admin', 'doctor', 'receptionist', 'patient', 'lab_technician', 'pharmacist']

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'bg-slate-100 text-slate-600', icon: FiUser }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

// Stat card for role count
function StatCard({ role, count, total }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'bg-slate-100 text-slate-600', icon: FiUser }
  const Icon = cfg.icon
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.color} border`}>
          <Icon size={16} />
        </div>
        <span className="text-2xl font-bold text-ink">{count}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-ink">{cfg.label}s</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-current transition-all duration-500"
          style={{ width: `${pct}%`, color: cfg.color.split(' ')[1]?.replace('text-', '') }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-light">{pct}% of total</p>
    </div>
  )
}

export default function UsersPage() {
  const { pushToast } = useUI()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [editUser, setEditUser] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [editName, setEditName] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)

  // Load users
  const loadUsers = () => {
    setLoading(true)
    fetch(`${API}/users`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : r.json().then((e) => Promise.reject(e)))
      .then((data) => setUsers(data.users || []))
      .catch((e) => pushToast({ type: 'error', title: 'Failed to load users', description: e.message }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = {}
    ALL_ROLES.forEach((r) => { counts[r] = 0 })
    users.forEach((u) => { if (counts[u.role] !== undefined) counts[u.role]++ })
    return counts
  }, [users])

  // Filtered + paged
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'All' || u.role === roleFilter
      const q = search.toLowerCase()
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      return matchRole && matchSearch
    })
  }, [users, roleFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Edit user
  const openEdit = (user) => {
    setEditUser(user)
    setEditRole(user.role)
    setEditName(user.name)
  }

  const handleSaveEdit = async () => {
    setEditSaving(true)
    try {
      const res = await fetch(`${API}/users/${editUser.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: editName, role: editRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, name: editName, role: editRole } : u))
      pushToast({ type: 'success', title: 'User updated', description: `${editName} is now a ${editRole}.` })
      setEditUser(null)
    } catch (e) {
      pushToast({ type: 'error', title: 'Update failed', description: e.message })
    } finally {
      setEditSaving(false)
    }
  }

  // Delete user
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/users/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      pushToast({ type: 'info', title: 'User deleted', description: `${deleteTarget.name} was removed.` })
      setDeleteTarget(null)
    } catch (e) {
      pushToast({ type: 'error', title: 'Delete failed', description: e.message })
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        breadcrumb={[{ label: 'Admin' }, { label: 'Users' }]}
        description={`${users.length} registered user${users.length !== 1 ? 's' : ''} across all roles in the system.`}
        actions={
          <Button icon={FiUserPlus} onClick={() => navigate('/admin/users/new')}>
            Add User
          </Button>
        }
      />

      {/* Role stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ALL_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => { setRoleFilter(role === roleFilter ? 'All' : role); setPage(1) }}
            className={`text-left transition-all ${roleFilter === role ? 'ring-2 ring-primary ring-offset-1 rounded-2xl' : ''}`}
          >
            <StatCard role={role} count={roleCounts[role]} total={users.length} />
          </button>
        ))}
      </div>

      {/* Total summary bar */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-3">
        <FiUsers size={18} className="text-primary shrink-0" />
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-semibold text-ink">{users.length} Total Users</span>
          {ALL_ROLES.map((r) => roleCounts[r] > 0 && (
            <span key={r} className="text-slate">
              {roleCounts[r]} {ROLE_CONFIG[r]?.label || r}{roleCounts[r] !== 1 ? 's' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="card p-5">
        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:max-w-xs w-full">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-slate-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter size={14} className="text-slate-light" />
            <button
              onClick={() => { setRoleFilter('All'); setPage(1) }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === 'All' ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'}`}
            >
              All
            </button>
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === r ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'}`}
              >
                {ROLE_CONFIG[r]?.label || r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate">Loading users…</div>
        ) : paged.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search or filter." />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="min-w-full divide-y divide-line text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-light">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {paged.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <span className="font-medium text-ink">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate">{user.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-slate">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(user)}
                            className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary transition-colors"
                            title="Edit role"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose transition-colors"
                            title="Delete user"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Avatar name={editUser.name} size="md" />
              <div>
                <p className="font-medium text-ink">{editUser.name}</p>
                <p className="text-xs text-slate">{editUser.email}</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSaveEdit} disabled={editSaving} className="flex-1">
                {editSaving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditUser(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        description={`This will permanently delete ${deleteTarget?.name} (${deleteTarget?.role}) from the system. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
