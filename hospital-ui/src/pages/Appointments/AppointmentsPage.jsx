import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiEye, FiXCircle, FiRefreshCw, FiCalendar, FiList } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import DataTable from '../../components/tables/DataTable'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import AppointmentForm from '../../components/forms/AppointmentForm'
import { WaitingListPanel, EmergencyQueuePanel } from '../../components/tables/QueuePanels'
import { waitingList, emergencyQueue } from '../../data/appointments'
import { doctors } from '../../data/doctors'
import { useUI } from '../../context/UIContext'

const PAGE_SIZE = 6
const STATUSES = ['All', 'Confirmed', 'In Progress', 'Waiting', 'Cancelled']
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function CalendarView({ items }) {
  const grouped = items.reduce((acc, a) => { (acc[a.date] ||= []).push(a); return acc }, {})
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(grouped).map(([date, apps]) => (
        <div key={date} className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <FiCalendar size={15} className="text-primary" />
            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2">
            {apps.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="font-medium text-ink">{a.time} · {a.patient}</span>
                <Badge tone={a.priority === 'Emergency' ? 'danger' : 'info'}>{a.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AppointmentsPage() {
  const { pushToast } = useUI()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [doctorFilter, setDoctorFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)

  const [detailsItem, setDetailsItem] = useState(null)
  const [bookOpen, setBookOpen] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const filtered = useMemo(() => appointments.filter((a) =>
    (status === 'All' || a.status === status) &&
    (doctorFilter === 'All' || a.doctor === doctorFilter) &&
    (!dateFilter || a.date === dateFilter) &&
    (
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.patientId?.toLowerCase().includes(search.toLowerCase())
    )
  ), [appointments, search, status, doctorFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadAppointments = () => {
    fetch(`${API}/api/appointments?limit=1000`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load appointments' }))
  }

  const loadPatients = () => {
    fetch(`${API}/api/patients?limit=1000`)
      .then((r) => r.json())
      .then((data) => setPatients(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load patients' }))
  }

  const handleBook = (data) => {
    fetch(`${API}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((newApp) => {
        setAppointments((a) => [newApp, ...a])
        setBookOpen(false)
        pushToast({ type: 'success', title: 'Appointment booked', description: `${newApp.patient} scheduled with ${newApp.doctor}.` })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Booking failed', description: err.error || String(err) }))
  }

  const handleCancel = () => {
    fetch(`${API}/api/appointments/${cancelTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((updated) => {
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
        pushToast({ type: 'info', title: 'Appointment cancelled' })
        setCancelTarget(null)
      })
      .catch((err) => pushToast({ type: 'error', title: 'Cancel failed', description: err.error || String(err) }))
  }

  const handleReschedule = (data) => {
    fetch(`${API}/api/appointments/${rescheduleTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((updated) => {
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
        pushToast({ type: 'success', title: 'Appointment rescheduled' })
        setRescheduleTarget(null)
      })
      .catch((err) => pushToast({ type: 'error', title: 'Reschedule failed', description: err.error || String(err) }))
  }

  useEffect(() => {
    loadAppointments()
    loadPatients()
  }, [])

  return (
    <div>
      <PageHeader
        title="Appointment Management"
        breadcrumb={[{ label: 'Appointments' }]}
        description="Book, track, and manage patient appointments across departments."
        actions={<Button icon={FiPlus} onClick={() => setBookOpen(true)}>Book Appointment</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WaitingListPanel items={waitingList} />
        <EmergencyQueuePanel items={emergencyQueue} />
      </div>

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by patient or appointment ID…" className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={doctorFilter} onChange={(e) => { setDoctorFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              <option>All</option>
              {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
            </select>
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate" />
            <div className="flex overflow-hidden rounded-full border border-line">
              <button onClick={() => setView('table')} className={`p-2 ${view === 'table' ? 'bg-primary text-white' : 'text-slate'}`}><FiList size={14} /></button>
              <button onClick={() => setView('calendar')} className={`p-2 ${view === 'calendar' ? 'bg-primary text-white' : 'text-slate'}`}><FiCalendar size={14} /></button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No appointments found" description="Try adjusting your search or filters." />
        ) : view === 'calendar' ? (
          <CalendarView items={filtered} />
        ) : (
          <>
            <DataTable columns={[
              { key: 'id', label: 'Appt ID' }, { key: 'patient', label: 'Patient' }, { key: 'doctor', label: 'Doctor' },
              { key: 'department', label: 'Department' }, { key: 'date', label: 'Date' }, { key: 'time', label: 'Time' },
              { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}>
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 id-tag">{a.id}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/patients?patientId=${a.patientId}`)}
                      className="text-left font-medium text-primary hover:underline"
                    >
                      {a.patient}
                    </button>
                    <p className="id-tag">{a.patientId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate">{a.doctor}</td>
                  <td className="px-4 py-3 text-slate">{a.department}</td>
                  <td className="px-4 py-3 text-slate">{a.date}</td>
                  <td className="px-4 py-3 text-slate">{a.time}</td>
                  <td className="px-4 py-3"><Badge tone={a.priority === 'Emergency' ? 'danger' : a.priority === 'Follow-up' ? 'neutral' : 'info'}>{a.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge>{a.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setDetailsItem(a)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="View"><FiEye size={15} /></button>
                      <button onClick={() => setRescheduleTarget(a)} className="rounded-lg p-1.5 text-slate hover:bg-amber-light hover:text-amber" title="Reschedule"><FiRefreshCw size={15} /></button>
                      <button onClick={() => setCancelTarget(a)} className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose" title="Cancel"><FiXCircle size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      <Modal open={!!detailsItem} onClose={() => setDetailsItem(null)} title="Appointment Details">
        {detailsItem && (
          <div className="space-y-3 text-sm">
            {[
              ['Appointment ID', detailsItem.id], ['Patient', `${detailsItem.patient} (${detailsItem.patientId})`], ['Doctor', detailsItem.doctor],
              ['Department', detailsItem.department], ['Date', detailsItem.date], ['Time', detailsItem.time],
              ['Priority', detailsItem.priority], ['Status', detailsItem.status],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between border-b border-line/70 py-2 last:border-0">
                <span className="text-slate-light">{label}</span>
                <span className="font-medium text-ink">{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment" size="lg">
        <AppointmentForm patients={patients} onSubmit={handleBook} onCancel={() => setBookOpen(false)} />
      </Modal>

      <Modal open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Reschedule Appointment">
        {rescheduleTarget && (
          <AppointmentForm patients={patients} defaultValues={rescheduleTarget} onSubmit={handleReschedule} onCancel={() => setRescheduleTarget(null)} submitLabel="Confirm New Slot" />
        )}
      </Modal>

      <ConfirmDialog
        open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel}
        title="Cancel this appointment?" description={`${cancelTarget?.patient}'s appointment with ${cancelTarget?.doctor} will be marked as cancelled.`}
        confirmLabel="Cancel Appointment" danger
      />
    </div>
  )
}
