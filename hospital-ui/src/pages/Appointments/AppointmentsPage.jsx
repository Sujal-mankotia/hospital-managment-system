import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiEye, FiXCircle, FiRefreshCw, FiCalendar, FiList } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { emergencyQueue as staticEmergencyQueue } from '../../data/appointments'
import { listDoctors } from '../../api/doctorsApi'
import { useUI } from '../../context/UIContext'
import { apiRequest } from '../../api/hospitalApi'

const PAGE_SIZE = 6
const STATUSES = ['All', 'Confirmed', 'In Progress', 'Waiting', 'Cancelled']

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
                  <span className="font-medium text-ink">{appointment.time} - {appointment.patient || appointment.patientId}</span>
                  <Badge tone={appointment.priority === 'Emergency' ? 'danger' : 'info'}>{appointment.priority}</Badge>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AddToQueueForm({ patients, onSubmit, onCancel }) {
  const [isTrauma, setIsTrauma] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [customName, setCustomName] = useState('')
  const [condition, setCondition] = useState('')
  const [priority, setPriority] = useState('3') // Default Critical

  const handleSubmit = (e) => {
    e.preventDefault()
    const patientName = isTrauma ? customName : (patients.find(p => p.id === selectedPatientId || p._id === selectedPatientId)?.name || '')
    if (!patientName) {
      alert('Please select or enter a patient name')
      return
    }
    onSubmit({
      patientName,
      condition,
      priority: Number(priority)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="isTrauma"
          checked={isTrauma}
          onChange={(e) => {
            setIsTrauma(e.target.checked)
            setSelectedPatientId('')
            setCustomName('')
          }}
          className="rounded border-line text-primary focus:ring-primary h-4 w-4"
        />
        <label htmlFor="isTrauma" className="text-xs font-semibold text-ink cursor-pointer select-none">
          Trauma Case / Unregistered Patient
        </label>
      </div>

      {!isTrauma ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate">Select Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            required
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate">Patient Name / Identifier</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Unknown Trauma Case"
            required
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate">Condition / Diagnosis</label>
        <input
          type="text"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="e.g. Cardiac Arrhythmia"
          required
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate">Severity Level</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
        >
          <option value="3">Critical (High Urgency)</option>
          <option value="2">High (Medium Urgency)</option>
          <option value="1">Medium / Low (Routine Emergency)</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-line">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add to Queue</Button>
      </div>
    </form>
  )
}

export default function AppointmentsPage() {
  const { pushToast } = useUI()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [doctorFilter, setDoctorFilter] = useState('All')
  const [patientFilter, setPatientFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)

  const [detailsItem, setDetailsItem] = useState(null)
  const [bookOpen, setBookOpen] = useState(false)
  const [bookDefaults, setBookDefaults] = useState(null)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [emergencyQueue, setEmergencyQueue] = useState([])
  const [eqModalOpen, setEqModalOpen] = useState(false)
  const [deleteEqTarget, setDeleteEqTarget] = useState(null)

  const patientNameMap = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id || patient._id, patient.name])),
    [patients]
  )
  const doctorNameMap = useMemo(
    () => Object.fromEntries(doctors.map((doctor) => [doctor.id || doctor._id, doctor.name])),
    [doctors]
  )
  const resolvePatientLabel = (appointment) => appointment.patient || patientNameMap[appointment.patientId] || 'Unknown patient'
  const resolveDoctorLabel = (appointment) => appointment.doctor || doctorNameMap[appointment.doctorId] || 'Unknown doctor'

  const filtered = useMemo(() => appointments.filter((appointment) =>
    (status === 'All' || appointment.status === status) &&
    (doctorFilter === 'All' || appointment.doctorId === doctorFilter || appointment.doctor === doctorFilter) &&
    (patientFilter === 'All' || appointment.patientId === patientFilter || appointment.patient === patientFilter) &&
    (!dateFilter || appointment.date === dateFilter) &&
    (
      resolvePatientLabel(appointment).toLowerCase().includes(search.toLowerCase()) ||
      resolveDoctorLabel(appointment).toLowerCase().includes(search.toLowerCase()) ||
      appointment.id?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.patientId?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.doctorId?.toLowerCase().includes(search.toLowerCase())
    )
  ), [appointments, search, status, doctorFilter, patientFilter, dateFilter, patientNameMap, doctorNameMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadAppointments = () => {
    apiRequest('/appointments?limit=1000')
      .then((data) => setAppointments(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load appointments' }))
  }

  const loadPatients = () => {
    apiRequest('/patients?limit=1000')
      .then((data) => setPatients(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load patients' }))
  }

  const loadDoctors = () => {
    listDoctors()
      .then((items) => setDoctors(items))
      .catch((error) => pushToast({ type: 'error', title: 'Failed to load doctors', description: error.message }))
  }

  const loadEmergencyQueue = () => {
    apiRequest('/queue/emergency')
      .then((data) => setEmergencyQueue(data.queue || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load emergency queue' }))
  }

  const handleAddToEmergencyQueue = (data) => {
    apiRequest('/queue/emergency', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((result) => {
        setEmergencyQueue(result.queue || [])
        setEqModalOpen(false)
        pushToast({ type: 'success', title: 'Added to Emergency Queue', description: `${data.patientName} has been added.` })
      })
      .catch((error) => pushToast({ type: 'error', title: 'Failed to add to queue', description: error.message || String(error) }))
  }

  const handleRemoveFromEmergencyQueue = () => {
    if (!deleteEqTarget) return
    apiRequest(`/queue/emergency/${deleteEqTarget.id}`, {
      method: 'DELETE',
    })
      .then((result) => {
        setEmergencyQueue(result.queue || [])
        pushToast({ type: 'info', title: 'Removed from Emergency Queue', description: `${deleteEqTarget.name} has been removed.` })
        setDeleteEqTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Failed to remove patient', description: error.message || String(error) }))
  }

  useEffect(() => {
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const appointmentStatus = searchParams.get('status')
    const date = searchParams.get('date')
    const searchTerm = searchParams.get('search')
    const openBook = searchParams.get('book') === '1'

    setDoctorFilter(doctorId || 'All')
    setPatientFilter(patientId || 'All')
    setStatus(appointmentStatus || 'All')
    setDateFilter(date || '')
    setSearch(searchTerm || '')

    if (openBook) {
      setBookDefaults({
        doctorId: doctorId || '',
        patientId: patientId || '',
      })
      setBookOpen(true)
    } else {
      setBookOpen(false)
      setBookDefaults(null)
    }
  }, [searchParams])

  const handleBook = (data) => {
    apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((newAppointment) => {
        setAppointments((items) => [newAppointment, ...items])
        setBookOpen(false)
        setBookDefaults(null)
        pushToast({ type: 'success', title: 'Appointment booked', description: `${newAppointment.patient} scheduled with ${newAppointment.doctor}.` })
      })
      .catch((error) => pushToast({ type: 'error', title: 'Booking failed', description: error.message || String(error) }))
  }

  const handleCancel = () => {
    apiRequest(`/appointments/${cancelTarget.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' }),
    })
      .then((updated) => {
        setAppointments((items) => items.map((appointment) => (appointment.id === updated.id ? updated : appointment)))
        pushToast({ type: 'info', title: 'Appointment cancelled' })
        setCancelTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Cancel failed', description: error.message || String(error) }))
  }

  const handleReschedule = (data) => {
    apiRequest(`/appointments/${rescheduleTarget.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, status: 'Confirmed' }),
    })
      .then((updated) => {
        setAppointments((items) => items.map((appointment) => (appointment.id === updated.id ? updated : appointment)))
        pushToast({ type: 'success', title: 'Appointment rescheduled' })
        setRescheduleTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Reschedule failed', description: error.message || String(error) }))
  }

  useEffect(() => {
    loadAppointments()
    loadPatients()
    loadDoctors()
    loadEmergencyQueue()
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
        <WaitingListPanel items={appointments.filter((a) => a.status === 'Waiting').map((a) => ({
          id: a.id,
          patient: resolvePatientLabel(a),
          department: a.department,
          waitSince: a.time,
          estWait: '—',
        }))} />
        <EmergencyQueuePanel
          items={emergencyQueue}
          onDelete={(id, name) => setDeleteEqTarget({ id, name })}
          onAddClick={() => setEqModalOpen(true)}
        />
      </div>

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by patient or appointment ID..." className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              {STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={doctorFilter} onChange={(e) => { setDoctorFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>All</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
            <select value={patientFilter} onChange={(e) => { setPatientFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>All</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
            </select>
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
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
                      onClick={() => navigate(`/patients?patientId=${encodeURIComponent(appointment.patientId || appointment.patient || '')}`)}
                      className="text-left font-medium text-primary hover:underline"
                    >
                      {resolvePatientLabel(appointment)}
                    </button>
                    <p className="id-tag">{appointment.patientId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/doctors/${encodeURIComponent(appointment.doctorId || appointment.doctor || '')}`)}
                      className="text-left font-medium text-primary hover:underline"
                    >
                      {resolveDoctorLabel(appointment)}
                    </button>
                    <p className="id-tag">{appointment.doctorId || appointment.doctor}</p>
                  </td>
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
              ['Appointment ID', detailsItem.id],
              ['Patient', (
                <button
                  type="button"
                  onClick={() => navigate(`/patients?patientId=${encodeURIComponent(detailsItem.patientId || detailsItem.patient || '')}`)}
                  className="font-medium text-primary hover:underline"
                >
                  {resolvePatientLabel(detailsItem)}
                </button>
              )],
              ['Doctor', (
                <button
                  type="button"
                  onClick={() => navigate(`/doctors/${encodeURIComponent(detailsItem.doctorId || detailsItem.doctor || '')}`)}
                  className="font-medium text-primary hover:underline"
                >
                  {resolveDoctorLabel(detailsItem)}
                </button>
              )],
              ['Department', detailsItem.department],
              ['Date', detailsItem.date],
              ['Time', detailsItem.time],
              ['Priority', detailsItem.priority],
              ['Status', detailsItem.status],
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
        <AppointmentForm patients={patients} doctors={doctors} defaultValues={bookDefaults || undefined} onSubmit={handleBook} onCancel={() => { setBookOpen(false); setBookDefaults(null) }} />
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

      <Modal open={eqModalOpen} onClose={() => setEqModalOpen(false)} title="Add to Emergency Queue">
        <AddToQueueForm patients={patients} onSubmit={handleAddToEmergencyQueue} onCancel={() => setEqModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteEqTarget} onClose={() => setDeleteEqTarget(null)} onConfirm={handleRemoveFromEmergencyQueue}
        title="Remove from Emergency Queue?" description={`Remove ${deleteEqTarget?.name} from the emergency priority queue.`}
        confirmLabel="Remove Patient" danger
      />
    </div>
  )
}
