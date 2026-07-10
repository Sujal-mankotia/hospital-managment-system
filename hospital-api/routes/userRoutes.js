import express from 'express'
import { createUserByAdmin } from '../controllers/authController.js'
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/', protect, allowRoles('admin'), createUserByAdmin)
router.get('/', protect, allowRoles('admin'), getUsers)
router.get('/:id', protect, allowRoles('admin'), getUserById)
router.put('/:id', protect, allowRoles('admin'), updateUser)
router.delete('/:id', protect, allowRoles('admin'), deleteUser)

export default router
