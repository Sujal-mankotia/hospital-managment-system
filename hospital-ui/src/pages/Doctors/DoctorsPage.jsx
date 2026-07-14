import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiGrid, FiList, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
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
import DoctorCard from '../../components/cards/DoctorCard'
import DoctorForm from '../../components/forms/DoctorForm'
import { departments as fallbackDepartments } from '../../data/doctors'
import { createDoctor, listDoctors, removeDoctor, updateDoctor } from '../../api/doctorsApi'
import { useUI } from '../../context/UIContext'

const PAGE_SIZE = 8

export default function DoctorsPage() {
  const { pushToast } = useUI()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [editDoctor, setEditDoctor] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = new Set([
      ...fallbackDepartments,
      ...doctors.map((doctor) => doctor.department).filter(Boolean),
    ])
    return Array.from(uniqueDepartments)
  }, [doctors])

  const filtered = useMemo(() => doctors.filter((doctor) =>
    (dept === 'All' || doctor.department === dept) &&
    (availability === 'All' || doctor.availability === availability) &&
    (doctor.name.toLowerCase().includes(search.toLowerCase()) || doctor.id.toLowerCase().includes(search.toLowerCase()))
  ), [doctors, search, dept, availability])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const items = await listDoctors()
      setDoctors(items)
    } catch (error) {
      setDoctors([])
      pushToast({ type: 'error', title: 'Failed to load doctors', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data) => {
    try {
      const newDoctor = await createDoctor(data)
      setAddOpen(false)
      await loadDoctors()
      pushToast({ type: 'success', title: 'Doctor added', description: `${newDoctor.name} joined the roster.` })
    } catch (error) {
      pushToast({ type: 'error', title: 'Add failed', description: error.message })
    }
  }

  const handleEdit = async (data) => {
    try {
      await updateDoctor(editDoctor.id, data)
      setEditDoctor(null)
      await loadDoctors()
      pushToast({ type: 'success', title: 'Doctor profile updated' })
    } catch (error) {
      pushToast({ type: 'error', title: 'Update failed', description: error.message })
    }
  }

  const handleDelete = async () => {
    try {
      await removeDoctor(deleteTarget.id)
      setDeleteTarget(null)
      await loadDoctors()
      pushToast({ type: 'info', title: 'Doctor removed', description: `${deleteTarget.name}'s profile was deleted.` })
    } catch (error) {
      pushToast({ type: 'error', title: 'Delete failed', description: error.message })
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  return (
    <div>
      <PageHeader
        title="Doctor Management"
        breadcrumb={[{ label: 'Doctors' }]}
        description="Manage specialists, schedules, and department assignments."
        actions={<Button icon={FiPlus} onClick={() => setAddOpen(true)}>Add Doctor</Button>}
      />

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by name or doctor ID..." className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              <option>All</option>
              {departmentOptions.map((department) => <option key={department}>{department}</option>)}
            </select>
            <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              <option>All</option>
              <option>Available</option>
              <option>In Surgery</option>
              <option>On Leave</option>
            </select>
            <div className="flex overflow-hidden rounded-full border border-line">
              <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary text-white' : 'text-slate'}`}><FiGrid size={14} /></button>
              <button onClick={() => setView('table')} className={`p-2 ${view === 'table' ? 'bg-primary text-white' : 'text-slate'}`}><FiList size={14} /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <EmptyState title="Loading doctors" description="Fetching the roster from MongoDB..." />
        ) : paged.length === 0 ? (
          <EmptyState title="No doctors found" description="Try adjusting your search or filters." />
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paged.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onView={() => navigate(`/doctors/${doctor.id}`)} onEdit={() => setEditDoctor(doctor)} onDelete={() => setDeleteTarget(doctor)} />
            ))}
          </div>
        ) : (
          <DataTable columns={[
            { key: 'id', label: 'Doctor ID' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Department' },
            { key: 'qualification', label: 'Qualification' }, { key: 'experience', label: 'Experience' },
            { key: 'availability', label: 'Availability' }, { key: 'patients', label: 'Patients' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' },
          ]}>
            {paged.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 id-tag">{doctor.id}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar src={doctor.photo} name={doctor.name} size="sm" /><span className="font-medium text-ink">{doctor.name}</span></div></td>
                <td className="px-4 py-3 text-slate">{doctor.department}</td>
                <td className="px-4 py-3 text-slate">{doctor.qualification}</td>
                <td className="px-4 py-3 text-slate">{doctor.experience}</td>
                <td className="px-4 py-3"><Badge>{doctor.availability}</Badge></td>
                <td className="px-4 py-3 text-slate">{doctor.patients}</td>
                <td className="px-4 py-3"><Badge>{doctor.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(`/doctors/${doctor.id}`)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary"><FiEye size={15} /></button>
                    <button onClick={() => setEditDoctor(doctor)} className="rounded-lg p-1.5 text-slate hover:bg-primary-light hover:text-primary"><FiEdit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(doctor)} className="rounded-lg p-1.5 text-slate hover:bg-rose-light hover:text-rose"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
        {paged.length > 0 && !loading && <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Doctor" size="lg">
        <DoctorForm departments={departmentOptions} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Doctor" />
      </Modal>
      <Modal open={!!editDoctor} onClose={() => setEditDoctor(null)} title="Edit Doctor" size="lg">
        {editDoctor && <DoctorForm defaultValues={editDoctor} departments={departmentOptions} onSubmit={handleEdit} onCancel={() => setEditDoctor(null)} submitLabel="Save Changes" />}
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove doctor from roster?" description={`${deleteTarget?.name} will be removed from active staff records.`}
        confirmLabel="Remove" danger
      />
    </div>
  )
}
