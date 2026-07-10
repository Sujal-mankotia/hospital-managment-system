import express from 'express'
import {
  createLabReport,
  deleteLabReport,
  getLabReportById,
  getLabReports,
  updateLabReport,
} from '../controllers/labReportController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin', 'doctor', 'receptionist'), createLabReport)
router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist'), getLabReports)
router.get('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), getLabReportById)
router.put('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), updateLabReport)
router.delete('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deleteLabReport)

export default router
