import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import LabReport from '../models/LabReport.js'
import { sendControllerError } from '../utils/controllerErrors.js'

function patientSearchFilter(search) {
  if (!search?.trim()) return {}
  const q = search.trim()
  return {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { id: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ],
  }
}

function dateFilter(from, to) {
  const filter = {}
  if (from) filter.$gte = new Date(from)
  if (to) filter.$lte = new Date(to)
  return Object.keys(filter).length ? filter : null
}

export async function getReports(req, res) {
  try {
    const { search = '', reportType = '', from = '', to = '' } = req.query
    const patients = await Patient.find(patientSearchFilter(search))
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()

    const patientIds = patients.map((patient) => patient.id)
    const patientObjectIds = patients.map((patient) => patient._id)

    const labFilter = {
      $or: [{ patientId: { $in: patientIds } }, { patient: { $in: patientObjectIds } }],
    }
    if (reportType) labFilter.testName = { $regex: reportType, $options: 'i' }
    const reportDate = dateFilter(from, to)
    if (reportDate) labFilter.reportDate = reportDate

    const [appointments, labReports] = await Promise.all([
      Appointment.find({ patientId: { $in: patientIds } }).sort({ date: -1, time: -1 }).lean(),
      LabReport.find(labFilter).populate('patient', 'name id age gender phone disease doctor medicalHistory').sort({ reportDate: -1, createdAt: -1 }).lean(),
    ])

    const appointmentsByPatient = new Map()
    appointments.forEach((appointment) => {
      const rows = appointmentsByPatient.get(appointment.patientId) || []
      rows.push(appointment)
      appointmentsByPatient.set(appointment.patientId, rows)
    })

    const reportsByPatient = new Map()
    labReports.forEach((report) => {
      const patientKey = patientIds.includes(report.patientId) ? report.patientId : report.patient?.id
      if (!patientKey) return
      const rows = reportsByPatient.get(patientKey) || []
      rows.push(report)
      reportsByPatient.set(patientKey, rows)
    })

    const reports = patients.map((patient) => ({
      patient,
      medicalInformation: {
        diagnosis: patient.disease || '',
        prescribedMedicines: patient.medicalHistory?.filter((item) => item.type === 'medicine') || [],
        doctorNotes: patient.medicalHistory?.filter((item) => item.type === 'note') || [],
        visitHistory: patient.medicalHistory || [],
      },
      appointmentHistory: appointmentsByPatient.get(patient.id) || [],
      labReports: reportsByPatient.get(patient.id) || [],
    }))

    res.json({ reports, labReports })
  } catch (error) {
    sendControllerError(res, error, 'Get patient reports failed')
  }
}

export async function deleteReport(req, res) {
  try {
    const report = await LabReport.findByIdAndDelete(req.params.id)

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    res.json({ message: 'Report deleted successfully' })
  } catch (error) {
    sendControllerError(res, error, 'Delete report failed')
  }
}
