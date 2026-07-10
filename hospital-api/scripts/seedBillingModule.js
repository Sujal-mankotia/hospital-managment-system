import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Bill from '../models/Bill.js'
import Medicine from '../models/Medicine.js'
import LabReport from '../models/LabReport.js'
import Payment from '../models/Payment.js'

dotenv.config()

const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function recalculateBill(billId) {
  const payments = await Payment.find({ billId })
  const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const bill = await Bill.findById(billId)

  if (!bill) {
    throw new Error(`Bill not found for recalculation: ${billId}`)
  }

  bill.amountPaid = amountPaid

  if (amountPaid <= 0) {
    bill.status = 'pending'
  } else if (amountPaid >= bill.totalAmount) {
    bill.status = 'paid'
  } else {
    bill.status = 'partial'
  }

  await bill.save()
  return bill
}

async function run() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in hospital-api/.env')
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  } catch (error) {
    if (!process.env.MONGO_URI_FALLBACK || !error.message.includes('querySrv ECONNREFUSED')) {
      throw error
    }

    console.warn('MongoDB SRV connection failed, trying fallback direct URI...')
    await mongoose.connect(process.env.MONGO_URI_FALLBACK, { serverSelectionTimeoutMS: 5000 })
  }
  console.log('Connected to MongoDB')

  const patientCollection = mongoose.connection.collection('patients')
  const patients = await patientCollection.find({}, { projection: { _id: 1, name: 1, id: 1 } }).limit(2).toArray()

  if (patients.length < 2) {
    throw new Error('Need at least 2 existing patients in the database before seeding billing/lab data.')
  }

  const [patientOne, patientTwo] = patients

  const medicines = await Medicine.insertMany([
    {
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stockQuantity: 48,
      unitPrice: 25,
      expiryDate: daysFromNow(180),
      supplier: 'Apex MedSupply',
    },
    {
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stockQuantity: 7,
      unitPrice: 60,
      expiryDate: daysFromNow(20),
      supplier: 'CareNova Pharma',
    },
    {
      name: 'Vitamin D3',
      category: 'Supplements',
      stockQuantity: 5,
      unitPrice: 35,
      expiryDate: daysFromNow(90),
      supplier: 'WellLife Distributors',
    },
  ])

  const bills = await Bill.insertMany([
    {
      patientId: patientOne._id,
      items: [
        { description: 'Consultation', amount: 500 },
        { description: 'Blood Test', amount: 350 },
      ],
      totalAmount: 850,
      amountPaid: 0,
      status: 'pending',
    },
    {
      patientId: patientTwo._id,
      items: [
        { description: 'X-Ray', amount: 1200 },
        { description: 'Medicine Pack', amount: 300 },
      ],
      totalAmount: 1500,
      amountPaid: 0,
      status: 'pending',
    },
  ])

  const payments = await Payment.insertMany([
    {
      billId: bills[0]._id,
      amount: 850,
      method: 'card',
      notes: `Full payment for ${patientOne.name || patientOne.id || patientOne._id}`,
    },
    {
      billId: bills[1]._id,
      amount: 500,
      method: 'cash',
      notes: `Partial payment for ${patientTwo.name || patientTwo.id || patientTwo._id}`,
    },
  ])

  await recalculateBill(bills[0]._id)
  await recalculateBill(bills[1]._id)

  const labReports = await LabReport.insertMany([
    {
      patientId: patientOne._id,
      testName: 'CBC',
      result: 'Hemoglobin within normal range',
      status: 'completed',
      reportDate: daysFromNow(-1),
    },
    {
      patientId: patientTwo._id,
      testName: 'Lipid Profile',
      result: '',
      status: 'pending',
      reportDate: new Date(),
    },
    {
      patientId: patientOne._id,
      testName: 'Thyroid Panel',
      result: 'TSH mildly elevated',
      status: 'completed',
      reportDate: daysFromNow(-3),
    },
  ])

  console.log(`Seeded medicines: ${medicines.length}`)
  console.log(`Seeded bills: ${bills.length}`)
  console.log(`Seeded payments: ${payments.length}`)
  console.log(`Seeded lab reports: ${labReports.length}`)
  console.log('Billing/Pharmacy/Lab seed completed successfully')
}

run()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
