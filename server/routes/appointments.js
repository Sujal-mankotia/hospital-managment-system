import express from 'express'
import Appointment from '../models/Appointment.js'
import Patient from '../models/Patient.js'

const router = express.Router()

const createAppointmentId = () => `AP-${Math.floor(88000 + Math.random() * 10000)}`

router.get('/', async (req, res) => {
  const { q = '', status = '', doctor = '', date = '', page = 1, limit = 100 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (doctor) filter.doctor = doctor
  if (date) filter.date = date
  if (q) {
    filter.$or = [
      { patient: new RegExp(q, 'i') },
      { patientId: new RegExp(q, 'i') },
      { id: new RegExp(q, 'i') },
    ]
  }

  try {
    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    const count = await Appointment.countDocuments(filter)
    res.json({ items: appointments, total: count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id })
    if (!appointment) return res.status(404).json({ error: 'Not found' })
    res.json(appointment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body
    const patient = await Patient.findOne({ id: body.patientId })
    if (!patient) return res.status(400).json({ error: 'Select a valid patient' })

    const appointment = new Appointment({
      id: createAppointmentId(),
      patientId: patient.id,
      patient: patient.name,
      doctor: body.doctor,
      department: body.department,
      date: body.date,
      time: body.time,
      priority: body.priority || 'Routine',
      status: body.status || 'Confirmed',
    })

    await appointment.save()
    res.status(201).json(appointment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const body = req.body
    const update = { ...body }
    delete update.id
    delete update._id

    if (body.patientId) {
      const patient = await Patient.findOne({ id: body.patientId })
      if (!patient) return res.status(400).json({ error: 'Select a valid patient' })
      update.patientId = patient.id
      update.patient = patient.name
    }

    const appointment = await Appointment.findOneAndUpdate({ id: req.params.id }, update, { new: true })
    if (!appointment) return res.status(404).json({ error: 'Not found' })
    res.json(appointment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ id: req.params.id })
    if (!appointment) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true, appointment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
