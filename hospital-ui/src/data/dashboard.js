export const statCards = [
  { key: 'patients', label: 'Total Patients', value: 1284, delta: '+4.2%', trend: 'up' },
  { key: 'doctors', label: 'Doctors On Duty', value: 46, delta: '+1', trend: 'up' },
  { key: 'appointments', label: "Appointments Today", value: 132, delta: '+18', trend: 'up' },
  { key: 'revenue', label: "Today's Revenue", value: 486200, prefix: '₹', delta: '+8.6%', trend: 'up' },
  { key: 'emergency', label: 'Emergency Patients', value: 7, delta: '+2', trend: 'down' },
  { key: 'beds', label: 'Available Beds', value: 38, delta: '-6', trend: 'down' },
]

export const revenueTrend = [
  { month: 'Jan', revenue: 3120000, expenses: 2100000 },
  { month: 'Feb', revenue: 3340000, expenses: 2180000 },
  { month: 'Mar', revenue: 3580000, expenses: 2260000 },
  { month: 'Apr', revenue: 3410000, expenses: 2340000 },
  { month: 'May', revenue: 3790000, expenses: 2410000 },
  { month: 'Jun', revenue: 4020000, expenses: 2490000 },
  { month: 'Jul', revenue: 4260000, expenses: 2530000 },
]

export const patientStats = [
  { day: 'Mon', inpatient: 210, outpatient: 340 },
  { day: 'Tue', inpatient: 224, outpatient: 365 },
  { day: 'Wed', inpatient: 198, outpatient: 310 },
  { day: 'Thu', inpatient: 240, outpatient: 388 },
  { day: 'Fri', inpatient: 256, outpatient: 402 },
  { day: 'Sat', inpatient: 190, outpatient: 260 },
  { day: 'Sun', inpatient: 150, outpatient: 190 },
]

export const departmentDistribution = [
  { name: 'Cardiology', value: 220, color: '#0F6FDE' },
  { name: 'Neurology', value: 160, color: '#14B8A6' },
  { name: 'Orthopedics', value: 190, color: '#F59E0B' },
  { name: 'Pediatrics', value: 175, color: '#8B5CF6' },
  { name: 'Gynecology', value: 130, color: '#E11D48' },
  { name: 'General Medicine', value: 210, color: '#64748B' },
]

export const upcomingAppointments = [
  { time: '09:30 AM', patient: 'Ananya Sharma', doctor: 'Dr. Rohan Mehta', dept: 'Cardiology' },
  { time: '10:00 AM', patient: 'Vikram Nair', doctor: 'Dr. Kavita Rao', dept: 'Neurology' },
  { time: '11:15 AM', patient: 'Simran Kaur', doctor: 'Dr. Arjun Verma', dept: 'Orthopedics' },
  { time: '01:30 PM', patient: 'Meera Iyer', doctor: 'Dr. Imran Qureshi', dept: 'Pulmonology' },
]

export const quickActions = [
  { label: 'Add Patient', icon: 'patient' },
  { label: 'Book Appointment', icon: 'appointment' },
  { label: 'Add Doctor', icon: 'doctor' },
  { label: 'Generate Report', icon: 'report' },
]
