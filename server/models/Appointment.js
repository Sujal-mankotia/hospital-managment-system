import mongoose from 'mongoose'

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  patientId: { type: String, required: true, index: true },
  patient: { type: String, required: true },
  doctor: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  priority: { type: String, default: 'Routine' },
  status: { type: String, default: 'Confirmed' },
}, { timestamps: true })

export default mongoose.model('Appointment', AppointmentSchema)
