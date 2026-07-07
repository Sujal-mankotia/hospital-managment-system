import express from 'express'
import PriorityQueue from '../dsa/PriorityQueue.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()
const emergencyQueue = new PriorityQueue()

router.post('/emergency', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  const { patientName, priority } = req.body

  if (!patientName || priority === undefined) {
    return res.status(400).json({ message: 'patientName and priority are required' })
  }

  emergencyQueue.enqueue({
    patientName,
    priority: Number(priority),
    addedAt: new Date(),
  })

  res.status(201).json({ queue: emergencyQueue.values() })
})

router.get('/emergency/next', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  res.json({ nextPatient: emergencyQueue.peek() || null })
})

export default router
