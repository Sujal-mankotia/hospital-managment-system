import express from 'express'
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctorSlots,
  getDoctors,
  updateDoctor,
} from '../controllers/doctorController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getDoctors)
router.get('/:id/slots', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getDoctorSlots)
router.get('/:id', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getDoctorById)
router.post('/', protect, allowRoles('admin', 'receptionist'), createDoctor)
router.put('/:id', protect, allowRoles('admin', 'receptionist'), updateDoctor)
router.delete('/:id', protect, allowRoles('admin', 'receptionist'), deleteDoctor)

export default router
