import express from 'express'
import { createUserByAdmin } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin'), createUserByAdmin)

export default router
