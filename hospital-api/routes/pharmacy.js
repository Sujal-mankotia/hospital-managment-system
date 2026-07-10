import express from 'express'
import {
    createMedicine,
    deductMedicine,
    deleteMedicine,
    getMedicines,
    updateMedicine,
} from '../controllers/pharmacyController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin', 'doctor', 'receptionist'), createMedicine)
router.get('/', protect, allowRoles('admin', 'doctor', 'receptionist'), getMedicines)
router.put('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), updateMedicine)
router.delete('/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), deleteMedicine)
router.put('/:id/deduct', protect, allowRoles('admin', 'doctor', 'receptionist'), deductMedicine)

export default router
