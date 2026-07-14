import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    patient: {
      type: String,
      required: true,
      trim: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    doctorId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Routine', 'Follow-up', 'Emergency'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: ['Confirmed', 'In Progress', 'Waiting', 'Completed', 'Pending', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
)

appointmentSchema.pre('validate', function assignAppointmentId(next) {
  if (!this.id) {
    this.id = `AP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  next()
})

export default mongoose.model('Appointment', appointmentSchema)
