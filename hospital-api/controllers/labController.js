import LabReport, { LAB_REPORT_TYPES } from '../models/LabReport.js'
import Patient from '../models/Patient.js'
import { sendControllerError } from '../utils/controllerErrors.js'

export async function createLabReport(req, res) {
    try {
        const { patientId, testName, result, remarks, status, reportDate, fileUrl, fileName } = req.body

        if (!patientId || !testName) {
            return res.status(400).json({ message: 'patientId and testName are required' })
        }

        const patient = /^[0-9a-fA-F]{24}$/.test(patientId)
            ? await Patient.findById(patientId)
            : await Patient.findOne({ id: patientId })
        if (!patient) {
            return res.status(400).json({ message: 'Select a valid patient' })
        }

        if (!LAB_REPORT_TYPES.includes(testName)) {
            return res.status(400).json({ message: 'Select a valid report type' })
        }

        const labReport = await LabReport.create({
            patientId: patient.id,
            patient: patient._id,
            testName,
            result,
            remarks,
            status,
            reportDate,
            fileUrl,
            fileName,
        })

        res.status(201).json({
            message: 'Lab report created successfully',
            labReport,
        })
    } catch (error) {
        sendControllerError(res, error, 'Create lab report failed')
    }
}

export async function getLabReports(req, res) {
    try {
        const filter = {}
        const searchTerms = []

        if (req.query.patientId) {
            filter.patientId = req.query.patientId
        }

        if (req.query.status && ['pending', 'completed'].includes(req.query.status)) {
            filter.status = req.query.status
        }

        if (req.query.reportType) {
            filter.testName = { $regex: req.query.reportType, $options: 'i' }
        }

        if (req.query.patientName) {
            const patients = await Patient.find({
                name: { $regex: req.query.patientName, $options: 'i' },
            }).select('id')

            filter.patientId = { $in: patients.map((patient) => patient.id) }
        }

        if (req.query.search) {
            searchTerms.push({ testName: { $regex: req.query.search, $options: 'i' } })

            const patients = await Patient.find({
                name: { $regex: req.query.search, $options: 'i' },
            }).select('id')

            if (patients.length > 0) {
                searchTerms.push({ patientId: { $in: patients.map((patient) => patient.id) } })
            }
        }

        if (searchTerms.length > 0) {
            filter.$or = searchTerms
        }

        const labReports = await LabReport.find(filter)
            .populate('patient', 'name id age gender phone disease doctor medicalHistory')
            .sort({ reportDate: -1, createdAt: -1 })

        res.json({ labReports })
    } catch (error) {
        sendControllerError(res, error, 'Get lab reports failed')
    }
}

export async function getLabReportById(req, res) {
    try {
        const labReport = await LabReport.findById(req.params.id)

        if (!labReport) {
            return res.status(404).json({ message: 'Lab report not found' })
        }

        res.json({ labReport })
    } catch (error) {
        sendControllerError(res, error, 'Get lab report failed')
    }
}

export async function updateLabReport(req, res) {
    try {
        const labReport = await LabReport.findById(req.params.id)

        if (!labReport) {
            return res.status(404).json({ message: 'Lab report not found' })
        }

        if (req.body.testName !== undefined && !LAB_REPORT_TYPES.includes(req.body.testName)) {
            return res.status(400).json({ message: 'Select a valid report type' })
        }

        if (req.body.status !== undefined && !['pending', 'completed'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Select a valid status' })
        }

        const allowed = ['testName', 'result', 'remarks', 'status', 'reportDate', 'fileUrl', 'fileName']
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) {
                labReport[field] = req.body[field]
            }
        })

        await labReport.save()

        res.json({
            message: 'Lab report updated successfully',
            labReport,
        })
    } catch (error) {
        sendControllerError(res, error, 'Update lab report failed')
    }
}

export async function deleteLabReport(req, res) {
    try {
        const labReport = await LabReport.findByIdAndDelete(req.params.id)

        if (!labReport) {
            return res.status(404).json({ message: 'Lab report not found' })
        }

        res.json({ message: 'Lab report deleted successfully', labReport })
    } catch (error) {
        sendControllerError(res, error, 'Delete lab report failed')
    }
}
