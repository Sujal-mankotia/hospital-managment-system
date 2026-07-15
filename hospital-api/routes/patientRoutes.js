import express from 'express'
import {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
} from '../controllers/patientController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin', 'doctor', 'receptionist'), createPatient)
router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getPatients)
router.get('/:id', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getPatientById)
router.put('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), updatePatient)
router.delete('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deletePatient)

export default router
