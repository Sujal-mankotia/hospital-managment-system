import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
    {
        billId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'upi', 'insurance'],
            required: true,
        },
        paidAt: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Payment', paymentSchema)
