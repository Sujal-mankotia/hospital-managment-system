import Bill from '../models/Bill.js'
import Payment from '../models/Payment.js'
import { sendControllerError } from '../utils/controllerErrors.js'

async function recalculateBill(billId) {
    const payments = await Payment.find({ billId })
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

    const bill = await Bill.findById(billId)
    if (!bill) {
        throw new Error('Bill not found')
    }

    bill.amountPaid = amountPaid

    if (amountPaid <= 0) {
        bill.status = 'pending'
    } else if (amountPaid >= bill.totalAmount) {
        bill.status = 'paid'
    } else {
        bill.status = 'partial'
    }

    await bill.save()
    return bill
}

export async function createPayment(req, res) {
    try {
        const { amount, method, paidAt, notes } = req.body
        const { billId } = req.params

        if (!amount || !method) {
            return res.status(400).json({ message: 'amount and method are required' })
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({ message: 'amount must be greater than 0' })
        }

        const bill = await Bill.findById(billId)
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' })
        }

        const payment = await Payment.create({
            billId,
            amount: Number(amount),
            method,
            paidAt,
            notes,
        })

        const updatedBill = await recalculateBill(billId)

        res.status(201).json({
            message: 'Payment created successfully',
            payment,
            bill: updatedBill,
        })
    } catch (error) {
        sendControllerError(res, error, 'Create payment failed')
    }
}

export async function getPaymentsForBill(req, res) {
    try {
        const { billId } = req.params
        const bill = await Bill.findById(billId)

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' })
        }

        const payments = await Payment.find({ billId }).sort({ createdAt: -1 })
        res.json({ payments })
    } catch (error) {
        sendControllerError(res, error, 'Get payments failed')
    }
}

export async function getPayments(req, res) {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 })
        res.json({ payments })
    } catch (error) {
        sendControllerError(res, error, 'Get payments failed')
    }
}

export async function deletePayment(req, res) {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id)
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' })
        }

        const updatedBill = await recalculateBill(payment.billId)
        res.json({ message: 'Payment deleted successfully', payment, bill: updatedBill })
    } catch (error) {
        sendControllerError(res, error, 'Delete payment failed')
    }
}
