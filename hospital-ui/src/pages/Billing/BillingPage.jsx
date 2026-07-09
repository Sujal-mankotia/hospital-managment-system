import { useEffect, useMemo, useState, useCallback } from 'react'
import { FiPlus, FiCheckCircle, FiFilter, FiEye, FiSearch, FiX } from 'react-icons/fi'
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

const PAGE_SIZE = 10
const STATUSES = ['All', 'pending', 'partial', 'paid', 'refunded', 'cancelled']
const HOSPITAL_API = (import.meta.env.VITE_HOSPITAL_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '').replace(/\/api$/, '')
const PATIENT_API = (import.meta.env.VITE_PATIENT_API_URL || HOSPITAL_API).replace(/\/$/, '').replace(/\/api$/, '')

const getAuthHeaders = (includeJson = false) => {
  const token = localStorage.getItem('hospital_token')
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const formatPatientLabel = (patient) => {
  if (!patient) return ''
  const name = patient.name || 'Unknown'
  const pid = patient.id || patient.patientId || ''
  const phone = patient.phone || ''
  return `${name} ${pid ? `| ${pid}` : ''} ${phone ? `| ${phone}` : ''}`
}

const statusTone = (status) => {
  switch (status) {
    case 'paid': return 'success'
    case 'refunded':
    case 'cancelled': return 'danger'
    case 'partial': return 'warning'
    default: return 'info'
  }
}

export default function BillingPage() {
  const { pushToast } = useUI()
  const [bills, setBills] = useState([])
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false)
  const [form, setForm] = useState({
    patientId: '',
    paymentMethod: 'cash',
    items: [{ description: '', amount: '' }],
    gstEnabled: false,
    gstRate: 18,
  })

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients
    const q = patientSearch.toLowerCase()
    return patients.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q)
    )
  }, [patients, patientSearch])

  const loadData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy,
      sortOrder,
      ...(search ? { search } : {}),
      ...(status !== 'All' ? { status } : {}),
    })
    Promise.all([
      fetch(`${PATIENT_API}/api/patients?limit=1000`).then((r) => r.json()),
      fetch(`${HOSPITAL_API}/api/bills?${params.toString()}`, {
        headers: getAuthHeaders(),
      }).then((r) => (r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))),
    ])
      .then(([patientData, billData]) => {
        setPatients(patientData.items || [])
        setBills(billData.bills || [])
        setTotalPages(billData.totalPages || 1)
        setTotalItems(billData.total || 0)
      })
      .catch((err) =>
        pushToast({ type: 'error', title: 'Failed to load billing data', description: err.message || String(err) })
      )
      .finally(() => setLoading(false))
  }, [page, search, status, sortBy, sortOrder, pushToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { description: '', amount: '' }] }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const resetForm = () => {
    setForm({
      patientId: '',
      paymentMethod: 'cash',
      items: [{ description: '', amount: '' }],
      gstEnabled: false,
      gstRate: 18,
    })
    setPatientSearch('')
  }

  const selectPatient = (patient) => {
    setForm((prev) => ({ ...prev, patientId: patient._id }))
    setPatientSearch(formatPatientLabel(patient))
    setPatientDropdownOpen(false)
  }

  const handleCreateBill = (event) => {
    event.preventDefault()
    const validItems = form.items.filter((item) => item.description.trim() && item.amount !== '')
    if (!form.patientId || validItems.length === 0) {
      pushToast({ type: 'error', title: 'Missing details', description: 'Choose a patient and add at least one line item.' })
      return
    }

    const payload = {
      patientId: form.patientId,
      paymentMethod: form.paymentMethod,
      items: validItems.map((item) => ({
        description: item.description.trim(),
        amount: Number(item.amount),
        quantity: 1,
        unitPrice: Number(item.amount),
      })),
      totalAmount: validItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      gstEnabled: form.gstEnabled,
      gstRate: form.gstEnabled ? Number(form.gstRate) || 18 : 0,
    }

    fetch(`${HOSPITAL_API}/api/bills`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((err) => Promise.reject(err))))
      .then((data) => {
        setBills((prev) => [data.bill, ...prev])
        setAddOpen(false)
        resetForm()
        setPage(1)
        pushToast({ type: 'success', title: 'Bill created', description: 'The bill has been added to records.' })
      })
      .catch((err) =>
        pushToast({ type: 'error', title: 'Create bill failed', description: err.message || String(err) })
      )
  }

  const handleMarkPaid = (bill) => {
    const remaining = (bill.totalAmount || 0) - (bill.amountPaid || 0)
    fetch(`${HOSPITAL_API}/api/bills/${bill._id}/pay`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ paymentMethod: bill.paymentMethod || 'cash', amount: remaining }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((err) => Promise.reject(err))))
      .then((data) => {
        setBills((prev) => prev.map((item) => (item._id === bill._id ? data.bill : item)))
        pushToast({ type: 'success', title: 'Bill paid', description: 'The bill status was updated.' })
      })
      .catch((err) =>
        pushToast({ type: 'error', title: 'Payment update failed', description: err.message || String(err) })
      )
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const openBillDetail = (bill) => {
    setSelectedBill(bill)
    setDetailOpen(true)
  }

  const renderPatientCell = (bill) => {
    const patient = bill.patient
    if (!patient || patient.name === 'Deleted Patient') {
      return (
        <div>
          <p className="font-medium text-ink">Deleted Patient</p>
          <p className="id-tag">{bill.patientId || 'Unknown'}</p>
        </div>
      )
    }
    return (
      <div>
        <p className="font-medium text-ink">{patient.name}</p>
        <p className="id-tag">{patient.id || ''} {patient.phone ? `· ${patient.phone}` : ''}</p>
      </div>
    )
  }

  const sortIndicator = (column) => {
    if (sortBy !== column) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div>
      <PageHeader
        title="Billing"
        breadcrumb={[{ label: 'Billing' }]}
        description="Create bills, review patient charges, and track payment status."
        actions={
          <Button icon={FiPlus} onClick={() => setAddOpen(true)}>
            Create Bill
          </Button>
        }
      />

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={(value) => { setSearch(value); setPage(1) }}
            placeholder="Search by patient, bill number, or phone…"
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-light">
              <FiFilter size={14} />
            </div>
            {STATUSES.map((value) => (
              <button
                key={value}
                onClick={() => { setStatus(value); setPage(1) }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === value ? 'bg-primary text-white' : 'bg-slate-100 text-slate hover:bg-slate-200'
                }`}
              >
                {value === 'All' ? value : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-sm text-slate-light">Loading bills…</div>
        ) : bills.length === 0 ? (
          <EmptyState title="No bills found" description="Try adjusting your search or create a new bill." />
        ) : (
          <>
            <DataTable
              columns={[
                { key: 'billNumber', label: 'Bill No.' },
                { key: 'patient', label: 'Patient' },
                { key: 'phone', label: 'Phone' },
                { key: 'amount', label: 'Amount' },
                { key: 'paid', label: 'Paid' },
                { key: 'balance', label: 'Balance' },
                { key: 'status', label: 'Status' },
                { key: 'date', label: 'Date' },
                { key: 'collected', label: 'Collected By' },
                { key: 'actions', label: 'Actions' },
              ]}
            >
              {bills.map((bill) => {
                const patient = bill.patient
                const paid = bill.amountPaid || 0
                const total = bill.totalAmount || 0
                const balance = Math.max(0, total - paid)
                const createdByName = bill.createdBy?.name || '—'
                return (
                  <tr key={bill._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-ink">{bill.billNumber || bill._id.slice(-6)}</span>
                    </td>
                    <td className="px-4 py-3">{renderPatientCell(bill)}</td>
                    <td className="px-4 py-3 text-slate">
                      {patient?.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate">₹{Number(total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate">₹{Number(paid).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {balance > 0 ? (
                        <span className="font-medium text-amber-600">₹{balance.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-light">₹0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(bill.status)}>{bill.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate">{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate">{createdByName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          icon={FiEye}
                          onClick={() => openBillDetail(bill)}
                          title="View Details"
                        />
                        {bill.status !== 'paid' && bill.status !== 'cancelled' && bill.status !== 'refunded' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            icon={FiCheckCircle}
                            onClick={() => handleMarkPaid(bill)}
                            title="Mark Paid"
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </DataTable>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>

      {/* Create Bill Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title="Create Bill" size="lg">
        <form className="space-y-4" onSubmit={handleCreateBill}>
          {/* Patient Selector with Search */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Patient</span>
            <div className="relative">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={16} />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setPatientDropdownOpen(true) }}
                  onFocus={() => setPatientDropdownOpen(true)}
                  placeholder="Search by name, UHID, or phone…"
                  className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-slate-light"
                />
                {patientSearch && (
                  <button
                    type="button"
                    onClick={() => { setPatientSearch(''); setForm((prev) => ({ ...prev, patientId: '' })) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-ink"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              {patientDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
                  {filteredPatients.length === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-slate-light">No patients found</div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient._id}
                        type="button"
                        onClick={() => selectPatient(patient)}
                        className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-light ${
                          form.patientId === patient._id ? 'bg-primary-light text-primary' : 'text-ink'
                        }`}
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-slate-light">
                          {patient.id || ''} {patient.phone ? `· ${patient.phone}` : ''}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </label>

          {/* Payment Method */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Payment Method</span>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleFieldChange}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="net_banking">Net Banking</option>
            </select>
          </label>

          {/* GST Toggle */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.gstEnabled}
              onChange={(e) => setForm((prev) => ({ ...prev, gstEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-line text-primary"
            />
            <span className="text-sm font-medium text-ink">Enable GST</span>
            {form.gstEnabled && (
              <input
                type="number"
                value={form.gstRate}
                onChange={(e) => setForm((prev) => ({ ...prev, gstRate: e.target.value }))}
                className="ml-2 w-20 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm text-ink"
                min="0"
                max="100"
              />
            )}
            {form.gstEnabled && <span className="text-xs text-slate-light">%</span>}
          </label>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Line Items</span>
              <Button type="button" size="sm" variant="outline" icon={FiPlus} onClick={addItem}>
                Add Item
              </Button>
            </div>

            {form.items.map((item, index) => (
              <div key={index} className="rounded-xl border border-line p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr,0.8fr,auto]">
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(event) => handleItemChange(index, 'description', event.target.value)}
                    placeholder="Consultation"
                  />
                  <Input
                    label="Amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(event) => handleItemChange(index, 'amount', event.target.value)}
                    placeholder="500"
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate">
            Subtotal: <span className="font-semibold text-ink">₹{form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)}</span>
            {form.gstEnabled && (
              <>
                <span className="ml-3">
                  + GST ({form.gstRate}%):{' '}
                  <span className="font-semibold text-ink">
                    ₹{((form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0) * Number(form.gstRate || 0)) / 100).toFixed(2)}
                  </span>
                </span>
                <span className="ml-3">
                  Total: <span className="font-semibold text-primary">
                    ₹{(form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0) * (1 + Number(form.gstRate || 0) / 100)).toFixed(2)}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => { setAddOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit">Create Bill</Button>
          </div>
        </form>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedBill(null) }}
        title={selectedBill?.billNumber || 'Bill Details'}
        size="xl"
      >
        {selectedBill && (
          <div className="space-y-6">
            {/* Hospital Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Meridian Health System</h3>
                <p className="text-xs text-slate-light">Hospital Bill</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-ink">{selectedBill.billNumber || selectedBill._id}</p>
                <p className="text-xs text-slate-light">{new Date(selectedBill.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-light">Patient Information</h4>
              {selectedBill.patient ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-light">Name:</span>{' '}
                    <span className="font-medium text-ink">{selectedBill.patient.name || 'Deleted Patient'}</span>
                  </div>
                  <div>
                    <span className="text-slate-light">Patient ID:</span>{' '}
                    <span className="font-medium text-ink">{selectedBill.patient.id || selectedBill.patientId || '—'}</span>
                  </div>
                  {selectedBill.patient.phone && (
                    <div>
                      <span className="text-slate-light">Phone:</span>{' '}
                      <span className="font-medium text-ink">{selectedBill.patient.phone}</span>
                    </div>
                  )}
                  {selectedBill.patient.age && (
                    <div>
                      <span className="text-slate-light">Age/Gender:</span>{' '}
                      <span className="font-medium text-ink">
                        {selectedBill.patient.age}y {selectedBill.patient.gender ? `/ ${selectedBill.patient.gender}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-light">Deleted Patient ({selectedBill.patientId || 'Unknown'})</p>
              )}
            </div>

            {/* Bill Items */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-light">Bill Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-slate-light">
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">Unit Price</th>
                    <th className="py-2 pl-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((item, i) => (
                    <tr key={i} className="border-b border-line/50">
                      <td className="py-2 pr-2 text-ink">{item.description}</td>
                      <td className="py-2 px-2 text-slate">{item.quantity || 1}</td>
                      <td className="py-2 px-2 text-slate">₹{Number(item.unitPrice || item.amount || 0).toFixed(2)}</td>
                      <td className="py-2 pl-2 text-right font-medium text-ink">₹{Number(item.subtotal || item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {selectedBill.gstEnabled && (
                    <tr>
                      <td colSpan="3" className="py-2 pr-2 text-right text-slate-light">
                        Subtotal
                      </td>
                      <td className="py-2 pl-2 text-right text-slate">
                        ₹{((selectedBill.totalAmount || 0) / (1 + Number(selectedBill.gstRate || 0) / 100)).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {selectedBill.gstEnabled && (
                    <tr>
                      <td colSpan="3" className="py-2 pr-2 text-right text-slate-light">
                        GST ({selectedBill.gstRate || 18}%)
                      </td>
                      <td className="py-2 pl-2 text-right text-slate">
                        ₹{((selectedBill.totalAmount || 0) - (selectedBill.totalAmount || 0) / (1 + Number(selectedBill.gstRate || 0) / 100)).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="3" className="py-2 pr-2 text-right font-semibold text-ink">
                      Total
                    </td>
                    <td className="py-2 pl-2 text-right font-bold text-primary">
                      ₹{Number(selectedBill.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Summary */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-light">Amount Paid</p>
                  <p className="font-semibold text-ink">₹{Number(selectedBill.amountPaid || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-light">Balance</p>
                  <p className="font-semibold text-amber-600">₹{Math.max(0, (selectedBill.totalAmount || 0) - (selectedBill.amountPaid || 0)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-light">Status</p>
                  <Badge tone={statusTone(selectedBill.status)}>{selectedBill.status}</Badge>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {(selectedBill.paymentHistory || []).length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-light">Payment History</h4>
                <div className="space-y-2">
                  {selectedBill.paymentHistory.map((payment, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          ₹{Number(payment.amount).toFixed(2)}
                          <span className="ml-2 text-xs font-normal text-slate-light capitalize">via {payment.method.replace(/_/g, ' ')}</span>
                        </p>
                        <p className="text-xs text-slate-light">
                          {payment.collectedAt ? new Date(payment.collectedAt).toLocaleString() : ''}
                          {payment.collectedBy?.name ? ` · Collected by ${payment.collectedBy.name}` : ''}
                        </p>
                      </div>
                      {payment.transactionId && (
                        <span className="text-xs text-slate-light">Tx: {payment.transactionId}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}