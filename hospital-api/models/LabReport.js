import mongoose from 'mongoose'

export const LAB_REPORT_TYPES = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'HbA1c',
  'Blood Sugar (Fasting)',
  'Blood Sugar (PP)',
  'Vitamin D',
  'Vitamin B12',
  'Thyroid Profile (TSH, T3, T4)',
  'Urine Routine',
  'Urine Culture',
  'Electrolytes',
  'Calcium',
  'Iron Profile',
  'Ferritin',
  'ESR',
  'CRP',
  'Dengue NS1',
  'Malaria Test',
  'COVID-19 RT-PCR',
  'HIV Screening',
  'HBsAg',
  'HCV',
  'Pregnancy Test',
  'Chest X-Ray',
  'ECG',
]

const labReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true,
    },
    testName: {
      type: String,
      required: true,
      enum: LAB_REPORT_TYPES,
      trim: true,
    },
    result: {
      type: String,
      default: '',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

labReportSchema.pre('save', function setCompletionTimestamp(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date()
    }

    if (this.status === 'pending') {
      this.completedAt = null
    }
  }

  next()
})

export default mongoose.model('LabReport', labReportSchema)
