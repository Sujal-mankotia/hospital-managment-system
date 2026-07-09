import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiSave, FiFilter } from 'react-icons/fi'
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
const HOSPITAL_API = (import.meta.env.VITE_HOSPITAL_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '').replace(/\/api$/, '')

const getAuthHeaders = (includeJson = false) => {
  const token = localStorage.getItem('hospital_token')
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const isNearExpiry = (expiryDate) => {
  if (!expiryDate) return false
  return new Date(expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

const getInventoryBadge = (medicine) => {
  const lowStock = Number(medicine.stockQuantity) < 10
  const nearExpiry = isNearExpiry(medicine.expiryDate)

  if (lowStock && nearExpiry) return { text: 'Low stock · Near expiry', tone: 'danger' }
  if (lowStock) return { text: 'Low stock', tone: 'warning' }
  if (nearExpiry) return { text: 'Near expiry', tone: 'warning' }
  return { text: 'Healthy', tone: 'success' }
}

export default function PharmacyPage() {
  const { pushToast } = useUI()
  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [stockDrafts, setStockDrafts] = useState({})
  const [form, setForm] = useState({
    name: '',
    category: '',
    stockQuantity: '',
    unitPrice: '',
    expiryDate: '',
    supplier: '',
  })

  const categories = useMemo(() => ['All', ...new Set(medicines.map((medicine) => medicine.category).filter(Boolean))], [medicines])

  const filtered = useMemo(() => medicines.filter((medicine) =>
    (category === 'All' || medicine.category === category) &&
    (
      medicine.name.toLowerCase().includes(search.toLowerCase()) ||
      medicine.category.toLowerCase().includes(search.toLowerCase())
    )
  ), [medicines, search, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loadMedicines = () => {
    setLoading(true)
    fetch(`${HOSPITAL_API}/api/medicines`, { headers: getAuthHeaders() })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((data) => setMedicines(data.medicines || []))
      .catch((err) => pushToast({ type: 'error', title: 'Failed to load medicines', description: err.message || String(err) }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMedicines()
  }, [])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({ name: '', category: '', stockQuantity: '', unitPrice: '', expiryDate: '', supplier: '' })
  }

  const handleCreateMedicine = (event) => {
    event.preventDefault()

    fetch(`${HOSPITAL_API}/api/medicines`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        ...form,
        stockQuantity: Number(form.stockQuantity),
        unitPrice: Number(form.unitPrice),
      }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((data) => {
        setMedicines((prev) => [data.medicine, ...prev])
        setAddOpen(false)
        resetForm()
        setPage(1)
        pushToast({ type: 'success', title: 'Medicine added', description: 'The medicine record was created.' })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Create medicine failed', description: err.message || String(err) }))
  }

  const handleStockUpdate = (medicine) => {
    const nextQuantity = Number(stockDrafts[medicine._id] ?? medicine.stockQuantity)

    fetch(`${HOSPITAL_API}/api/medicines/${medicine._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ stockQuantity: nextQuantity }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((err) => Promise.reject(err)))
      .then((data) => {
        setMedicines((prev) => prev.map((item) => (item._id === medicine._id ? data.medicine : item)))
        setStockDrafts((prev) => ({ ...prev, [medicine._id]: data.medicine.stockQuantity }))
        pushToast({ type: 'success', title: 'Stock updated', description: `${medicine.name} stock was adjusted.` })
      })
      .catch((err) => pushToast({ type: 'error', title: 'Stock update failed', description: err.message || String(err) }))
  }

  return (
    <div>
      <PageHeader
        title="Pharmacy"
        breadcrumb={[{ label: 'Pharmacy' }]}
        description="Manage medicines, track stock, and monitor inventory alerts."
        actions={<Button icon={FiPlus} onClick={() => setAddOpen(true)}>Add Medicine</Button>}
      />

      <div className="card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by medicine or category…" className="sm:max-w-xs" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-light"><FiFilter size={14} /></div>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-sm text-slate-light">Loading medicines…</div>
        ) : paged.length === 0 ? (
          <EmptyState title="No medicines found" description="Try adjusting your search or add a new medicine." />
        ) : (
          <>
            <DataTable columns={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'stock', label: 'Stock' },
              { key: 'price', label: 'Price' },
              { key: 'expiry', label: 'Expiry' },
              { key: 'alert', label: 'Alert' },
            ]}>
              {paged.map((medicine) => {
                const badge = getInventoryBadge(medicine)
                return (
                  <tr key={medicine._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{medicine.name}</p>
                      <p className="text-xs text-slate-light">{medicine.supplier}</p>
                    </td>
                    <td className="px-4 py-3 text-slate">{medicine.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockDrafts[medicine._id] ?? medicine.stockQuantity}
                          onChange={(event) => setStockDrafts((prev) => ({ ...prev, [medicine._id]: event.target.value }))}
                          className="w-20 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink"
                        />
                        <Button type="button" size="sm" variant="outline" icon={FiSave} onClick={() => handleStockUpdate(medicine)}>
                          Save
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate">₹{Number(medicine.unitPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate">{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3"><Badge tone={badge.tone}>{badge.text}</Badge></td>
                  </tr>
                )
              })}
            </DataTable>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Medicine" size="lg">
        <form className="space-y-4" onSubmit={handleCreateMedicine}>
          <Input label="Name" name="name" value={form.name} onChange={handleFieldChange} placeholder="Paracetamol" required />
          <Input label="Category" name="category" value={form.category} onChange={handleFieldChange} placeholder="Pain relief" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Stock" name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={handleFieldChange} placeholder="100" required />
            <Input label="Price" name="unitPrice" type="number" min="0" value={form.unitPrice} onChange={handleFieldChange} placeholder="20" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={handleFieldChange} />
            <Input label="Supplier" name="supplier" value={form.supplier} onChange={handleFieldChange} placeholder="Med Supply Co" required />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Add Medicine</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
