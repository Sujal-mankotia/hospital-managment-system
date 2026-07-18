import express from 'express'
import { deleteReport, getReports } from '../controllers/reportsController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist'), getReports)
router.delete('/:id', protect, allowRoles('admin'), deleteReport)

export default router
