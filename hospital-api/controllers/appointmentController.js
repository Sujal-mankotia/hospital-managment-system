import Appointment from '../models/Appointment.js'
import Patient from '../models/Patient.js'
import { sendControllerError } from '../utils/controllerErrors.js'
import { findDoctorByReference, getDoctorReferencePayload, normalizeReferenceValue } from '../utils/doctorReference.js'

function buildFilter(query) {
  const { q = '', status = '', doctor = '', date = '' } = query
  const filter = {}

  if (status) filter.status = status
  if (doctor) filter.doctor = doctor
  if (date) filter.date = date
  if (q) {
    filter.$or = [
      { patient: new RegExp(q, 'i') },
      { patientId: new RegExp(q, 'i') },
      { id: new RegExp(q, 'i') },
    ]
  }

  return filter
}

async function findPatient(patientId) {
  const filters = [{ id: patientId }]
  if (/^[0-9a-fA-F]{24}$/.test(patientId)) {
    filters.push({ _id: patientId })
  }
  return Patient.findOne({ $or: filters })
}

async function applyDoctorSelection(target, body) {
  if (body.doctorId === undefined && body.doctor === undefined) {
    return null
  }

  const doctorValue = normalizeReferenceValue(body.doctorId || body.doctor)
  if (!doctorValue) {
    const error = new Error('doctorId is required')
    error.statusCode = 400
    throw error
  }

  const doctor = await findDoctorByReference(doctorValue)
  if (!doctor) {
    const error = new Error('Select a valid doctor')
    error.statusCode = 400
    throw error
  }

  Object.assign(target, getDoctorReferencePayload(doctor))
  return doctor
}

export async function createAppointment(req, res) {
  try {
    const { patientId, doctor, department, date, time, priority, status } = req.body

    if (!patientId || (!doctor && !req.body.doctorId) || !date || !time) {
      return res.status(400).json({ message: 'patientId, doctor, date and time are required' })
    }

    const patient = await findPatient(patientId)
    if (!patient) {
      return res.status(400).json({ message: 'Select a valid patient' })
    }

    const appointmentData = {
      patientId: patient.id,
      patient: patient.name,
      date,
      time,
      priority,
      status,
    }

    const doctorRecord = await applyDoctorSelection(appointmentData, req.body)

    const appointment = await Appointment.create({
      ...appointmentData,
      doctor: appointmentData.doctor || doctor || '',
      doctorId: appointmentData.doctorId || '',
      department: appointmentData.department || department || doctorRecord?.department || '',
    })

    return res.status(201).json(appointment)
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }
    return sendControllerError(res, error, 'Create appointment failed')
  }
}

export async function getAppointments(req, res) {
  try {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 100)
    const filter = buildFilter(req.query)
    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    const total = await Appointment.countDocuments(filter)

    return res.json({ items: appointments, total })
  } catch (error) {
    return sendControllerError(res, error, 'Get appointments failed')
  }
}

export async function getAppointmentById(req, res) {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id })
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }
    return res.json(appointment)
  } catch (error) {
    return sendControllerError(res, error, 'Get appointment failed')
  }
}

export async function updateAppointment(req, res) {
  try {
    const update = { ...req.body }
    delete update.id
    delete update._id

    if (update.patientId) {
      const patient = await findPatient(update.patientId)
      if (!patient) {
        return res.status(400).json({ message: 'Select a valid patient' })
      }
      update.patientId = patient.id
      update.patient = patient.name
    }

    if (update.doctorId !== undefined || update.doctor !== undefined) {
      const doctorPayload = {}
      await applyDoctorSelection(doctorPayload, update)
      Object.assign(update, doctorPayload)
      update.department = doctorPayload.department || update.department
    }

    const appointment = await Appointment.findOneAndUpdate(
      { id: req.params.id },
      update,
      { new: true, runValidators: true }
    )

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    return res.json(appointment)
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }
    return sendControllerError(res, error, 'Update appointment failed')
  }
}

export async function deleteAppointment(req, res) {
  try {
    const appointment = await Appointment.findOneAndDelete({ id: req.params.id })
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }
    return res.json({ message: 'Appointment deleted successfully', appointment })
  } catch (error) {
    return sendControllerError(res, error, 'Delete appointment failed')
  }
}
