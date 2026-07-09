import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiEdit2, FiEye, FiFilter, FiPlus, FiTrash2 } from 'react-icons/fi'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import DataTable from '../../components/tables/DataTable'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import Input from '../../components/common/Input'
import { useUI } from '../../context/UIContext'

const PAGE_SIZE = 6
const STATUSES = ['All', 'pending', 'completed']
const REPORT_TYPES = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'HbA1c',
  'Blood Sugar (Fasting)',
  'Blood Sugar (PP)',
  'Vitamin D',
  'Vitamin B12',
  'Thyroid Profile (TSH, T3, T4)',
  'Urine Routine',
  'Urine Culture',
  'Electrolytes',
  'Calcium',
  'Iron Profile',
  'Ferritin',
  'ESR',
  'CRP',
  'Dengue NS1',
  'Malaria Test',
  'COVID-19 RT-PCR',
  'HIV Screening',
  'HBsAg',
  'HCV',
  'Pregnancy Test',
  'Chest X-Ray',
  'ECG',
]
const EMPTY_FORM = { patientId: '', testName: '', status: 'pending', result: '', remarks: '' }
const HOSPITAL_API = (import.meta.env.VITE_HOSPITAL_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '').replace(/\/api$/, '')
const PATIENT_API = (import.meta.env.VITE_PATIENT_API_URL || HOSPITAL_API).replace(/\/$/, '').replace(/\/api$/, '')

const getAuthHeaders = (includeJson = false) => {
  const token = localStorage.getItem('hospital_token')
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const requestJson = (url, options) => fetch(url, options).then((r) => (r.ok ? r.json() : r.json().then((err) => Promise.reject(err))))

export default function LabPage() {
  const { pushToast } = useUI()
  const [reports, setReports] = useState([])
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editReport, setEditReport] = useState(null)
  const [viewReport, setViewReport] = useState(null)
  const [resultDrafts, setResultDrafts] = useState({})
  const [form, setForm] = useState(EMPTY_FORM)

  const patientNameMap = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id || patient._id, patient.name])),
    [patients]
  )
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))
  const paged = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadData = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status !== 'All') params.set('status', status)

    Promise.all([
      requestJson(`${PATIENT_API}/api/patients?limit=1000`, { headers: getAuthHeaders() }),
      requestJson(`${HOSPITAL_API}/api/labreports?${params.toString()}`, { headers: getAuthHeaders() }),
    ])
      .then(([patientData, reportData]) => {
        setPatients(patientData.items || [])
        setReports(reportData.labReports || [])
        setPage(1)
      })
      .catch((err) => pushToast({ type: 'error', title: 'Failed to load lab reports', description: err.message || String(err) }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [search, status])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => setForm(EMPTY_FORM)

  const handleCreateReport = (event) => {
    event.preventDefault()
    setSaving(true)

    requestJson(`${HOSPITAL_API}/api/labreports`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(form),
    })
      .then((data) => {
        setReports((prev) => [data.labReport, ...prev])
        setAddOpen(false)
        resetForm()
        pushToast({ type: 'success', title: 'Lab report created', description: 'The report has been added.' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Create report failed', description: err.message || String(err) }))
      .finally(() => setSaving(false))
  }

  const openEdit = (report) => {
    setForm({
      patientId: report.patientId,
      testName: report.testName,
      status: report.status,
      result: report.result || '',
      remarks: report.remarks || '',
    })
    setEditReport(report)
  }

  const handleEditReport = (event) => {
    event.preventDefault()
    setSaving(true)

    requestJson(`${HOSPITAL_API}/api/labreports/${editReport._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(form),
    })
      .then((data) => {
        setReports((prev) => prev.map((item) => (item._id === data.labReport._id ? data.labReport : item)))
        setEditReport(null)
        resetForm()
        pushToast({ type: 'success', title: 'Lab report updated', description: 'Changes were saved.' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Update report failed', description: err.message || String(err) }))
      .finally(() => setSaving(false))
  }

  const handleDeleteReport = (report) => {
    if (!window.confirm(`Delete ${report.testName} for ${patientNameMap[report.patientId] || report.patientId}?`)) return

    requestJson(`${HOSPITAL_API}/api/labreports/${report._id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
      .then(() => {
        setReports((prev) => prev.filter((item) => item._id !== report._id))
        pushToast({ type: 'success', title: 'Lab report deleted', description: 'The report was removed.' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Delete report failed', description: err.message || String(err) }))
  }

  const handleCompleteReport = (report) => {
    const result = resultDrafts[report._id] ?? report.result ?? ''
    if (!result.trim()) {
      pushToast({ type: 'error', title: 'Result required', description: 'Enter a result before completing this report.' })
      return
    }

    requestJson(`${HOSPITAL_API}/api/labreports/${report._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status: 'completed', result }),
    })
      .then((data) => {
        setReports((prev) => prev.map((item) => (item._id === report._id ? data.labReport : item)))
        pushToast({ type: 'success', title: 'Report completed', description: 'Result and completion time were saved.' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Update report failed', description: err.message || String(err) }))
  }

  const reportForm = (onSubmit, submitLabel) => (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Patient</span>
        <select name="patientId" value={form.patientId} onChange={handleFieldChange} disabled={Boolean(editReport)} required className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink disabled:bg-slate-100">
          <option value="">Select patient</option>
          {patients.map((patient) => (
            <option key={patient.id || patient._id} value={patient.id || patient._id}>{patient.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Report Type</span>
        <select name="testName" value={form.testName} onChange={handleFieldChange} required className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink">
          <option value="">Select report type</option>
          {REPORT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <Input label="Result" name="result" value={form.result} onChange={handleFieldChange} placeholder="Enter test result" />
      <Input label="Remarks" name="remarks" value={form.remarks} onChange={handleFieldChange} placeholder="Optional notes" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
        <select name="status" value={form.status} onChange={handleFieldChange} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink">
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => { setAddOpen(false); setEditReport(null); resetForm() }}>Cancel</Button>
        <Button type="submit" disabled={saving}>{submitLabel}</Button>
      </div>
    </form>
  )

  return (
    <div>
      <PageHeader title="Lab Reports" breadcrumb={[{ label: 'Lab' }]} description="Create reports, track lab work, and complete patient test results." actions={<Button icon={FiPlus} onClick={() => { resetForm(); setAddOpen(true) }}>Create Report</Button>} />

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by patient or report type..." className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-light"><FiFilter size={14} /></div>
            {STATUSES.map((value) => (
              <button key={value} onClick={() => setStatus(value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${status === value ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'}`}>
                {value === 'All' ? value : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-sm text-slate-light">Loading lab reports...</div>
        ) : paged.length === 0 ? (
          <EmptyState title="No lab reports found" description="Try adjusting your search or create a new report." />
        ) : (
          <>
            <DataTable columns={[{ key: 'patient', label: 'Patient' }, { key: 'test', label: 'Report Type' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' }, { key: 'actions', label: 'Actions' }]}>
              {paged.map((report) => (
                <tr key={report._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="font-medium text-ink">{patientNameMap[report.patientId] || 'Unknown patient'}</p><p className="id-tag">{report.patientId}</p></td>
                  <td className="px-4 py-3 text-slate">{report.testName}</td>
                  <td className="px-4 py-3"><Badge tone={report.status === 'completed' ? 'success' : 'warning'}>{report.status}</Badge></td>
                  <td className="px-4 py-3 text-slate">{new Date(report.reportDate || report.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                      <input value={resultDrafts[report._id] ?? report.result ?? ''} onChange={(event) => setResultDrafts((prev) => ({ ...prev, [report._id]: event.target.value }))} placeholder="Enter result" disabled={report.status === 'completed'} className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink disabled:bg-slate-100 xl:max-w-[170px]" />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" icon={FiCheckCircle} onClick={() => handleCompleteReport(report)} disabled={report.status === 'completed'}>{report.status === 'completed' ? 'Completed' : 'Complete'}</Button>
                        <Button type="button" size="sm" variant="outline" icon={FiEye} onClick={() => setViewReport(report)}>View</Button>
                        <Button type="button" size="sm" variant="outline" icon={FiEdit2} onClick={() => openEdit(report)}>Edit</Button>
                        <Button type="button" size="sm" variant="danger" icon={FiTrash2} onClick={() => handleDeleteReport(report)}>Delete</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={reports.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title="Create Lab Report" size="lg">
        {reportForm(handleCreateReport, 'Create Report')}
      </Modal>

      <Modal open={Boolean(editReport)} onClose={() => { setEditReport(null); resetForm() }} title="Edit Lab Report" size="lg">
        {reportForm(handleEditReport, 'Save Changes')}
      </Modal>

      <Modal open={Boolean(viewReport)} onClose={() => setViewReport(null)} title="View Lab Report" size="lg">
        {viewReport && (
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-slate-light">Patient</p><p className="font-medium text-ink">{patientNameMap[viewReport.patientId] || viewReport.patientId}</p></div>
            <div><p className="text-slate-light">Report Type</p><p className="font-medium text-ink">{viewReport.testName}</p></div>
            <div><p className="text-slate-light">Status</p><Badge tone={viewReport.status === 'completed' ? 'success' : 'warning'}>{viewReport.status}</Badge></div>
            <div><p className="text-slate-light">Report Date</p><p className="font-medium text-ink">{new Date(viewReport.reportDate || viewReport.createdAt).toLocaleString()}</p></div>
            <div><p className="text-slate-light">Completed At</p><p className="font-medium text-ink">{viewReport.completedAt ? new Date(viewReport.completedAt).toLocaleString() : 'Not completed'}</p></div>
            <div><p className="text-slate-light">Result</p><p className="font-medium text-ink">{viewReport.result || 'No result entered'}</p></div>
            <div className="sm:col-span-2"><p className="text-slate-light">Remarks</p><p className="font-medium text-ink">{viewReport.remarks || 'No remarks'}</p></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
