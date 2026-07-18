import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Appointment from '../models/Appointment.js'
import Bill from '../models/Bill.js'
import Doctor from '../models/Doctor.js'
import LabReport from '../models/LabReport.js'
import Medicine from '../models/Medicine.js'
import Patient from '../models/Patient.js'
import Payment from '../models/Payment.js'

dotenv.config()

const departments = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Pulmonology',
  'Gynecology',
  'General Medicine',
]

const doctors = [
  ['DR-ATLAS-001', 'Dr. Aarav Mehta', 'Cardiology', 'MD Cardiology', '12 years', 'Available'],
  ['DR-ATLAS-002', 'Dr. Kiara Nair', 'Neurology', 'DM Neurology', '10 years', 'Available'],
  ['DR-ATLAS-003', 'Dr. Rohan Kapoor', 'Orthopedics', 'MS Orthopedics', '14 years', 'In Surgery'],
  ['DR-ATLAS-004', 'Dr. Meera Iyer', 'Pediatrics', 'MD Pediatrics', '9 years', 'Available'],
  ['DR-ATLAS-005', 'Dr. Sana Qureshi', 'Dermatology', 'MD Dermatology', '8 years', 'Available'],
  ['DR-ATLAS-006', 'Dr. Vikram Sethi', 'Pulmonology', 'MD Pulmonology', '11 years', 'On Leave'],
  ['DR-ATLAS-007', 'Dr. Nisha Bansal', 'Gynecology', 'MS Gynecology', '13 years', 'Available'],
  ['DR-ATLAS-008', 'Dr. Arjun Rao', 'General Medicine', 'MD Medicine', '15 years', 'Available'],
]

const names = [
  ['Aanya Sharma', 'Female', 24, 'Migraine follow-up'],
  ['Ritvik Malhotra', 'Male', 31, 'Hypertension review'],
  ['Kavya Menon', 'Female', 42, 'Diabetes management'],
  ['Ishaan Gupta', 'Male', 27, 'Sports injury'],
  ['Tara Singh', 'Female', 36, 'Thyroid imbalance'],
  ['Kabir Verma', 'Male', 52, 'Chest discomfort'],
  ['Naina Das', 'Female', 19, 'Seasonal allergy'],
  ['Aditya Kulkarni', 'Male', 44, 'Back pain'],
  ['Pihu Chawla', 'Female', 8, 'Pediatric fever'],
  ['Reyansh Jain', 'Male', 12, 'Asthma review'],
  ['Mira Sood', 'Female', 29, 'Pregnancy consultation'],
  ['Arnav Bose', 'Male', 61, 'Cardiac screening'],
  ['Saanvi Rao', 'Female', 34, 'Skin rash'],
  ['Vivaan Mishra', 'Male', 39, 'Routine health check'],
  ['Anika Pillai', 'Female', 47, 'Joint stiffness'],
  ['Neil Khanna', 'Male', 55, 'COPD follow-up'],
  ['Riya Arora', 'Female', 26, 'Vitamin deficiency'],
  ['Dhruv Saxena', 'Male', 33, 'Gastritis'],
  ['Myra Thomas', 'Female', 15, 'Acne treatment'],
  ['Yash Patil', 'Male', 23, 'Fracture follow-up'],
  ['Ira Bhatia', 'Female', 58, 'Blood pressure review'],
  ['Om Prakash', 'Male', 66, 'Kidney function review'],
  ['Zoya Khan', 'Female', 40, 'Lipid management'],
  ['Aarush Reddy', 'Male', 6, 'Vaccination visit'],
  ['Navya Joshi', 'Female', 49, 'Anemia review'],
  ['Shaurya Nanda', 'Male', 37, 'Sleep apnea check'],
  ['Avni Roy', 'Female', 22, 'General weakness'],
  ['Parth Shah', 'Male', 46, 'ECG follow-up'],
  ['Diya Fernandes', 'Female', 30, 'Urine infection'],
  ['Harsh Vohra', 'Male', 51, 'Liver function review'],
]

const medicines = [
  ['Paracetamol 650mg', 'Pain Relief', 220, 32, 'Apex MedSupply', 220],
  ['Azithromycin 500mg', 'Antibiotic', 90, 95, 'CareNova Pharma', 180],
  ['Metformin 500mg', 'Diabetes Care', 160, 48, 'GlucoWell Labs', 320],
  ['Amlodipine 5mg', 'Cardiac Care', 130, 42, 'Heartline Pharma', 290],
  ['Atorvastatin 10mg', 'Cardiac Care', 100, 58, 'Heartline Pharma', 260],
  ['Pantoprazole 40mg', 'Gastro Care', 180, 36, 'MediCore', 240],
  ['Cetirizine 10mg', 'Allergy', 210, 18, 'ReliefRx', 200],
  ['Vitamin D3 60000IU', 'Supplements', 75, 110, 'WellLife Distributors', 365],
  ['Salbutamol Inhaler', 'Respiratory', 64, 260, 'BreatheWell', 210],
  ['Iron Folic Acid', 'Supplements', 145, 28, 'WellLife Distributors', 300],
  ['Cefixime 200mg', 'Antibiotic', 82, 88, 'CareNova Pharma', 160],
  ['ORS Sachet', 'Emergency Care', 300, 12, 'HydraPlus', 400],
]

const reportTypes = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'HbA1c',
  'Thyroid Profile (TSH, T3, T4)',
  'Urine Routine',
  'Chest X-Ray',
  'ECG',
  'Vitamin D',
]

const futureDate = (days) => {
  const date = new Date('2026-08-01T09:00:00.000Z')
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

const isoDay = (date) => date.toISOString().slice(0, 10)

const currencyItems = (index) => {
  const consultation = 450 + (index % 6) * 75
  const lab = 300 + (index % 5) * 120
  const pharmacy = 180 + (index % 4) * 85
  return [
    { description: 'Doctor Consultation', quantity: 1, unitPrice: consultation, amount: consultation, subtotal: consultation },
    { description: reportTypes[index % reportTypes.length], quantity: 1, unitPrice: lab, amount: lab, subtotal: lab },
    { description: 'Pharmacy Dispensing', quantity: 1, unitPrice: pharmacy, amount: pharmacy, subtotal: pharmacy },
  ]
}

async function connect() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in hospital-api/.env')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  } catch (error) {
    if (!process.env.MONGO_URI_FALLBACK || !error.message.includes('querySrv ECONNREFUSED')) {
      throw error
    }

    await mongoose.connect(process.env.MONGO_URI_FALLBACK, { serverSelectionTimeoutMS: 5000 })
  }
}

async function upsertDoctors() {
  const saved = []
  for (const [id, name, department, qualification, experience, availability] of doctors) {
    const doctor = await Doctor.findOneAndUpdate(
      { id },
      {
        $set: {
          id,
          name,
          department,
          qualification,
          experience,
          availability,
          status: availability === 'On Leave' ? 'On Leave' : 'Active',
          email: `${name.toLowerCase().replace(/dr\. | /g, '.')}@meridianhealth.example`,
          phone: `+91-80${String(70000000 + saved.length * 13791).slice(0, 8)}`,
          rating: 4.3 + (saved.length % 5) * 0.1,
        },
      },
      { new: true, upsert: true, runValidators: true }
    )
    saved.push(doctor)
  }
  return saved
}

async function upsertMedicines() {
  let count = 0
  for (const [name, category, stockQuantity, unitPrice, supplier, expiryOffset] of medicines) {
    await Medicine.findOneAndUpdate(
      { name, supplier },
      {
        $set: {
          name,
          category,
          stockQuantity,
          unitPrice,
          supplier,
          manufacturer: supplier,
          expiryDate: futureDate(expiryOffset),
        },
      },
      { upsert: true, runValidators: true }
    )
    count += 1
  }
  return count
}

async function upsertPatients(savedDoctors) {
  const saved = []
  for (let index = 0; index < names.length; index += 1) {
    const [name, gender, age, disease] = names[index]
    const doctor = savedDoctors[index % savedDoctors.length]
    const patientId = `PT-ATLAS-${String(index + 1).padStart(3, '0')}`
    const admittedDate = isoDay(futureDate(index))
    const patient = await Patient.findOneAndUpdate(
      { id: patientId },
      {
        $set: {
          id: patientId,
          name,
          gender,
          age,
          email: `${name.toLowerCase().replace(/ /g, '.')}@patient.example`,
          phone: `+91-9${String(100000000 + index * 34567).slice(0, 9)}`,
          address: `${12 + index}, Meridian Avenue, Sector ${index % 9 + 1}`,
          bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'][index % 7],
          disease,
          doctorId: doctor.id,
          doctor: doctor.name,
          status: ['Stable', 'Admitted', 'Discharged', 'Critical'][index % 4],
          admitted: admittedDate,
          ward: `Ward ${String.fromCharCode(65 + (index % 5))}-${100 + index}`,
          medicalHistory: [
            { date: admittedDate, title: 'Initial Assessment', detail: disease, type: 'visit' },
            { date: isoDay(futureDate(index + 7)), title: 'Care Plan', detail: `Follow-up with ${doctor.department}`, type: 'note' },
          ],
        },
      },
      { new: true, upsert: true, runValidators: true }
    )
    saved.push(patient)
  }
  return saved
}

async function seedAppointments(patients, savedDoctors) {
  let count = 0
  for (let index = 0; index < patients.length; index += 1) {
    const patient = patients[index]
    const doctor = savedDoctors[index % savedDoctors.length]
    const appointmentDate = futureDate(index + 3)
    await Appointment.findOneAndUpdate(
      { id: `AP-ATLAS-${String(index + 1).padStart(3, '0')}` },
      {
        $set: {
          id: `AP-ATLAS-${String(index + 1).padStart(3, '0')}`,
          patientId: patient.id,
          patient: patient.name,
          doctor: doctor.name,
          doctorId: doctor.id,
          department: doctor.department,
          date: isoDay(appointmentDate),
          time: ['09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'][index % 5],
          priority: ['Routine', 'Follow-up', 'Emergency'][index % 3],
          status: ['Confirmed', 'Waiting', 'Pending', 'Completed'][index % 4],
        },
      },
      { upsert: true, runValidators: true }
    )
    count += 1
  }
  return count
}

async function seedReports(patients) {
  let count = 0
  for (let index = 0; index < patients.length; index += 1) {
    const patient = patients[index]
    const testName = reportTypes[index % reportTypes.length]
    await LabReport.findOneAndUpdate(
      { patientId: patient.id, testName, reportDate: futureDate(index + 1) },
      {
        $set: {
          patientId: patient.id,
          patient: patient._id,
          testName,
          result: index % 4 === 0 ? 'Review advised with treating doctor' : 'Values are within expected clinical range',
          remarks: `Future sample report for ${patient.name}. Image/PDF URL is stored in MongoDB.`,
          status: index % 5 === 0 ? 'pending' : 'completed',
          reportDate: futureDate(index + 1),
          fileUrl: `https://placehold.co/900x1200/png?text=${encodeURIComponent(`${testName} Report ${patient.id}`)}`,
          fileName: `${patient.id}-${testName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`,
        },
      },
      { upsert: true, runValidators: true }
    )
    count += 1
  }
  return count
}

async function seedBillsAndPayments(patients) {
  let billCount = 0
  let paymentCount = 0
  for (let index = 0; index < patients.length; index += 1) {
    const patient = patients[index]
    const items = currencyItems(index)
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
    const amountPaid = index % 4 === 0 ? 0 : index % 4 === 1 ? Math.round(totalAmount * 0.45) : totalAmount
    const method = ['cash', 'card', 'upi', 'insurance'][index % 4]
    const billNumber = `BILL-ATLAS-${String(index + 1).padStart(3, '0')}`

    const bill = await Bill.findOneAndUpdate(
      { billNumber },
      {
        $set: {
          billNumber,
          patientId: patient.id,
          patient: patient._id,
          patientName: patient.name,
          doctorName: patient.doctor,
          items,
          totalAmount,
          amountPaid,
          paymentMethod: method,
          gstEnabled: index % 2 === 0,
          gstRate: 18,
          discount: index % 3 === 0 ? 75 : 0,
          notes: 'Future Atlas demo bill',
        },
      },
      { new: true, upsert: true, runValidators: true }
    )
    billCount += 1

    if (amountPaid > 0) {
      const existingPayment = await Payment.findOne({ billId: bill._id, notes: `Atlas demo payment ${billNumber}` })
      if (!existingPayment) {
        await Payment.create({
          billId: bill._id,
          amount: amountPaid,
          method,
          paidAt: futureDate(index + 2),
          notes: `Atlas demo payment ${billNumber}`,
        })
        paymentCount += 1
      }
    }
  }
  return { billCount, paymentCount }
}

async function run() {
  await connect()
  const savedDoctors = await upsertDoctors()
  const medicineCount = await upsertMedicines()
  const patients = await upsertPatients(savedDoctors)
  const appointmentCount = await seedAppointments(patients, savedDoctors)
  const reportCount = await seedReports(patients)
  const { billCount, paymentCount } = await seedBillsAndPayments(patients)

  console.log('Atlas demo seed completed')
  console.log(`Doctors upserted: ${savedDoctors.length}`)
  console.log(`Patients upserted: ${patients.length}`)
  console.log(`Future appointments upserted: ${appointmentCount}`)
  console.log(`Lab reports upserted: ${reportCount}`)
  console.log(`Bills upserted: ${billCount}`)
  console.log(`Payments added if missing: ${paymentCount}`)
  console.log(`Medicines upserted: ${medicineCount}`)
}

run()
  .catch((error) => {
    console.error(`Atlas demo seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
