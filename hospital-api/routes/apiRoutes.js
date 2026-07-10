import express from 'express'
import billRoutes from './billRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import medicineRoutes from './medicineRoutes.js'
import labReportRoutes from './labReportRoutes.js'

const router = express.Router()

router.use('/bills', billRoutes)
router.use('/', paymentRoutes)
router.use('/medicines', medicineRoutes)
router.use('/lab-reports', labReportRoutes)

export default router
