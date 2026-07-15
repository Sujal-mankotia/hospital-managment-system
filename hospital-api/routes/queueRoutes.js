import express from 'express'
import PriorityQueue from '../dsa/PriorityQueue.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()
const emergencyQueue = new PriorityQueue()

// Seed with default emergency queue items
if (emergencyQueue.values().length === 0) {
  emergencyQueue.enqueue({
    id: 'EQ-01',
    patient: 'Vikram Nair',
    patientName: 'Vikram Nair',
    condition: 'Cardiac Arrhythmia',
    priority: 3,
    severity: 'Critical',
    arrivedAt: '09:52 AM',
    addedAt: new Date(Date.now() - 40 * 60 * 1000)
  })
  emergencyQueue.enqueue({
    id: 'EQ-02',
    patient: 'Unknown — Trauma Case',
    patientName: 'Unknown — Trauma Case',
    condition: 'Road Traffic Accident',
    priority: 3,
    severity: 'Critical',
    arrivedAt: '10:05 AM',
    addedAt: new Date(Date.now() - 27 * 60 * 1000)
  })
  emergencyQueue.enqueue({
    id: 'EQ-03',
    patient: 'Fatima Sheikh',
    patientName: 'Fatima Sheikh',
    condition: 'Stroke Symptoms',
    priority: 2,
    severity: 'High',
    arrivedAt: '10:12 AM',
    addedAt: new Date(Date.now() - 20 * 60 * 1000)
  })
}

// GET all items in the emergency queue
router.get('/emergency', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  res.json({ queue: emergencyQueue.values() })
})

// POST a new patient to the emergency queue
router.post('/emergency', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  const { patientName, priority, condition } = req.body

  if (!patientName || priority === undefined) {
    return res.status(400).json({ message: 'patientName and priority are required' })
  }

  const id = `EQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const now = new Date()
  const arrivedAt = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const priorityNum = Number(priority)
  const severityMap = { 3: 'Critical', 2: 'High', 1: 'Medium' }
  const severity = severityMap[priorityNum] || 'High'

  const newPatient = {
    id,
    patient: patientName,
    patientName,
    condition: condition || 'General Triage',
    priority: priorityNum,
    severity,
    arrivedAt,
    addedAt: now
  }

  emergencyQueue.enqueue(newPatient)

  res.status(201).json({ message: 'Patient added to emergency queue', queue: emergencyQueue.values() })
})

// DELETE a patient from the emergency queue by ID
router.delete('/emergency/:id', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  const { id } = req.params
  const removed = emergencyQueue.remove(id)
  if (!removed) {
    return res.status(404).json({ message: 'Patient not found in emergency queue' })
  }
  res.json({ message: 'Patient removed from emergency queue', queue: emergencyQueue.values() })
})

router.get('/emergency/next', protect, allowRoles('admin', 'doctor', 'receptionist'), (req, res) => {
  res.json({ nextPatient: emergencyQueue.peek() || null })
})

export default router
