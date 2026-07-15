import express from 'express'
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointment,
} from '../controllers/appointmentController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin', 'doctor', 'receptionist'), createAppointment)
router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getAppointments)
router.get('/:id', protect, allowRoles('admin', 'doctor', 'receptionist', 'patient'), getAppointmentById)
router.put('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), updateAppointment)
router.delete('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deleteAppointment)

export default router
