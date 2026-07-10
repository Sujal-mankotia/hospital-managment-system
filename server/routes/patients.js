import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import Patient from '../models/Patient.js'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'
const uploadPath = path.join(__dirname, '..', UPLOAD_DIR)
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// List with basic search + pagination
router.get('/', async (req, res) => {
  const { q = '', status = '', page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (q) filter.$or = [ { name: new RegExp(q, 'i') }, { id: new RegExp(q, 'i') } ]
  try {
    const patients = await Patient.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    const count = await Patient.countDocuments(filter)
    res.json({ items: patients, total: count })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const p = await Patient.findOne({ id: req.params.id })
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json(p)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body
    const nextId = `PT-${Math.floor(20000 + Math.random() * 10000)}`
    const patient = new Patient({
      id: nextId,
      name: body.name,
      age: Number(body.age) || 0,
      gender: body.gender,
      bloodGroup: body.bloodGroup,
      phone: body.phone,
      disease: body.disease,
      doctor: body.doctor,
      status: body.status || 'Admitted',
      photo: req.file ? `/uploads/${req.file.filename}` : body.photo || '',
      admitted: body.admitted || new Date().toISOString().slice(0,10),
      ward: body.ward || '',
    })
    await patient.save()
    res.json(patient)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body
    const update = { ...body }
    if (req.file) update.photo = `/uploads/${req.file.filename}`
    const p = await Patient.findOneAndUpdate({ id: req.params.id }, update, { new: true })
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json(p)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const p = await Patient.findOneAndDelete({ id: req.params.id })
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true, patient: p })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
