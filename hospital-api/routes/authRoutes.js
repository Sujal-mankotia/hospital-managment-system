import express from 'express'
import {
  forgotPassword,
  getMe,
  login,
  resetPassword,
  signup,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)

router.get('/me', protect, getMe)
router.get('/admin-only', protect, allowRoles('admin'), (req, res) => {
  res.json({ message: 'Only admins can see this route' })
})

export default router
