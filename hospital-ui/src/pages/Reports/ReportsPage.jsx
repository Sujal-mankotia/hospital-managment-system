import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiEye, FiTrash2, FiUpload } from 'react-icons/fi'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import DataTable from '../../components/tables/DataTable'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { apiRequest } from '../../api/hospitalApi'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'

const reportTypes = ['', 'Blood', 'Urine', 'X-Ray', 'CT Scan', 'MRI', 'Other']

export default function ReportsPage() {
  const { user } = useAuth()
  const { pushToast } = useUI()
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [reportType, setReportType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [uploadFor, setUploadFor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [uploadForm, setUploadForm] = useState({ testName: 'Complete Blood Count (CBC)', result: '', remarks: '', fileUrl: '', fileName: '' })
  const isAdmin = user?.role?.trim().toLowerCase() === 'admin'

  const loadReports = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (reportType) params.set('reportType', reportType)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    apiRequest(`/reports?${params.toString()}`)
      .then((data) => setReports(data.reports || []))
      .catch((err) => pushToast({ type: 'error', title: 'Failed to load reports', description: err.message }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReports()
  }, [])

  const flatLabReports = useMemo(() => reports.flatMap((row) => row.labReports.map((report) => ({ ...report, patientInfo: row.patient }))), [reports])

  const submitUpload = (event) => {
    event.preventDefault()
    if (!uploadFor) return
    apiRequest('/lab-reports', {
      method: 'POST',
      body: JSON.stringify({
        ...uploadForm,
        patientId: uploadFor.patient.id,
        patient: uploadFor.patient._id,
        status: 'completed',
      }),
    })
      .then(() => {
        pushToast({ type: 'success', title: 'Report uploaded', description: 'The patient report was saved.' })
        setUploadFor(null)
        setUploadForm({ testName: 'Complete Blood Count (CBC)', result: '', remarks: '', fileUrl: '', fileName: '' })
        loadReports()
      })
      .catch((err) => pushToast({ type: 'error', title: 'Upload failed', description: err.message }))
  }

  const deleteReport = () => {
    if (!deleteTarget) return
    setDeleting(true)
    apiRequest(`/reports/${deleteTarget._id}`, { method: 'DELETE' })
      .then(() => {
        pushToast({ type: 'success', title: 'Report deleted', description: 'The lab report was removed.' })
        setDeleteTarget(null)
        loadReports()
      })
      .catch((err) => pushToast({ type: 'error', title: 'Delete failed', description: err.message }))
      .finally(() => setDeleting(false))
  }

  const renderReportActions = (report, compact = false) => (
    <div className="flex flex-wrap items-center gap-2">
      {report.fileUrl ? (
        <Button type="button" size="sm" variant="ghost" icon={FiDownload} onClick={() => window.open(report.fileUrl, '_blank')}>
          Download
        </Button>
      ) : (
        <span className="self-center text-xs text-slate-light">No file</span>
      )}
      {isAdmin && (
        <Button type="button" size="sm" variant="danger" icon={FiTrash2} onClick={() => setDeleteTarget(report)} disabled={deleting}>
          {compact ? '' : 'Delete'}
        </Button>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader title="Reports" breadcrumb={[{ label: 'Reports' }]} description="Patient reports, appointment history, and lab reports from MongoDB Atlas." />

      <div className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,160px,150px,150px,auto]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search patient by name, ID, or phone..." />
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink">
            {reportTypes.map((type) => <option key={type || 'all'} value={type}>{type || 'All Types'}</option>)}
          </select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button type="button" onClick={loadReports}>Filter</Button>
        </div>
      </div>

      {loading ? (
        <div className="card p-6 text-sm text-slate-light">Loading patient reports...</div>
      ) : reports.length === 0 ? (
        <EmptyState title="No patient reports found" description="Try another search or upload a new report for a patient." />
      ) : (
        <div className="space-y-4">
          {reports.map((row) => (
            <div key={row.patient._id} className="card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{row.patient.name}</h3>
                  <p className="text-sm text-slate">{row.patient.id} | {row.patient.phone || 'No phone'}</p>
                  <p className="mt-1 text-xs text-slate-light">{row.patient.age || '-'} years | {row.patient.gender || '-'}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" icon={FiEye} onClick={() => setSelected(row)}>View Report</Button>
                  <Button type="button" icon={FiUpload} onClick={() => setUploadFor(row)}>Upload New Report</Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Diagnosis</p>
                  <p className="mt-2 text-sm text-ink">{row.medicalInformation.diagnosis || 'No diagnosis recorded'}</p>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Appointments</p>
                  <p className="mt-2 text-sm text-ink">{row.appointmentHistory.length} visits</p>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-light">Lab Reports</p>
                  <p className="mt-2 text-sm text-ink">{row.labReports.length} reports</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-6 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Lab Reports</h3>
        <DataTable columns={[{ key: 'patient', label: 'Patient' }, { key: 'type', label: 'Report Type' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status' }, { key: 'actions', label: 'Actions' }]}>
          {flatLabReports.map((report) => (
            <tr key={report._id} className="hover:bg-slate-50">
              <td className="px-4 py-3"><p className="font-medium text-ink">{report.patientInfo.name}</p><p className="id-tag">{report.patientId}</p></td>
              <td className="px-4 py-3 text-slate">{report.testName}</td>
              <td className="px-4 py-3 text-slate">{new Date(report.reportDate || report.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><Badge>{report.status}</Badge></td>
              <td className="px-4 py-3">
                {renderReportActions(report)}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Patient Report" size="xl">
        {selected && (
          <div className="space-y-5">
            <section className="rounded-xl bg-slate-50 p-4 text-sm">
              <h3 className="mb-2 font-semibold text-ink">Patient Information</h3>
              <p>{selected.patient.name} | {selected.patient.id} | {selected.patient.phone || 'No phone'}</p>
              <p>{selected.patient.age || '-'} years | {selected.patient.gender || '-'}</p>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Medical Information</h3>
              <p className="text-sm text-slate">Diagnosis: {selected.medicalInformation.diagnosis || 'Not recorded'}</p>
              <div className="mt-3 space-y-2">
                {selected.medicalInformation.visitHistory.length === 0 ? <p className="text-sm text-slate-light">No visit history recorded.</p> : selected.medicalInformation.visitHistory.map((item, index) => (
                  <div key={index} className="rounded-lg border border-line p-3 text-sm"><p className="font-medium text-ink">{item.title}</p><p className="text-slate">{item.detail}</p></div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Appointment History</h3>
              {selected.appointmentHistory.length === 0 ? <p className="text-sm text-slate-light">No appointments found.</p> : selected.appointmentHistory.map((appointment) => (
                <div key={appointment._id} className="mb-2 rounded-lg border border-line p-3 text-sm">{appointment.date} {appointment.time} | {appointment.doctor} | {appointment.status}</div>
              ))}
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">Lab Reports</h3>
              {selected.labReports.length === 0 ? <p className="text-sm text-slate-light">No lab reports found.</p> : selected.labReports.map((report) => (
                <div key={report._id} className="mb-2 flex flex-col justify-between gap-3 rounded-lg border border-line p-3 text-sm sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-ink">{report.testName}</p>
                    <p className="text-xs text-slate-light">{new Date(report.reportDate || report.createdAt).toLocaleDateString()} | Stored in MongoDB</p>
                    {report.fileName && <p className="text-xs text-slate">{report.fileName}</p>}
                  </div>
                  {renderReportActions({ ...report, patientInfo: selected.patient })}
                </div>
              ))}
            </section>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(uploadFor)} onClose={() => setUploadFor(null)} title="Upload New Report">
        <form onSubmit={submitUpload} className="space-y-4">
          <Input label="Report Type" value={uploadForm.testName} onChange={(e) => setUploadForm((prev) => ({ ...prev, testName: e.target.value }))} />
          <Input label="Result" value={uploadForm.result} onChange={(e) => setUploadForm((prev) => ({ ...prev, result: e.target.value }))} />
          <Input label="Doctor Notes / Remarks" value={uploadForm.remarks} onChange={(e) => setUploadForm((prev) => ({ ...prev, remarks: e.target.value }))} />
          <Input label="Report Image/PDF URL (stored in MongoDB)" value={uploadForm.fileUrl} onChange={(e) => setUploadForm((prev) => ({ ...prev, fileUrl: e.target.value }))} />
          <Input label="Image/PDF File Name" value={uploadForm.fileName} onChange={(e) => setUploadForm((prev) => ({ ...prev, fileName: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setUploadFor(null)}>Cancel</Button>
            <Button type="submit">Save Report</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteReport}
        title="Delete Report"
        description={`Delete ${deleteTarget?.testName || 'this report'} for ${deleteTarget?.patientInfo?.name || 'this patient'}? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
      />
    </div>
  )
}
