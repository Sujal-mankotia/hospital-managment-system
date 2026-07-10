import mongoose from 'mongoose'

const medicalHistorySchema = new mongoose.Schema(
    {
        date: String,
        title: String,
        detail: String,
        type: String,
    },
    { _id: false }
)

const patientSchema = new mongoose.Schema(
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
        age: {
            type: Number,
            min: 0,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
            default: 'Other',
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            sparse: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        bloodGroup: {
            type: String,
            trim: true,
        },
        disease: {
            type: String,
            trim: true,
            default: '',
        },
        doctor: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['Admitted', 'Critical', 'Stable', 'Discharged'],
            default: 'Admitted',
        },
        photo: {
            type: String,
            default: '',
        },
        admitted: {
            type: String,
            default: () => new Date().toISOString().slice(0, 10),
        },
        ward: {
            type: String,
            default: '',
            trim: true,
        },
        medicalHistory: [medicalHistorySchema],
    },
    { timestamps: true }
)

patientSchema.pre('validate', function assignPatientId(next) {
    if (!this.id) {
        this.id = `PT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
    next()
})

export default mongoose.model('Patient', patientSchema)
