import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import queueRoutes from './routes/queueRoutes.js'
import billingRoutes from './routes/billing.js'
import paymentRoutes from './routes/paymentRoutes.js'
import pharmacyRoutes from './routes/pharmacy.js'
import labReportRoutes from './routes/lab.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const CORS_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('CORS policy violation'))
  },
  credentials: true,
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hospital API is running' })
})

const dbConnected = await connectDB()

if (dbConnected) {
  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/patients', patientRoutes)
  app.use('/api/appointments', appointmentRoutes)
  app.use('/api/doctors', doctorRoutes)
  app.use('/api/queue', queueRoutes)
  app.use('/api/bills', billingRoutes)
  app.use('/api', paymentRoutes)
  app.use('/api/medicines', pharmacyRoutes)
  app.use('/api/lab-reports', labReportRoutes)
  app.use('/api/labreports', labReportRoutes)
} else {
  console.error('MongoDB unavailable. API routes were not mounted to prevent demo/mock data responses.')
}

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

globalThis.__hospitalApiServer = server
