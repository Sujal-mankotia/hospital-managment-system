import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MdOutlinePeopleAlt, MdOutlineLocalHospital, MdOutlineEventAvailable,
  MdOutlinePayments, MdOutlineEmergency, MdOutlineBed,
} from 'react-icons/md'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/cards/StatCard'
import ChartCard from '../../components/cards/ChartCard'
import MiniCalendar from '../../components/cards/MiniCalendar'
import QuickActions from '../../components/cards/QuickActions'
import ActivityFeed from '../../components/cards/ActivityFeed'
import DataTable from '../../components/tables/DataTable'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import RevenueAreaChart from '../../components/charts/RevenueAreaChart'
import PatientBarChart from '../../components/charts/PatientBarChart'
import DepartmentPieChart from '../../components/charts/DepartmentPieChart'
import { useAuth } from '../../context/AuthContext'
import { useUI } from '../../context/UIContext'
import { apiRequest } from '../../api/hospitalApi'
import { quickActions } from '../../data/dashboard'
import { doctors } from '../../data/doctors'
import { todayLabel } from '../../utils/format'

const statIcons = {
  patients: MdOutlinePeopleAlt,
  doctors: MdOutlineLocalHospital,
  appointments: MdOutlineEventAvailable,
  revenue: MdOutlinePayments,
  emergency: MdOutlineEmergency,
  beds: MdOutlineBed,
}

const statTones = {
  patients: 'primary',
  doctors: 'teal',
  appointments: 'primary',
  revenue: 'teal',
  emergency: 'rose',
  beds: 'amber',
}

const chartColors = ['#0F6FDE', '#14B8A6', '#F59E0B', '#8B5CF6', '#E11D48', '#64748B', '#22C55E', '#F97316']

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function isSameDay(value, targetDate) {
  if (!value) return false
  return value.slice(0, 10) === targetDate
}

function formatAppointmentDate(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function sortAppointmentsBySlot(left, right) {
  return `${left.date || ''} ${left.time || ''}`.localeCompare(`${right.date || ''} ${right.time || ''}`)
}

function formatActivityTime(value) {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildWeeklyStats(patients, appointments) {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = toDateKey(date)

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      inpatient: patients.filter((patient) => isSameDay(patient.admitted || patient.createdAt, key)).length,
      outpatient: appointments.filter((appointment) => isSameDay(appointment.date, key)).length,
    }
  })
}

function buildRevenueTrend(bills) {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (6 - index), 1)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const revenue = bills
      .filter((bill) => {
        const created = new Date(bill.createdAt)
        return !Number.isNaN(created.getTime()) &&
          created.getFullYear() === date.getFullYear() &&
          created.getMonth() === date.getMonth() &&
          !['cancelled', 'refunded'].includes(bill.status)
      })
      .reduce((sum, bill) => sum + Number(bill.amountPaid || 0), 0)

    return { month, revenue }
  })
}

function buildDepartmentDistribution(patients, appointments) {
  const doctorDepartment = Object.fromEntries(doctors.map((doctor) => [doctor.name, doctor.department]))
  const counts = new Map()

  appointments.forEach((appointment) => {
    if (appointment.department) counts.set(appointment.department, (counts.get(appointment.department) || 0) + 1)
  })

  patients.forEach((patient) => {
    const department = doctorDepartment[patient.doctor]
    if (department) counts.set(department, (counts.get(department) || 0) + 1)
  })

  return Array.from(counts, ([name, value], index) => ({
    name,
    value,
    color: chartColors[index % chartColors.length],
  }))
}

function buildActivityItems(patients, appointments, bills) {
  const patientItems = patients.slice(0, 4).map((patient) => ({
    id: `patient-${patient.id}`,
    actor: patient.name,
    action: 'was added as a',
    target: `${patient.status || 'patient'} patient`,
    type: patient.status === 'Discharged' ? 'discharge' : 'admission',
    time: formatActivityTime(patient.createdAt || patient.updatedAt),
    sortDate: patient.createdAt || patient.updatedAt,
  }))

  const appointmentItems = appointments.slice(0, 4).map((appointment) => ({
    id: `appointment-${appointment.id}`,
    actor: appointment.patient,
    action: 'has an appointment with',
    target: appointment.doctor,
    type: 'appointment',
    time: formatActivityTime(appointment.createdAt || appointment.updatedAt || appointment.date),
    sortDate: appointment.createdAt || appointment.updatedAt || appointment.date,
  }))

  const billItems = bills.slice(0, 4).map((bill) => ({
    id: `bill-${bill._id || bill.id}`,
    actor: bill.patientName || bill.patientId?.name || 'Billing',
    action: 'created a bill for',
    target: `Rs ${Number(bill.totalAmount || 0).toFixed(2)}`,
    type: 'billing',
    time: formatActivityTime(bill.createdAt || bill.updatedAt),
    sortDate: bill.createdAt || bill.updatedAt,
  }))

  return [...patientItems, ...appointmentItems, ...billItems]
    .sort((left, right) => new Date(right.sortDate || 0) - new Date(left.sortDate || 0))
    .slice(0, 6)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { pushToast } = useUI()
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])

  const today = toDateKey()
  const appointmentsToday = useMemo(
    () => appointments.filter((appointment) => isSameDay(appointment.date, today) && appointment.status !== 'Cancelled'),
    [appointments, today]
  )
  const activeAdmissions = useMemo(
    () => patients.filter((patient) => patient.status !== 'Discharged'),
    [patients]
  )
  const criticalPatients = useMemo(
    () => patients.filter((patient) => patient.status === 'Critical'),
    [patients]
  )
  const todayRevenue = useMemo(
    () => bills
      .filter((bill) => isSameDay(bill.createdAt, today) && !['cancelled', 'refunded'].includes(bill.status))
      .reduce((sum, bill) => sum + Number(bill.amountPaid || 0), 0),
    [bills, today]
  )
  const liveStatCards = useMemo(() => [
    { key: 'patients', label: 'Total Patients', value: patients.length },
    {
      key: 'doctors',
      label: 'Doctors On Duty',
      value: doctors.filter((doctor) => doctor.status === 'Active' && doctor.availability !== 'On Leave').length,
    },
    { key: 'appointments', label: 'Appointments Today', value: appointmentsToday.length },
    { key: 'revenue', label: "Today's Revenue", value: todayRevenue, prefix: 'Rs ' },
    { key: 'emergency', label: 'Critical Patients', value: criticalPatients.length },
    { key: 'beds', label: 'Active Admissions', value: activeAdmissions.length },
  ], [activeAdmissions.length, appointmentsToday.length, criticalPatients.length, patients.length, todayRevenue])

  const patientStats = useMemo(() => buildWeeklyStats(patients, appointments), [patients, appointments])
  const revenueTrend = useMemo(() => buildRevenueTrend(bills), [bills])
  const departmentDistribution = useMemo(() => buildDepartmentDistribution(patients, appointments), [patients, appointments])
  const liveActivities = useMemo(() => buildActivityItems(patients, appointments, bills), [patients, appointments, bills])
  const upcomingAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.status !== 'Cancelled' && (!appointment.date || appointment.date >= today))
      .sort(sortAppointmentsBySlot)
      .slice(0, 5),
    [appointments, today]
  )

  useEffect(() => {
    Promise.allSettled([
      apiRequest('/patients?limit=1000'),
      apiRequest('/appointments?limit=1000'),
      apiRequest('/bills?limit=1000'),
    ])
      .then(([patientResult, appointmentResult, billResult]) => {
        if (patientResult.status === 'fulfilled') setPatients(patientResult.value.items || [])
        if (appointmentResult.status === 'fulfilled') setAppointments(appointmentResult.value.items || [])
        if (billResult.status === 'fulfilled') setBills(billResult.value.bills || [])

        if (patientResult.status === 'rejected' && appointmentResult.status === 'rejected') {
          throw patientResult.reason || appointmentResult.reason
        }
      })
      .catch((err) => pushToast({ type: 'error', title: 'Failed to load dashboard data', description: err.message || String(err) }))
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard" description={`Here's what's happening across Meridian Health today, ${todayLabel()}.`} />

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="card mb-6 flex flex-col items-start justify-between gap-4 bg-gradient-to-r from-primary to-primary-dark p-6 text-white sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={user?.name} size="lg" ring />
          <div>
            <p className="text-sm text-white/80">Welcome back,</p>
            <h2 className="font-display text-xl font-semibold">{user?.name || 'Doctor'}</h2>
            <p className="text-xs text-white/70">{user?.role}</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-display text-xl font-bold">{criticalPatients.length}</p>
            <p className="text-xs text-white/70">Critical</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold">{activeAdmissions.length}</p>
            <p className="text-xs text-white/70">Admitted</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold">{appointmentsToday.length}</p>
            <p className="text-xs text-white/70">Appointments</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {liveStatCards.map((s) => (
          <StatCard key={s.key} label={s.label} value={s.value} prefix={s.prefix} delta={s.delta} trend={s.trend} icon={statIcons[s.key]} tone={statTones[s.key]} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" description="Monthly revenue, Jan-Jul 2026" className="lg:col-span-2">
          <RevenueAreaChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Department Distribution" description="Live patients and appointments by department">
          {departmentDistribution.length > 0 ? (
            <DepartmentPieChart data={departmentDistribution} />
          ) : (
            <p className="py-20 text-center text-sm text-slate-light">No department data yet.</p>
          )}
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Patient Statistics" description="New admissions and appointments, last 7 days" className="lg:col-span-2">
          <PatientBarChart data={patientStats} />
        </ChartCard>
        <ChartCard title="Calendar">
          <MiniCalendar />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent Patients</h3>
            <Badge tone="info">{patients.length} total</Badge>
          </div>
          <DataTable columns={[
            { key: 'name', label: 'Patient' }, { key: 'doctor', label: 'Doctor' },
            { key: 'disease', label: 'Condition' }, { key: 'status', label: 'Status' },
          ]}>
            {patients.slice(0, 6).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="flex items-center gap-3 px-4 py-3">
                  <Avatar src={p.photo} name={p.name} size="sm" />
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="id-tag">{p.id}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate">{p.doctor}</td>
                <td className="px-4 py-3 text-slate">{p.disease}</td>
                <td className="px-4 py-3"><Badge>{p.status}</Badge></td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-light" colSpan={4}>No patients found.</td>
              </tr>
            )}
          </DataTable>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-ink">Quick Actions</h3>
            <QuickActions items={quickActions} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink">Upcoming Appointments</h3>
          <div className="divide-y divide-line/70">
            {upcomingAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{a.patient}</p>
                  <p className="text-xs text-slate-light">{a.doctor} - {a.department}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{formatAppointmentDate(a.date)} {a.time}</span>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-light">No upcoming appointments.</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Recent Activity</h3>
          {liveActivities.length > 0 ? (
            <ActivityFeed items={liveActivities} />
          ) : (
            <p className="py-6 text-center text-sm text-slate-light">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  )
}
