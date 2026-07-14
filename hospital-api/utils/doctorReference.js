import Doctor from '../models/Doctor.js'

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/

function buildDoctorQuery(identifier) {
  if (!identifier) {
    return null
  }

  if (OBJECT_ID_PATTERN.test(identifier)) {
    return { $or: [{ _id: identifier }, { id: identifier }] }
  }

  return { $or: [{ id: identifier }, { name: identifier }] }
}

export async function findDoctorByReference(identifier) {
  const query = buildDoctorQuery(identifier)
  if (!query) {
    return null
  }

  return Doctor.findOne(query)
}

export function getDoctorReferencePayload(doctor) {
  if (!doctor) {
    return {
      doctorId: '',
      doctor: '',
      department: '',
    }
  }

  return {
    doctorId: doctor.id,
    doctor: doctor.name,
    department: doctor.department,
  }
}

export function normalizeReferenceValue(value) {
  if (value === undefined || value === null) {
    return ''
  }

  return String(value).trim()
}
