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
import { listDoctors } from '../../api/doctorsApi'
import { useUI } from '../../context/UIContext'

const PAGE_SIZE = 6
const STATUSES = ['All', 'Confirmed', 'In Progress', 'Waiting', 'Cancelled']
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function authHeaders() {
  const token = localStorage.getItem('hospital_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function CalendarView({ items }) {
  const grouped = items.reduce((accumulator, appointment) => {
    (accumulator[appointment.date] ||= []).push(appointment)
    return accumulator
  }, {})

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(grouped).map(([date, apps]) => (
        <div key={date} className="rounded-xl border border-line p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <FiCalendar size={15} className="text-primary" />
            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2">
            {apps.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="font-medium text-ink">{appointment.time} - {appointment.patient}</span>
                <Badge tone={appointment.priority === 'Emergency' ? 'danger' : 'info'}>{appointment.priority}</Badge>
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
  const [doctors, setDoctors] = useState([])
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

  const filtered = useMemo(() => appointments.filter((appointment) =>
    (status === 'All' || appointment.status === status) &&
    (doctorFilter === 'All' || appointment.doctor === doctorFilter) &&
    (!dateFilter || appointment.date === dateFilter) &&
    (
      appointment.patient.toLowerCase().includes(search.toLowerCase()) ||
      appointment.id.toLowerCase().includes(search.toLowerCase()) ||
      appointment.patientId?.toLowerCase().includes(search.toLowerCase())
    )
  ), [appointments, search, status, doctorFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadAppointments = () => {
    fetch(`${API}/api/appointments?limit=1000`, { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((data) => setAppointments(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load appointments' }))
  }

  const loadPatients = () => {
    fetch(`${API}/api/patients?limit=1000`, { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((data) => setPatients(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load patients' }))
  }

  const loadDoctors = () => {
    listDoctors()
      .then((items) => setDoctors(items))
      .catch((error) => pushToast({ type: 'error', title: 'Failed to load doctors', description: error.message }))
  }

  const handleBook = (data) => {
    fetch(`${API}/api/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((newAppointment) => {
        setAppointments((items) => [newAppointment, ...items])
        setBookOpen(false)
        pushToast({ type: 'success', title: 'Appointment booked', description: `${newAppointment.patient} scheduled with ${newAppointment.doctor}.` })
      })
      .catch((error) => pushToast({ type: 'error', title: 'Booking failed', description: error.error || String(error) }))
  }

  const handleCancel = () => {
    fetch(`${API}/api/appointments/${cancelTarget.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'Cancelled' }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((updated) => {
        setAppointments((items) => items.map((appointment) => (appointment.id === updated.id ? updated : appointment)))
        pushToast({ type: 'info', title: 'Appointment cancelled' })
        setCancelTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Cancel failed', description: error.error || String(error) }))
  }

  const handleReschedule = (data) => {
    fetch(`${API}/api/appointments/${rescheduleTarget.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((updated) => {
        setAppointments((items) => items.map((appointment) => (appointment.id === updated.id ? updated : appointment)))
        pushToast({ type: 'success', title: 'Appointment rescheduled' })
        setRescheduleTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Reschedule failed', description: error.error || String(error) }))
  }

  useEffect(() => {
    loadAppointments()
    loadPatients()
    loadDoctors()
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
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by patient or appointment ID..." className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              {STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={doctorFilter} onChange={(e) => { setDoctorFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              <option>All</option>
              {doctors.map((doctor) => <option key={doctor.id}>{doctor.name}</option>)}
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
              {paged.map((appointment) => (
                <tr key={appointment.id} className="group transition-colors hover:bg-primary-light/40">
                  <td className="px-4 py-3 id-tag">{appointment.id}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/patients?patientId=${appointment.patientId}`)}
                      className="text-left font-medium text-primary hover:underline"
                    >
                      {appointment.patient}
                    </button>
                    <p className="id-tag">{appointment.patientId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate">{appointment.doctor}</td>
                  <td className="px-4 py-3 text-slate">{appointment.department}</td>
                  <td className="px-4 py-3 text-slate">{appointment.date}</td>
                  <td className="px-4 py-3 text-slate">{appointment.time}</td>
                  <td className="px-4 py-3"><Badge tone={appointment.priority === 'Emergency' ? 'danger' : appointment.priority === 'Follow-up' ? 'neutral' : 'info'}>{appointment.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge>{appointment.status}</Badge></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button onClick={() => setDetailsItem(appointment)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="View"><FiEye size={15} /></button>
                      <button onClick={() => setRescheduleTarget(appointment)} className="rounded-lg p-1.5 text-slate hover:bg-amber-light hover:text-amber" title="Reschedule"><FiRefreshCw size={15} /></button>
                      <button onClick={() => setCancelTarget(appointment)} className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose" title="Cancel"><FiXCircle size={15} /></button>
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
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-line/70 py-2 last:border-0">
                <span className="text-slate-light">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment" size="lg">
        <AppointmentForm patients={patients} doctors={doctors} onSubmit={handleBook} onCancel={() => setBookOpen(false)} />
      </Modal>

      <Modal open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Reschedule Appointment">
        {rescheduleTarget && (
          <AppointmentForm patients={patients} doctors={doctors} defaultValues={rescheduleTarget} onSubmit={handleReschedule} onCancel={() => setRescheduleTarget(null)} submitLabel="Confirm New Slot" />
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
