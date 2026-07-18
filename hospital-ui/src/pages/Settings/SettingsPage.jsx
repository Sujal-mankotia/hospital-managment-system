import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { apiRequest } from '../../api/hospitalApi'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { pushToast } = useUI()
  const [profile, setProfile] = useState(user)
  const [notifications, setNotifications] = useState(localStorage.getItem('hospital_notifications') !== 'false')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest('/settings')
      .then((data) => {
        setProfile(data.user)
        setNotifications(data.preferences?.notifications !== false)
      })
      .catch((err) => pushToast({ type: 'error', title: 'Failed to load settings', description: err.message }))
  }, [pushToast])

  const save = () => {
    setSaving(true)
    localStorage.setItem('hospital_notifications', String(notifications))
    apiRequest('/settings', { method: 'PUT', body: JSON.stringify({ notifications }) })
      .then(() => pushToast({ type: 'success', title: 'Settings saved', description: 'Your preferences were updated.' }))
      .catch((err) => pushToast({ type: 'error', title: 'Save failed', description: err.message }))
      .finally(() => setSaving(false))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'Not available')

  return (
    <div>
      <PageHeader title="Settings" breadcrumb={[{ label: 'Settings' }]} description="Profile details, notifications, and account actions." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">User</h3>
          <div className="rounded-xl border border-line p-4">
            <p className="font-display text-lg font-semibold text-ink">{profile?.name || 'User'}</p>
            <p className="text-sm text-slate">{profile?.email}</p>
            <div className="mt-3"><Badge>{profile?.role}</Badge></div>
          </div>
          <Button type="button" className="mt-4" variant="secondary" onClick={() => navigate('/forgot-password')}>Change Password</Button>
        </section>

        <section className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Account Details</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Full Name</p>
              <p className="mt-2 text-sm font-medium text-ink">{profile?.name || 'User'}</p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Email</p>
              <p className="mt-2 break-all text-sm font-medium text-ink">{profile?.email || 'Not available'}</p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Role</p>
              <p className="mt-2 text-sm font-medium capitalize text-ink">{profile?.role || 'patient'}</p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Notifications</p>
              <p className="mt-2 text-sm font-medium text-ink">{notifications ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Joined</p>
              <p className="mt-2 text-sm font-medium text-ink">{formatDate(profile?.createdAt)}</p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Last Updated</p>
              <p className="mt-2 text-sm font-medium text-ink">{formatDate(profile?.updatedAt)}</p>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Notifications</h3>
          <div className="flex gap-2">
            <Button type="button" variant={notifications ? 'primary' : 'secondary'} onClick={() => setNotifications(true)}>Enable Notifications</Button>
            <Button type="button" variant={!notifications ? 'primary' : 'secondary'} onClick={() => setNotifications(false)}>Disable Notifications</Button>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Account</h3>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
            <Button type="button" variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
