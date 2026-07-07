import mongoose from 'mongoose'

const MedicalEventSchema = new mongoose.Schema({
  date: String,
  title: String,
  detail: String,
  type: String,
})

const PatientSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  bloodGroup: String,
  phone: String,
  disease: String,
  doctor: String,
  status: String,
  photo: String,
  admitted: String,
  ward: String,
  medicalHistory: [MedicalEventSchema],
}, { timestamps: true })

export default mongoose.model('Patient', PatientSchema)
