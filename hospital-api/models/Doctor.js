import mongoose from 'mongoose'

const doctorScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },
    slots: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
)

const defaultSchedule = [
  { day: 'Mon', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Tue', slots: ['09:00-12:00'] },
  { day: 'Wed', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Thu', slots: ['Off'] },
  { day: 'Fri', slots: ['09:00-12:00', '16:00-19:00'] },
  { day: 'Sat', slots: ['09:00-13:00'] },
  { day: 'Sun', slots: ['Off'] },
]

const doctorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      default: '',
      trim: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    availability: {
      type: String,
      enum: ['Available', 'In Surgery', 'On Leave'],
      default: 'Available',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    photo: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    patients: {
      type: Number,
      default: 0,
      min: 0,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    schedule: {
      type: [doctorScheduleSchema],
      default: () => defaultSchedule,
    },
  },
  { timestamps: true }
)

doctorSchema.pre('validate', function assignDoctorId(next) {
  if (!this.id) {
    this.id = `DR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }
  next()
})

const Doctor = mongoose.model('Doctor', doctorSchema)

export default Doctor
