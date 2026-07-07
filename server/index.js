import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import patientsRouter from './routes/patients.js'
import appointmentsRouter from './routes/appointments.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err))

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')))
app.use('/api/patients', patientsRouter)
app.use('/api/appointments', appointmentsRouter)

app.get('/', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
