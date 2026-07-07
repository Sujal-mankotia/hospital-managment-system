import { useMemo, useState, useEffect } from 'react'
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiDownload, FiFilter } from 'react-icons/fi'
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
import { useUI } from '../../context/UIContext'
import { medicalHistory } from '../../data/patients'

const PAGE_SIZE = 6
const STATUSES = ['All', 'Admitted', 'Critical', 'Stable', 'Discharged']

export default function PatientsPage() {
  const { pushToast } = useUI()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(1)

  const [viewPatient, setViewPatient] = useState(null)
  const [editPatient, setEditPatient] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    let list = patients.filter((p) =>
      (status === 'All' || p.status === status) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
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

  const handleAdd = (data) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const fd = new FormData()
    fd.append('name', data.name || '')
    fd.append('age', data.age || '')
    fd.append('gender', data.gender || '')
    fd.append('bloodGroup', data.bloodGroup || '')
    fd.append('phone', data.phone || '')
    fd.append('disease', data.disease || '')
    fd.append('doctor', data.doctor || '')
    if (data.photoFile && data.photoFile.length > 0) fd.append('photo', data.photoFile[0])

    fetch(`${API}/api/patients`, { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((created) => {
        setPatients((p) => [created, ...p])
        setAddOpen(false)
        pushToast({ type: 'success', title: 'Patient added', description: `${created.name} was added to records.` })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Add failed', description: String(err) }))
  }

  const handleEdit = (data) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const fd = new FormData()
    fd.append('name', data.name || '')
    fd.append('age', data.age || '')
    fd.append('gender', data.gender || '')
    fd.append('bloodGroup', data.bloodGroup || '')
    fd.append('phone', data.phone || '')
    fd.append('disease', data.disease || '')
    fd.append('doctor', data.doctor || '')
    if (data.photoFile && data.photoFile.length > 0) fd.append('photo', data.photoFile[0])

    fetch(`${API}/api/patients/${editPatient.id}`, { method: 'PUT', body: fd })
      .then((r) => r.json())
      .then((updated) => {
        setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditPatient(null)
        pushToast({ type: 'success', title: 'Patient updated' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Update failed', description: String(err) }))
  }

  const handleDelete = () => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    fetch(`${API}/api/patients/${deleteTarget.id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then(() => {
        setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id))
        pushToast({ type: 'info', title: 'Patient removed', description: `${deleteTarget.name}'s record was deleted.` })
        setDeleteTarget(null)
      })
      .catch((err) => pushToast({ type: 'error', title: 'Delete failed', description: String(err) }))
  }

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    fetch(`${API}/api/patients?limit=1000`)
      .then((r) => r.json())
      .then((data) => setPatients(data.items || []))
      .catch(() => pushToast({ type: 'error', title: 'Failed to load patients' }))
  }, [])

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
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by name or patient ID…" className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-light"><FiFilter size={14} /></div>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'
                }`}
              >
                {s}
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
              {paged.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 id-tag">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={p.photo} name={p.name} size="sm" />
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate">{p.age}</td>
                  <td className="px-4 py-3 text-slate">{p.gender}</td>
                  <td className="px-4 py-3 text-slate">{p.bloodGroup}</td>
                  <td className="px-4 py-3 text-slate">{p.phone}</td>
                  <td className="px-4 py-3 text-slate">{p.disease}</td>
                  <td className="px-4 py-3 text-slate">{p.doctor}</td>
                  <td className="px-4 py-3"><Badge>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewPatient(p)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="View"><FiEye size={15} /></button>
                      <button onClick={() => setEditPatient(p)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary" title="Edit"><FiEdit2 size={15} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose" title="Delete"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      {/* View modal */}
      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="lg">
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
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-slate-light">{label}</p>
                  <p className="text-sm font-medium text-ink">{val}</p>
                </div>
              ))}
            </div>
            <h4 className="mb-3 text-sm font-semibold text-ink">Medical History</h4>
            <MedicalTimeline items={medicalHistory[viewPatient.id] || medicalHistory['PT-20481']} />
          </div>
        )}
      </Modal>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Patient" size="lg">
        <PatientForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Patient" />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient" size="lg">
        {editPatient && <PatientForm defaultValues={editPatient} onSubmit={handleEdit} onCancel={() => setEditPatient(null)} submitLabel="Save Changes" />}
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
