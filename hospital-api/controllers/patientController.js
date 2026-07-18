import Patient from '../models/Patient.js'
import { sendControllerError } from '../utils/controllerErrors.js'
import { findDoctorByReference, getDoctorReferencePayload, normalizeReferenceValue } from '../utils/doctorReference.js'

function getPatientFilter(id) {
    return /^[0-9a-fA-F]{24}$/.test(id) ? { $or: [{ _id: id }, { id }] } : { id }
}

async function applyDoctorSelection(target, body) {
    if (body.doctorId === undefined && body.doctor === undefined) {
        return
    }

    const doctorValue = normalizeReferenceValue(body.doctorId || body.doctor)
    if (!doctorValue) {
        target.doctorId = ''
        target.doctor = ''
        return
    }

    const doctor = await findDoctorByReference(doctorValue)
    if (!doctor) {
        const error = new Error('Select a valid doctor')
        error.statusCode = 400
        throw error
    }

    Object.assign(target, getDoctorReferencePayload(doctor))
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

        const patientData = { name, age, gender, email, phone, address, bloodGroup, disease, status, photo, ward, medicalHistory }
        await applyDoctorSelection(patientData, req.body)

        const patient = await Patient.create({
            ...patientData,
            doctor: patientData.doctor || doctor || '',
            doctorId: patientData.doctorId || '',
        })
        res.status(201).json({ message: 'Patient created successfully', patient })
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message })
        }
        sendControllerError(res, error, 'Create patient failed')
    }
}

export async function getPatients(req, res) {
    try {
        const filter = {}
        if (req.query.search?.trim()) {
            const q = req.query.search.trim()
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { id: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
            ]
        }
        const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 1000))
        const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(limit)
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

        const updates = ['name', 'age', 'gender', 'email', 'phone', 'address', 'bloodGroup', 'disease', 'status', 'photo', 'ward', 'medicalHistory']
        updates.forEach((field) => {
            if (req.body[field] !== undefined) {
                patient[field] = req.body[field]
            }
        })

        await applyDoctorSelection(patient, req.body)

        await patient.save()
        res.json({ message: 'Patient updated successfully', patient })
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message })
        }
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
