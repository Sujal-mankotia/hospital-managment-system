import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Appointment from './models/Appointment.js'
import Bill from './models/Bill.js'
import LabReport from './models/LabReport.js'
import Medicine from './models/Medicine.js'
import Patient from './models/Patient.js'
import Payment from './models/Payment.js'
import Doctor from './models/Doctor.js'
import User from './models/User.js'
import { buildBillNumber } from './utils/billNumber.js'

dotenv.config()

const doctorSchedule = [
  { day: 'Mon', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Tue', slots: ['09:00-12:00'] },
  { day: 'Wed', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Thu', slots: ['Off'] },
  { day: 'Fri', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Sat', slots: ['09:00-13:00'] },
  { day: 'Sun', slots: ['Off'] },
]

const doctors = [
  { id: 'DR-3301', name: 'Dr. Rohan Mehta', department: 'Cardiology', qualification: 'MD, DM Cardiology', experience: '14 yrs', availability: 'Available', status: 'Active', photo: 'https://i.pravatar.cc/120?img=13', rating: 4.8, patients: 42, phone: '+91 98110 22334', email: 'rohan.mehta@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3302', name: 'Dr. Kavita Rao', department: 'Neurology', qualification: 'MD, DM Neurology', experience: '18 yrs', availability: 'In Surgery', status: 'Active', photo: 'https://i.pravatar.cc/120?img=44', rating: 4.9, patients: 37, phone: '+91 98211 55667', email: 'kavita.rao@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3303', name: 'Dr. Arjun Verma', department: 'Orthopedics', qualification: 'MS Ortho', experience: '10 yrs', availability: 'Available', status: 'Active', photo: 'https://i.pravatar.cc/120?img=11', rating: 4.6, patients: 51, phone: '+91 99000 11223', email: 'arjun.verma@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3304', name: 'Dr. Neha Kapoor', department: 'Gynecology', qualification: 'MD Obstetrics & Gynae', experience: '12 yrs', availability: 'On Leave', status: 'On Leave', photo: 'https://i.pravatar.cc/120?img=48', rating: 4.7, patients: 29, phone: '+91 97654 32109', email: 'neha.kapoor@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3305', name: 'Dr. Priya Sen', department: 'Pediatrics', qualification: 'MD Pediatrics', experience: '9 yrs', availability: 'Available', status: 'Active', photo: 'https://i.pravatar.cc/120?img=25', rating: 4.9, patients: 63, phone: '+91 96543 21098', email: 'priya.sen@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3306', name: 'Dr. Imran Qureshi', department: 'Pulmonology', qualification: 'MD Pulmonology', experience: '15 yrs', availability: 'Available', status: 'Active', photo: 'https://i.pravatar.cc/120?img=60', rating: 4.5, patients: 33, phone: '+91 95432 10987', email: 'imran.qureshi@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3307', name: 'Dr. Leela Menon', department: 'Dermatology', qualification: 'MD Dermatology', experience: '7 yrs', availability: 'Available', status: 'Active', photo: 'https://i.pravatar.cc/120?img=30', rating: 4.4, patients: 24, phone: '+91 94321 09876', email: 'leela.menon@meridianhealth.example', schedule: doctorSchedule },
  { id: 'DR-3308', name: 'Dr. Suresh Pillai', department: 'General Medicine', qualification: 'MBBS, MD', experience: '20 yrs', availability: 'In Surgery', status: 'Active', photo: 'https://i.pravatar.cc/120?img=52', rating: 4.8, patients: 58, phone: '+91 93210 98765', email: 'suresh.pillai@meridianhealth.example', schedule: doctorSchedule },
]

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya',
  'Ananya', 'Diya', 'Aadhya', 'Kiara', 'Myra', 'Ira', 'Anika', 'Avni', 'Saanvi', 'Meera',
  'Kabir', 'Rohan', 'Kunal', 'Nikhil', 'Ritika', 'Pooja', 'Neha', 'Kavya', 'Sahil', 'Tanvi',
]
const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Mehta', 'Singh', 'Rao']
const cities = ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Jaipur', 'Chandigarh', 'Lucknow', 'Ahmedabad', 'Kochi', 'Hyderabad']
const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const diseases = ['Hypertension', 'Diabetes', 'Fever', 'Migraine', 'Asthma', 'Gastritis', 'Back Pain', 'Thyroid Disorder']
const patientStatuses = ['Admitted', 'Critical', 'Stable', 'Discharged']
const appointmentStatuses = ['Confirmed', 'In Progress', 'Waiting', 'Completed', 'Pending', 'Cancelled']
const billItems = ['Consultation', 'Lab Tests', 'Medicines', 'Surgery']
const paymentMethods = ['cash', 'card', 'upi', 'insurance']
const labTests = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (TSH, T3, T4)',
  'Blood Sugar (Fasting)',
  'Vitamin D',
  'Urine Routine',
]

function pick(list, index) {
  return list[index % list.length]
}

function futureDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function dateString(days) {
  return futureDate(days).toISOString().slice(0, 10)
}

function makePatient(index) {
  const name = `${pick(firstNames, index)} ${pick(lastNames, index + 3)}`
  const doctor = pick(doctors, index)
  return {
    id: `PT-${String(20480 + index).padStart(5, '0')}`,
    name,
    age: 18 + (index * 7) % 63,
    gender: index % 3 === 0 ? 'Female' : index % 3 === 1 ? 'Male' : 'Other',
    bloodGroup: pick(bloodGroups, index),
    phone: `+91 9${String(800000000 + index * 7319).slice(0, 9)}`,
    address: `${12 + index}, ${pick(cities, index)} Main Road, ${pick(cities, index + 2)}`,
    disease: pick(diseases, index),
    doctorId: doctor.id,
    doctor: doctor.name,
    status: pick(patientStatuses, index),
    admitted: dateString(-index),
    ward: `Ward-${(index % 8) + 1}`,
    medicalHistory: [
      {
        date: dateString(-60 - index),
        title: pick(diseases, index),
        detail: 'Initial consultation completed with vitals recorded and follow-up advised.',
        type: 'checkup',
      },
      {
        date: dateString(-20 - index),
        title: 'Medication Review',
        detail: 'Dosage reviewed, symptoms monitored, and recovery plan updated.',
        type: 'medication',
      },
    ],
  }
}

function reportRemark(testName, index) {
  const remarks = {
    'Complete Blood Count (CBC)': ['Hemoglobin and WBC counts are within acceptable range.', 'Mild anemia pattern noted; dietary iron review advised.'],
    'Lipid Profile': ['LDL is mildly elevated; lifestyle changes recommended.', 'Lipid values are controlled with current plan.'],
    'Liver Function Test (LFT)': ['Liver enzymes are within normal clinical limits.', 'Slight SGPT rise; repeat test suggested in two weeks.'],
    'Kidney Function Test (KFT)': ['Creatinine and urea values are stable.', 'Hydration advised; kidney markers need routine monitoring.'],
    'Thyroid Profile (TSH, T3, T4)': ['TSH level suggests stable thyroid function.', 'TSH is borderline high; endocrinology follow-up advised.'],
    'Blood Sugar (Fasting)': ['Fasting sugar is controlled.', 'Post-prandial sugar is elevated; diet plan review advised.'],
    'Vitamin D': ['Vitamin D insufficiency detected; supplementation advised.', 'Vitamin D level is adequate.'],
    'Urine Routine': ['No significant infection markers detected.', 'Trace protein present; repeat sample advised.'],
  }
  return pick(remarks[testName], index)
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
  } catch (error) {
    if (!process.env.MONGO_URI_FALLBACK || !error.message.includes('querySrv ECONNREFUSED')) {
      throw error
    }
    console.warn('MongoDB SRV connection failed, trying fallback direct URI...')
    await mongoose.connect(process.env.MONGO_URI_FALLBACK)
  }

  await Promise.all([
    Doctor.deleteMany({}),
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Bill.deleteMany({}),
    Payment.deleteMany({}),
    Medicine.deleteMany({}),
    LabReport.deleteMany({}),
  ])

  const doctorDocs = await Doctor.insertMany(doctors)

  const users = await User.create([
    {
      name: process.env.ADMIN_NAME || 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@meridianhealth.test',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    },
    ...doctorDocs.map((doctor, index) => ({ name: doctor.name, email: `doctor${index + 1}@meridianhealth.test`, password: 'Doctor@12345', role: 'doctor' })),
    { name: 'Riya Malhotra', email: 'reception1@meridianhealth.test', password: 'Reception@12345', role: 'receptionist' },
    { name: 'Manish Saini', email: 'reception2@meridianhealth.test', password: 'Reception@12345', role: 'receptionist' },
    { name: 'Anjali Menon', email: 'labtech1@meridianhealth.test', password: 'Lab@12345', role: 'lab_technician' },
    { name: 'Naveen Joshi', email: 'labtech2@meridianhealth.test', password: 'Lab@12345', role: 'lab_technician' },
    { name: 'Farah Khan', email: 'pharmacist1@meridianhealth.test', password: 'Pharma@12345', role: 'pharmacist' },
    { name: 'Vikram Bansal', email: 'pharmacist2@meridianhealth.test', password: 'Pharma@12345', role: 'pharmacist' },
  ])

  const patients = await Patient.insertMany(Array.from({ length: 50 }, (_, index) => makePatient(index + 1)))

  const appointments = await Appointment.insertMany(Array.from({ length: 80 }, (_, index) => {
    const patient = pick(patients, index)
    const doctor = pick(doctors, index + 2)
    return {
      id: `AP-${String(88000 + index).padStart(5, '0')}`,
      patientId: patient.id,
      patient: patient.name,
      doctorId: doctor.id,
      doctor: doctor.name,
      department: doctor.department,
      date: dateString((index % 30) - 10),
      time: `${String(9 + (index % 9)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`,
      priority: index % 9 === 0 ? 'Emergency' : index % 4 === 0 ? 'Follow-up' : 'Routine',
      status: pick(appointmentStatuses, index),
    }
  }))

  const medicines = await Medicine.insertMany(Array.from({ length: 40 }, (_, index) => {
    const names = ['Paracetamol', 'Amoxicillin', 'Cetirizine', 'Metformin', 'Amlodipine', 'Pantoprazole', 'Azithromycin', 'Vitamin D3']
    const categories = ['Pain Relief', 'Antibiotic', 'Antihistamine', 'Diabetes', 'Cardiac', 'Gastro', 'Antibiotic', 'Supplement']
    const manufacturers = ['Sun Pharma', 'Cipla', 'Dr Reddy Labs', 'Lupin', 'Zydus', 'Torrent Pharma', 'Alkem', 'Mankind']
    return {
      name: `${pick(names, index)} ${index % 3 === 0 ? '500mg' : index % 3 === 1 ? '250mg' : '10mg'}`,
      category: pick(categories, index),
      stockQuantity: 15 + (index * 11) % 180,
      unitPrice: 12 + (index * 17) % 240,
      supplier: pick(manufacturers, index),
      manufacturer: pick(manufacturers, index),
      expiryDate: futureDate(60 + index * 18),
    }
  }))

  const bills = await Bill.insertMany(Array.from({ length: 60 }, (_, index) => {
    const patient = pick(patients, index)
    const itemCount = 1 + (index % 4)
    const items = Array.from({ length: itemCount }, (__, itemIndex) => ({
      description: pick(billItems, index + itemIndex),
      amount: 350 + ((index + itemIndex) * 225) % 8500,
    }))
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    const isPaid = index % 3 !== 0
    return {
      billNumber: buildBillNumber(),
      patientId: patient.id,
      items,
      totalAmount,
      amountPaid: isPaid ? totalAmount : 0,
      paymentMethod: pick(paymentMethods, index),
      status: isPaid ? 'paid' : 'pending',
    }
  }))

  const paidBills = bills.filter((bill) => bill.status === 'paid')
  const payments = await Payment.insertMany(Array.from({ length: 60 }, (_, index) => {
    const bill = pick(paidBills, index)
    return {
    billId: bill._id,
    amount: index < paidBills.length ? bill.amountPaid : Math.round(bill.totalAmount * 0.5),
    method: pick(paymentMethods, index),
    paidAt: futureDate(-index),
    notes: index < paidBills.length ? 'Payment received against hospital bill.' : 'Second installment payment received.',
    }
  }))

  const labReports = await LabReport.insertMany(Array.from({ length: 60 }, (_, index) => {
    const patient = pick(patients, index + 4)
    const testName = pick(labTests, index)
    const completed = index % 4 !== 0
    return {
      patientId: patient.id,
      testName,
      result: completed ? reportRemark(testName, index) : '',
      remarks: reportRemark(testName, index + 1),
      status: completed ? 'completed' : 'pending',
      reportDate: futureDate(-index),
    }
  }))

  console.log('Database seeded successfully')
  console.table({
    doctors: doctorDocs.length,
    users: users.length,
    patients: patients.length,
    appointments: appointments.length,
    bills: bills.length,
    payments: payments.length,
    medicines: medicines.length,
    labreports: labReports.length,
  })

  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`)
  await mongoose.disconnect()
  process.exit(1)
})
