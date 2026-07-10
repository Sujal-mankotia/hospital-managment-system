import express from 'express'
import {
    createPayment,
    getPayments,
    getPaymentsForBill,
    deletePayment,
} from '../controllers/paymentsController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/bills/:billId/payments', protect, allowRoles('admin', 'doctor', 'receptionist'), createPayment)
router.get('/bills/:billId/payments', protect, allowRoles('admin', 'doctor', 'receptionist'), getPaymentsForBill)
router.get('/payments', protect, allowRoles('admin', 'doctor', 'receptionist'), getPayments)
router.delete('/payments/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deletePayment)

export default router
