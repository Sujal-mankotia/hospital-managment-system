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
import {
  statCards, revenueTrend, patientStats, departmentDistribution, upcomingAppointments, quickActions,
} from '../../data/dashboard'
import { patients } from '../../data/patients'
import { activities } from '../../data/activities'
import { todayLabel } from '../../utils/format'

const statIcons = {
  patients: MdOutlinePeopleAlt, doctors: MdOutlineLocalHospital, appointments: MdOutlineEventAvailable,
  revenue: MdOutlinePayments, emergency: MdOutlineEmergency, beds: MdOutlineBed,
}
const statTones = { patients: 'primary', doctors: 'teal', appointments: 'primary', revenue: 'teal', emergency: 'rose', beds: 'amber' }

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <PageHeader title="Dashboard" description={`Here's what's happening across Meridian Health today, ${todayLabel()}.`} />

      {/* Welcome card */}
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
            <p className="font-display text-xl font-bold">7</p>
            <p className="text-xs text-white/70">Emergencies</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold">38</p>
            <p className="text-xs text-white/70">Beds Free</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold">132</p>
            <p className="text-xs text-white/70">Appointments</p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <StatCard key={s.key} label={s.label} value={s.value} prefix={s.prefix} delta={s.delta} trend={s.trend} icon={statIcons[s.key]} tone={statTones[s.key]} />
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" description="Monthly revenue, Jan – Jul 2026" className="lg:col-span-2">
          <RevenueAreaChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Department Distribution" description="Active patients by department">
          <DepartmentPieChart data={departmentDistribution} />
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Patient Statistics" description="Inpatient vs outpatient, this week" className="lg:col-span-2">
          <PatientBarChart data={patientStats} />
        </ChartCard>
        <ChartCard title="Calendar">
          <MiniCalendar />
        </ChartCard>
      </div>

      {/* Tables + side panels */}
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
            {upcomingAppointments.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{a.patient}</p>
                  <p className="text-xs text-slate-light">{a.doctor} · {a.dept}</p>
                </div>
                <span className="rounded-lg bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">Recent Activity</h3>
          <ActivityFeed items={activities} />
        </div>
      </div>
    </div>
  )
}
