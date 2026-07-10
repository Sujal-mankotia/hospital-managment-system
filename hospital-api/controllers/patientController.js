import Patient from '../models/Patient.js'
import { sendControllerError } from '../utils/controllerErrors.js'

function getPatientFilter(id) {
    return /^[0-9a-fA-F]{24}$/.test(id) ? { $or: [{ _id: id }, { id }] } : { id }
}

export async function createPatient(req, res) {
    try {
        const { name, age, gender, email, phone, address, bloodGroup, disease, doctor, status, photo, ward, medicalHistory } = req.body

        if (!name) {
            return res.status(400).json({ message: 'Patient name is required' })
        }

        const existingPatient = email ? await Patient.findOne({ email }) : null
        if (existingPatient) {
            return res.status(409).json({ message: 'Patient already exists with this email' })
        }

        const patient = await Patient.create({ name, age, gender, email, phone, address, bloodGroup, disease, doctor, status, photo, ward, medicalHistory })
        res.status(201).json({ message: 'Patient created successfully', patient })
    } catch (error) {
        sendControllerError(res, error, 'Create patient failed')
    }
}

export async function getPatients(req, res) {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 })
        res.json({ items: patients })
    } catch (error) {
        sendControllerError(res, error, 'Get patients failed')
    }
}

export async function getPatientById(req, res) {
    try {
        const patient = await Patient.findOne(getPatientFilter(req.params.id))
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' })
        }
        res.json({ patient })
    } catch (error) {
        sendControllerError(res, error, 'Get patient failed')
    }
}

export async function updatePatient(req, res) {
    try {
        const patient = await Patient.findOne(getPatientFilter(req.params.id))
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' })
        }

        const updates = ['name', 'age', 'gender', 'email', 'phone', 'address', 'bloodGroup', 'disease', 'doctor', 'status', 'photo', 'ward', 'medicalHistory']
        updates.forEach((field) => {
            if (req.body[field] !== undefined) {
                patient[field] = req.body[field]
            }
        })

        await patient.save()
        res.json({ message: 'Patient updated successfully', patient })
    } catch (error) {
        sendControllerError(res, error, 'Update patient failed')
    }
}

export async function deletePatient(req, res) {
    try {
        const patient = await Patient.findOneAndDelete(getPatientFilter(req.params.id))
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' })
        }
        res.json({ message: 'Patient deleted successfully', patient })
    } catch (error) {
        sendControllerError(res, error, 'Delete patient failed')
    }
}
