import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import patientsRouter from './routes/patients.js'
import appointmentsRouter from './routes/appointments.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
dotenv.config({ path: path.join(__dirname, '..', 'hospital-api', '.env') })

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing. Set it in server/.env or hospital-api/.env')
  process.exit(1)
}

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('MongoDB connected')
  } catch (err) {
    if (!process.env.MONGO_URI_FALLBACK || !err.message.includes('querySrv ECONNREFUSED')) {
      throw err
    }
    console.warn('MongoDB SRV connection failed, trying fallback direct URI...')
    await mongoose.connect(process.env.MONGO_URI_FALLBACK, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('MongoDB connected with fallback URI')
  }
}

connectMongo().catch((err) => {
  console.error('MongoDB connection error:', err)
  process.exit(1)
})

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')))
app.use('/api/patients', patientsRouter)
app.use('/api/appointments', appointmentsRouter)

app.get('/', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
