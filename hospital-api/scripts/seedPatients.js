import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Patient from '../models/Patient.js'
import Bill from '../models/Bill.js'
import Payment from '../models/Payment.js'
import Medicine from '../models/Medicine.js'
import LabReport from '../models/LabReport.js'

dotenv.config()

const PATIENTS = [
    {
        name: 'Divya Reddy',
        age: 28,
        gender: 'female',
        email: 'divya.reddy@example.com',
        phone: '+91-9876543210',
        address: '12 Jubilee Hills, Hyderabad',
        bloodGroup: 'B+',
    },
    {
        name: 'Amitabh Joshi',
        age: 45,
        gender: 'male',
        email: 'amitabh.joshi@example.com',
        phone: '+91-9123456780',
        address: '7 MG Road, Bangalore',
        bloodGroup: 'O+',
    },
    {
        name: 'Neelam Bhatt',
        age: 32,
        gender: 'female',
        email: 'neelam.bhatt@example.com',
        phone: '+91-9988776655',
        address: '5 Model Town, Delhi',
        bloodGroup: 'A-',
    },
]

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
    if (bill.status !== 'cancelled') {
        if (amountPaid <= 0) {
            bill.status = 'pending'
        } else if (amountPaid >= bill.totalAmount) {
            bill.status = 'paid'
        } else {
            bill.status = 'partial'
        }
    }
    await bill.save()
    return bill
}

async function run() {
    await connectDB()

    const insertedPatients = []
    for (const patientData of PATIENTS) {
        const existing = await Patient.findOne({ email: patientData.email })
        if (existing) {
            insertedPatients.push(existing)
            continue
        }
        const patient = await Patient.create(patientData)
        insertedPatients.push(patient)
    }

    const bills = await Bill.insertMany([
        {
            patientId: insertedPatients[0]._id,
            items: [
                { description: 'General Consultation', amount: 450 },
                { description: 'CBC Test', amount: 320 },
            ],
            totalAmount: 770,
            amountPaid: 770,
            status: 'paid',
        },
        {
            patientId: insertedPatients[1]._id,
            items: [
                { description: 'Pulmonology Consultation', amount: 650 },
                { description: 'Chest X-Ray', amount: 700 },
            ],
            totalAmount: 1350,
            amountPaid: 500,
            status: 'partial',
        },
        {
            patientId: insertedPatients[2]._id,
            items: [
                { description: 'Dermatology Consultation', amount: 350 },
                { description: 'Skin Allergy Panel', amount: 280 },
            ],
            totalAmount: 630,
            amountPaid: 0,
            status: 'pending',
        },
    ])

    await Payment.insertMany([
        {
            billId: bills[0]._id,
            amount: 770,
            method: 'card',
            notes: 'Full payment received',
        },
        {
            billId: bills[1]._id,
            amount: 500,
            method: 'cash',
            notes: 'Partial payment received',
        },
    ])

    await recalculateBill(bills[0]._id)
    await recalculateBill(bills[1]._id)
    await recalculateBill(bills[2]._id)

    await Medicine.insertMany([
        {
            name: 'Paracetamol 500mg',
            category: 'Pain Relief',
            stockQuantity: 120,
            unitPrice: 25,
            expiryDate: daysFromNow(180),
            supplier: 'Apex MedSupply',
        },
        {
            name: 'Amoxicillin 250mg',
            category: 'Antibiotic',
            stockQuantity: 42,
            unitPrice: 55,
            expiryDate: daysFromNow(80),
            supplier: 'CareNova Pharma',
        },
        {
            name: 'Vitamin D3 1000IU',
            category: 'Supplements',
            stockQuantity: 68,
            unitPrice: 45,
            expiryDate: daysFromNow(210),
            supplier: 'WellLife Distributors',
        },
    ])

    await LabReport.insertMany([
        {
            patientId: insertedPatients[0]._id,
            testName: 'Complete Blood Count',
            result: 'Normal hemoglobin and WBC counts',
            status: 'completed',
            reportDate: daysFromNow(-1),
        },
        {
            patientId: insertedPatients[1]._id,
            testName: 'Chest X-Ray',
            result: 'Mild bronchitis observed',
            status: 'completed',
            reportDate: daysFromNow(-2),
        },
        {
            patientId: insertedPatients[2]._id,
            testName: 'Skin Allergy Panel',
            result: '',
            status: 'pending',
            reportDate: new Date(),
        },
    ])

    console.log(`Seeded ${insertedPatients.length} patients, ${bills.length} bills, payments, medicines, and lab reports.`)
}

run()
    .catch((error) => {
        console.error(`Seed failed: ${error.message}`)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.connection.close()
    })
