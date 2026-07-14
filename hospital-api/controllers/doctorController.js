import Doctor from '../models/Doctor.js'
import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import { sendControllerError } from '../utils/controllerErrors.js'
import { findDoctorByReference, getDoctorReferencePayload, normalizeReferenceValue } from '../utils/doctorReference.js'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatMinutes(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function expandSlotRanges(schedule = []) {
  return schedule.flatMap((entry) => {
    if (!entry?.slots || entry.slots.length === 0) {
      return []
    }

    return entry.slots.flatMap((slot) => {
      if (!slot || slot.toLowerCase() === 'off' || !slot.includes('-')) {
        return []
      }

      const [start, end] = slot.split('-')
      const [startHours, startMinutes] = start.split(':').map(Number)
      const [endHours, endMinutes] = end.split(':').map(Number)
      const startTotal = startHours * 60 + startMinutes
      const endTotal = endHours * 60 + endMinutes
      const values = []

      for (let current = startTotal; current < endTotal; current += 30) {
        values.push(formatMinutes(current))
      }

      return values
    })
  })
}

async function getPatientCounts() {
  const patients = await Patient.find({}, { doctorId: 1, doctor: 1 }).lean()
  const counts = new Map()

  patients.forEach((patient) => {
    const key = patient.doctorId ? String(patient.doctorId) : normalizeReferenceValue(patient.doctor)
    if (!key) {
      return
    }

    counts.set(key, (counts.get(key) || 0) + 1)
  })

  return counts
}

function serializeDoctor(doctor, patientCounts) {
  const patientCount = patientCounts?.get(doctor.id) ?? patientCounts?.get(doctor.name) ?? doctor.patients ?? 0

  return {
    id: doctor.id,
    name: doctor.name,
    department: doctor.department,
    qualification: doctor.qualification,
    experience: doctor.experience,
    availability: doctor.availability,
    status: doctor.status,
    photo: doctor.photo,
    rating: doctor.rating,
    phone: doctor.phone,
    email: doctor.email,
    patients: patientCount,
    schedule: doctor.schedule,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  }
}

function doctorLookupFilter(id) {
  const cleanId = normalizeReferenceValue(id)
  if (!cleanId) {
    return null
  }

  if (/^[0-9a-fA-F]{24}$/.test(cleanId)) {
    return { $or: [{ _id: cleanId }, { id: cleanId }] }
  }

  return { $or: [{ id: cleanId }, { name: cleanId }] }
}

async function loadDoctorOr404(id, res) {
  const filter = doctorLookupFilter(id)
  if (!filter) {
    res.status(404).json({ message: 'Doctor not found' })
    return null
  }

  const doctor = await Doctor.findOne(filter)
  if (!doctor) {
    res.status(404).json({ message: 'Doctor not found' })
    return null
  }

  return doctor
}

async function syncDoctorAssignments(doctor, previousName) {
  const doctorPayload = getDoctorReferencePayload(doctor)

  await Patient.updateMany(
    { $or: [{ doctorId: doctorPayload.doctorId }, { doctor: previousName }] },
    { $set: { doctorId: doctorPayload.doctorId, doctor: doctorPayload.doctor } }
  )

  await Appointment.updateMany(
    { $or: [{ doctorId: doctorPayload.doctorId }, { doctor: previousName }] },
    { $set: { doctorId: doctorPayload.doctorId, doctor: doctorPayload.doctor, department: doctor.department } }
  )
}

async function resolveDoctorPayload(body, { requireSelection = false } = {}) {
  const doctorValue = normalizeReferenceValue(body.doctorId || body.doctor)

  if (!doctorValue) {
    if (requireSelection) {
      throw new Error('Select a valid doctor')
    }

    return null
  }

  const doctor = await findDoctorByReference(doctorValue)
  if (!doctor) {
    throw new Error('Select a valid doctor')
  }

  return getDoctorReferencePayload(doctor)
}

export async function getDoctors(req, res) {
  try {
    const patientCounts = await getPatientCounts()
    const doctors = await Doctor.find().sort({ createdAt: -1 })

    res.json({
      items: doctors.map((doctor) => serializeDoctor(doctor, patientCounts)),
      total: doctors.length,
    })
  } catch (error) {
    sendControllerError(res, error, 'Get doctors failed')
  }
}

export async function getDoctorById(req, res) {
  try {
    const doctor = await loadDoctorOr404(req.params.id, res)
    if (!doctor) {
      return
    }

    const patientCounts = await getPatientCounts()
    res.json({ doctor: serializeDoctor(doctor, patientCounts) })
  } catch (error) {
    sendControllerError(res, error, 'Get doctor failed')
  }
}

export async function createDoctor(req, res) {
  try {
    const payload = {
      name: req.body.name,
      department: req.body.department,
      qualification: req.body.qualification,
      experience: req.body.experience,
      availability: req.body.availability,
      status: req.body.status,
      photo: req.body.photo,
      rating: req.body.rating,
      phone: req.body.phone,
      email: req.body.email,
      schedule: req.body.schedule,
    }

    if (!payload.name || !payload.department) {
      return res.status(400).json({ message: 'Doctor name and department are required' })
    }

    const doctor = await Doctor.create(payload)
    const patientCounts = await getPatientCounts()
    res.status(201).json({ message: 'Doctor created successfully', doctor: serializeDoctor(doctor, patientCounts) })
  } catch (error) {
    sendControllerError(res, error, 'Create doctor failed')
  }
}

export async function updateDoctor(req, res) {
  try {
    const doctor = await loadDoctorOr404(req.params.id, res)
    if (!doctor) {
      return
    }

    const previousName = doctor.name
    const previousDepartment = doctor.department
    const editableFields = ['name', 'department', 'qualification', 'experience', 'availability', 'status', 'photo', 'rating', 'phone', 'email', 'schedule']
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field]
      }
    })

    await doctor.save()

    if (doctor.name !== previousName || doctor.department !== previousDepartment) {
      await syncDoctorAssignments(doctor, previousName)
    }

    const patientCounts = await getPatientCounts()
    res.json({ message: 'Doctor updated successfully', doctor: serializeDoctor(doctor, patientCounts) })
  } catch (error) {
    sendControllerError(res, error, 'Update doctor failed')
  }
}

export async function deleteDoctor(req, res) {
  try {
    const doctor = await loadDoctorOr404(req.params.id, res)
    if (!doctor) {
      return
    }

    await Patient.updateMany(
      { $or: [{ doctorId: doctor.id }, { doctor: doctor.name }] },
      { $set: { doctorId: '', doctor: 'Unassigned' } }
    )

    await Appointment.updateMany(
      { $or: [{ doctorId: doctor.id }, { doctor: doctor.name }] },
      { $set: { doctorId: '', doctor: 'Unassigned' } }
    )

    await Doctor.deleteOne({ _id: doctor._id })
    res.json({ message: 'Doctor deleted successfully', doctor: serializeDoctor(doctor) })
  } catch (error) {
    sendControllerError(res, error, 'Delete doctor failed')
  }
}

export async function getDoctorSlots(req, res) {
  try {
    const doctor = await loadDoctorOr404(req.params.id, res)
    if (!doctor) {
      return
    }

    const date = normalizeReferenceValue(req.query.date)
    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required' })
    }

    const dateValue = new Date(`${date}T00:00:00Z`)
    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({ message: 'Invalid date' })
    }

    const day = WEEKDAY_LABELS[dateValue.getUTCDay()]
    const scheduleEntry = doctor.schedule.find((entry) => entry.day === day)
    if (!scheduleEntry || scheduleEntry.slots.some((slot) => slot.toLowerCase() === 'off')) {
      return res.json({ slots: [] })
    }

    const occupiedAppointments = await Appointment.find(
      { $or: [{ doctorId: doctor.id }, { doctor: doctor.name }], date },
      { time: 1 }
    ).lean()

    const occupiedTimes = new Set(occupiedAppointments.map((appointment) => normalizeReferenceValue(appointment.time)))
    const slots = expandSlotRanges(scheduleEntry.slots).map((time) => ({
      time,
      available: !occupiedTimes.has(time),
    }))

    res.json({ doctor: serializeDoctor(doctor), slots })
  } catch (error) {
    sendControllerError(res, error, 'Get doctor slots failed')
  }
}

export async function resolveDoctorSelection(body, options = {}) {
  return resolveDoctorPayload(body, options)
}
