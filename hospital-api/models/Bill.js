import mongoose from 'mongoose'
import { buildBillNumber } from '../utils/billNumber.js'

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, default: 0, min: 0 },
})

const paymentHistoryEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking', 'insurance', 'other'],
    default: 'cash',
  },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectedAt: { type: Date, default: Date.now },
  transactionId: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true },
})

const billSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
    },
    billNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    items: [billItemSchema],
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'net_banking', 'insurance', 'other'],
      default: 'cash',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
      default: 'pending',
    },
    gstEnabled: {
      type: Boolean,
      default: false,
    },
    gstRate: {
      type: Number,
      default: 18,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    doctorName: {
      type: String,
      default: '',
      trim: true,
    },
    paymentHistory: [paymentHistoryEntrySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

billSchema.index({ createdAt: -1 })
billSchema.index({ status: 1, createdAt: -1 })
billSchema.index({ patientName: 'text', patientId: 'text', billNumber: 'text' })

billSchema.pre('save', function updateStatus(next) {
  if (!this.billNumber) {
    this.billNumber = buildBillNumber()
  }

  if (this.status === 'cancelled' || this.status === 'refunded') {
    return next()
  }

  if (this.amountPaid <= 0) {
    this.status = 'pending'
  } else if (this.amountPaid >= this.totalAmount) {
    this.status = 'paid'
  } else {
    this.status = 'partial'
  }

  next()
})

billSchema.pre('insertMany', function addBillNumbers(next, docs) {
  docs.forEach((doc) => {
    if (!doc.billNumber) {
      doc.billNumber = buildBillNumber()
    }
  })
  next()
})

export default mongoose.model('Bill', billSchema)
