import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    expiryDate: {
      type: Date,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Medicine', medicineSchema)
