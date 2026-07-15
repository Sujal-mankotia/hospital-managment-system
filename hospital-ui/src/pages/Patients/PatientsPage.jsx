import { useMemo, useState, useEffect } from 'react'
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiDownload, FiFilter } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import DataTable from '../../components/tables/DataTable'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import MedicalTimeline from '../../components/tables/MedicalTimeline'
import PatientForm from '../../components/forms/PatientForm'
import { listDoctors } from '../../api/doctorsApi'
import { useUI } from '../../context/UIContext'
import { medicalHistory } from '../../data/patients'

const PAGE_SIZE = 6
const STATUSES = ['All', 'Admitted', 'Critical', 'Stable', 'Discharged']
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function authHeaders(includeContentType = true) {
  const token = localStorage.getItem('hospital_token')
  return {
    ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function PatientsPage() {
  const { pushToast } = useUI()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(1)

  const [viewPatient, setViewPatient] = useState(null)
  const [editPatient, setEditPatient] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    let list = patients.filter((patient) =>
      (status === 'All' || patient.status === status) &&
      (patient.name.toLowerCase().includes(search.toLowerCase()) || patient.id.toLowerCase().includes(search.toLowerCase()))
    )
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'age') return a.age - b.age
      if (sortBy === 'id') return a.id.localeCompare(b.id)
      return 0
    })
    return list
  }, [patients, search, status, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadDoctors = () => {
    listDoctors()
      .then((items) => setDoctors(items))
      .catch((error) => pushToast({ type: 'error', title: 'Failed to load doctors', description: error.message }))
  }

  const handleAdd = (data) => {
    fetch(`${API}/patients`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        ...data,
        photo: data.photo || '',
      }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((createdResponse) => {
        const created = createdResponse.patient || createdResponse
        setPatients((items) => [created, ...items])
        setAddOpen(false)
        pushToast({ type: 'success', title: 'Patient added', description: `${created.name} was added to records.` })
      })
      .catch((error) => pushToast({ type: 'error', title: 'Add failed', description: error.message || error.message || String(error) }))
  }

  const handleEdit = (data) => {
    fetch(`${API}/patients/${editPatient.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        ...data,
        photo: data.photo || '',
      }),
    })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((updatedResponse) => {
        const updated = updatedResponse.patient || updatedResponse
        setPatients((items) => items.map((patient) => (patient.id === updated.id ? updated : patient)))
        setEditPatient(null)
        pushToast({ type: 'success', title: 'Patient updated' })
      })
      .catch((error) => pushToast({ type: 'error', title: 'Update failed', description: error.message || String(error) }))
  }

  const handleDelete = () => {
    fetch(`${API}/patients/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then(() => {
        setPatients((items) => items.filter((patient) => patient.id !== deleteTarget.id))
        pushToast({ type: 'info', title: 'Patient removed', description: `${deleteTarget.name}'s record was deleted.` })
        setDeleteTarget(null)
      })
      .catch((error) => pushToast({ type: 'error', title: 'Delete failed', description: error.message || String(error) }))
  }

  useEffect(() => {
    fetch(`${API}/patients?limit=1000`, { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
      .then((data) => setPatients(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load patients' }))
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (!patientId || patients.length === 0) return

    const linkedPatient = patients.find((patient) => patient.id === patientId)
    if (!linkedPatient) {
      pushToast({ type: 'error', title: 'Patient not found', description: `No patient record found for ${patientId}.` })
      setSearchParams({})
      return
    }

    setSearch(patientId)
    setViewPatient(linkedPatient)
  }, [patients, searchParams, setSearchParams])

  return (
    <div>
      <PageHeader
        title="Patient Management"
        breadcrumb={[{ label: 'Patients' }]}
        description="View, admit, and manage patient records across all departments."
        actions={<Button icon={FiPlus} onClick={() => setAddOpen(true)}>Add Patient</Button>}
      />

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by name or patient ID..." className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-light"><FiFilter size={14} /></div>
            {STATUSES.map((item) => (
              <button
                key={item}
                onClick={() => { setStatus(item); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === item ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              <option value="name">Sort: Name</option>
              <option value="age">Sort: Age</option>
              <option value="id">Sort: Patient ID</option>
            </select>
            <Button variant="outline" size="sm" icon={FiDownload} onClick={() => pushToast({ type: 'info', title: 'Export started', description: 'Patient list export (demo).' })}>
              Export
            </Button>
          </div>
        </div>

        {paged.length === 0 ? (
          <EmptyState title="No patients found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'id', label: 'Patient ID' }, { key: 'name', label: 'Name' }, { key: 'age', label: 'Age' },
              { key: 'gender', label: 'Gender' }, { key: 'bloodGroup', label: 'Blood Grp' }, { key: 'phone', label: 'Phone' },
              { key: 'disease', label: 'Disease' }, { key: 'doctor', label: 'Doctor' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
            ]}>
              {paged.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 id-tag">{patient.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={patient.photo} name={patient.name} size="sm" />
                      <span className="font-medium text-ink">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate">{patient.age}</td>
                  <td className="px-4 py-3 text-slate">{patient.gender}</td>
                  <td className="px-4 py-3 text-slate">{patient.bloodGroup}</td>
                  <td className="px-4 py-3 text-slate">{patient.phone}</td>
                  <td className="px-4 py-3 text-slate">{patient.disease}</td>
                  <td className="px-4 py-3 text-slate">{patient.doctor}</td>
                  <td className="px-4 py-3"><Badge>{patient.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewPatient(patient)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="View"><FiEye size={15} /></button>
                      <button onClick={() => setEditPatient(patient)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="Edit"><FiEdit2 size={15} /></button>
                      <button onClick={() => setDeleteTarget(patient)} className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose" title="Delete"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      <Modal open={!!viewPatient} onClose={() => { setViewPatient(null); setSearchParams({}) }} title="Patient Details" size="lg">
        {viewPatient && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Avatar src={viewPatient.photo} name={viewPatient.name} size="xl" />
              <div>
                <h3 className="text-lg font-semibold text-ink">{viewPatient.name}</h3>
                <p className="id-tag">{viewPatient.id}</p>
                <div className="mt-1"><Badge>{viewPatient.status}</Badge></div>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ['Age', viewPatient.age], ['Gender', viewPatient.gender], ['Blood Group', viewPatient.bloodGroup],
                ['Phone', viewPatient.phone], ['Ward', viewPatient.ward], ['Doctor', viewPatient.doctor],
                ['Admitted On', viewPatient.admitted],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-light">{label}</p>
                  <p className="text-sm font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
            <h4 className="mb-3 text-sm font-semibold text-ink">Medical History</h4>
            <MedicalTimeline items={medicalHistory[viewPatient.id] || medicalHistory['PT-20481']} />
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/appointments?patientId=${encodeURIComponent(viewPatient.id)}&book=1`)}
              >
                View Appointments
              </Button>
              <Button
                onClick={() => navigate(`/appointments?patientId=${encodeURIComponent(viewPatient.id)}&book=1`)}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Patient" size="lg">
        <PatientForm doctors={doctors} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Patient" />
      </Modal>

      <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient" size="lg">
        {editPatient && <PatientForm defaultValues={editPatient} doctors={doctors} onSubmit={handleEdit} onCancel={() => setEditPatient(null)} submitLabel="Save Changes" />}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete patient record?"
        description={`This will permanently remove ${deleteTarget?.name}'s record from the system. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
