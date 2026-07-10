import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Appointment from './models/Appointment.js'
import Bill from './models/Bill.js'
import LabReport from './models/LabReport.js'
import Medicine from './models/Medicine.js'
import Patient from './models/Patient.js'
import Payment from './models/Payment.js'
import User from './models/User.js'

dotenv.config()

const doctors = [
  { name: 'Dr. Rohan Mehta', department: 'Cardiology' },
  { name: 'Dr. Kavita Rao', department: 'Neurology' },
  { name: 'Dr. Arjun Verma', department: 'Orthopedics' },
  { name: 'Dr. Neha Kapoor', department: 'Gynecology' },
  { name: 'Dr. Priya Sen', department: 'Pediatrics' },
  { name: 'Dr. Imran Qureshi', department: 'Pulmonology' },
  { name: 'Dr. Leela Menon', department: 'Dermatology' },
  { name: 'Dr. Suresh Pillai', department: 'General Medicine' },
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
const appointmentStatuses = ['Completed', 'Pending', 'Cancelled']
const billItems = ['Consultation', 'Lab Tests', 'Medicines', 'Surgery']
const paymentMethods = ['cash', 'card', 'upi', 'insurance']
const labTests = ['CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid', 'Blood Sugar', 'Vitamin D', 'Urine Analysis']

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
    CBC: ['Hemoglobin and WBC counts are within acceptable range.', 'Mild anemia pattern noted; dietary iron review advised.'],
    'Lipid Profile': ['LDL is mildly elevated; lifestyle changes recommended.', 'Lipid values are controlled with current plan.'],
    'Liver Function': ['Liver enzymes are within normal clinical limits.', 'Slight SGPT rise; repeat test suggested in two weeks.'],
    'Kidney Function': ['Creatinine and urea values are stable.', 'Hydration advised; kidney markers need routine monitoring.'],
    Thyroid: ['TSH level suggests stable thyroid function.', 'TSH is borderline high; endocrinology follow-up advised.'],
    'Blood Sugar': ['Fasting sugar is controlled.', 'Post-prandial sugar is elevated; diet plan review advised.'],
    'Vitamin D': ['Vitamin D insufficiency detected; supplementation advised.', 'Vitamin D level is adequate.'],
    'Urine Analysis': ['No significant infection markers detected.', 'Trace protein present; repeat sample advised.'],
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
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Bill.deleteMany({}),
    Payment.deleteMany({}),
    Medicine.deleteMany({}),
    LabReport.deleteMany({}),
  ])

  const users = await User.create([
    {
      name: process.env.ADMIN_NAME || 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@meridianhealth.test',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    },
    ...doctors.map((doctor, index) => ({ name: doctor.name, email: `doctor${index + 1}@meridianhealth.test`, password: 'Doctor@12345', role: 'doctor' })),
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
