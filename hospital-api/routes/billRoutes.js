import express from 'express'
import { createBill, deleteBill, getBillById, getBills } from '../controllers/billController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin', 'doctor', 'receptionist'), createBill)
router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist'), getBills)
router.get('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), getBillById)
router.delete('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deleteBill)

export default router
