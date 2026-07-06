export const doctors = [
  { id: 'DR-3301', name: 'Dr. Rohan Mehta', department: 'Cardiology', qualification: 'MD, DM Cardiology', experience: '14 yrs', availability: 'Available', patients: 42, status: 'Active', photo: 'https://i.pravatar.cc/120?img=13', rating: 4.8, phone: '+91 98110 22334', email: 'rohan.mehta@meridianhealth.example' },
  { id: 'DR-3302', name: 'Dr. Kavita Rao', department: 'Neurology', qualification: 'MD, DM Neurology', experience: '18 yrs', availability: 'In Surgery', patients: 37, status: 'Active', photo: 'https://i.pravatar.cc/120?img=44', rating: 4.9, phone: '+91 98211 55667', email: 'kavita.rao@meridianhealth.example' },
  { id: 'DR-3303', name: 'Dr. Arjun Verma', department: 'Orthopedics', qualification: 'MS Ortho', experience: '10 yrs', availability: 'Available', patients: 51, status: 'Active', photo: 'https://i.pravatar.cc/120?img=11', rating: 4.6, phone: '+91 99000 11223', email: 'arjun.verma@meridianhealth.example' },
  { id: 'DR-3304', name: 'Dr. Neha Kapoor', department: 'Gynecology', qualification: 'MD Obstetrics & Gynae', experience: '12 yrs', availability: 'On Leave', patients: 29, status: 'On Leave', photo: 'https://i.pravatar.cc/120?img=48', rating: 4.7, phone: '+91 97654 32109', email: 'neha.kapoor@meridianhealth.example' },
  { id: 'DR-3305', name: 'Dr. Priya Sen', department: 'Pediatrics', qualification: 'MD Pediatrics', experience: '9 yrs', availability: 'Available', patients: 63, status: 'Active', photo: 'https://i.pravatar.cc/120?img=25', rating: 4.9, phone: '+91 96543 21098', email: 'priya.sen@meridianhealth.example' },
  { id: 'DR-3306', name: 'Dr. Imran Qureshi', department: 'Pulmonology', qualification: 'MD Pulmonology', experience: '15 yrs', availability: 'Available', patients: 33, status: 'Active', photo: 'https://i.pravatar.cc/120?img=60', rating: 4.5, phone: '+91 95432 10987', email: 'imran.qureshi@meridianhealth.example' },
  { id: 'DR-3307', name: 'Dr. Leela Menon', department: 'Dermatology', qualification: 'MD Dermatology', experience: '7 yrs', availability: 'Available', patients: 24, status: 'Active', photo: 'https://i.pravatar.cc/120?img=30', rating: 4.4, phone: '+91 94321 09876', email: 'leela.menon@meridianhealth.example' },
  { id: 'DR-3308', name: 'Dr. Suresh Pillai', department: 'General Medicine', qualification: 'MBBS, MD', experience: '20 yrs', availability: 'In Surgery', patients: 58, status: 'Active', photo: 'https://i.pravatar.cc/120?img=52', rating: 4.8, phone: '+91 93210 98765', email: 'suresh.pillai@meridianhealth.example' },
]

export const doctorSchedule = {
  'DR-3301': [
    { day: 'Mon', slots: ['09:00–12:00', '16:00–19:00'] },
    { day: 'Tue', slots: ['09:00–12:00'] },
    { day: 'Wed', slots: ['09:00–12:00', '16:00–19:00'] },
    { day: 'Thu', slots: ['Off'] },
    { day: 'Fri', slots: ['09:00–12:00', '16:00–19:00'] },
    { day: 'Sat', slots: ['09:00–13:00'] },
    { day: 'Sun', slots: ['Off'] },
  ],
}

export const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Gynecology', 'Pediatrics', 'Pulmonology', 'Dermatology', 'General Medicine']
