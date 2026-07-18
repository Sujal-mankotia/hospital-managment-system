import Bill from '../models/Bill.js'
import Patient from '../models/Patient.js'
import Payment from '../models/Payment.js'
import { sendControllerError } from '../utils/controllerErrors.js'

async function generateBillNumber() {
    const year = new Date().getFullYear()
    const prefix = `BILL-${year}-`
    const lastBill = await Bill.findOne({ billNumber: { $regex: `^${prefix}` } })
      .sort({ billNumber: -1 })
      .select('billNumber')
      .lean()

    let nextNum = 1
    if (lastBill && lastBill.billNumber) {
        const parts = lastBill.billNumber.split('-')
        const lastNum = parseInt(parts[parts.length - 1], 10)
        if (!isNaN(lastNum)) nextNum = lastNum + 1
    }

    return `${prefix}${String(nextNum).padStart(6, '0')}`
}

export async function createBill(req, res) {
    try {
        const { patientId, patientObjectId, items, status, paymentMethod, gstEnabled, gstRate, discount = 0, notes = '', doctorName = '' } = req.body

        if (!patientId && !patientObjectId) {
            return res.status(400).json({ message: 'Select a patient', field: 'patientId' })
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Add at least one line item', field: 'items' })
        }

        let patient = null
        const lookupId = patientObjectId || patientId
        if (/^[0-9a-fA-F]{24}$/.test(lookupId)) {
            patient = await Patient.findById(lookupId)
        }
        if (!patient) {
            patient = await Patient.findOne({ id: lookupId })
        }
        if (!patient) {
            return res.status(400).json({ message: 'Select a valid patient from the patient list', field: 'patientId' })
        }

        const processedItems = items.map((item) => {
            const qty = Number(item.quantity) || 1
            const unitPrice = Number(item.unitPrice) || Number(item.amount) || 0
            const subtotal = qty * unitPrice
            return {
                description: item.description,
                amount: Number(item.amount) || subtotal,
                quantity: qty,
                unitPrice,
                subtotal,
            }
        }).filter((item) => item.description && item.subtotal > 0)

        if (processedItems.length === 0) {
            return res.status(400).json({ message: 'Line items must include a description and amount greater than 0', field: 'items' })
        }

        const subtotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0)
        const discountAmount = Math.max(0, Number(discount) || 0)
        const isGstEnabled = gstEnabled === true
        const gstRateNum = gstRate === undefined || gstRate === '' ? 18 : Number(gstRate)
        const taxableAmount = Math.max(0, subtotal - discountAmount)
        const finalTotal = isGstEnabled ? taxableAmount + (taxableAmount * gstRateNum) / 100 : taxableAmount

        if (finalTotal <= 0) {
            return res.status(400).json({ message: 'Bill amount must be greater than 0', field: 'items' })
        }

        const billNumber = await generateBillNumber()

        const bill = await Bill.create({
            patientId: patient.id,
            patient: patient._id,
            patientName: patient.name,
            billNumber,
            items: processedItems,
            totalAmount: finalTotal,
            amountPaid: 0,
            status: status || 'pending',
            paymentMethod: paymentMethod || 'cash',
            gstEnabled: isGstEnabled,
            gstRate: isGstEnabled ? gstRateNum : 0,
            discount: discountAmount,
            notes,
            doctorName,
            createdBy: req.user?._id,
        })

        const populatedBill = await Bill.findById(bill._id)
            .populate('patient', 'name id phone age gender')
            .populate('createdBy', 'name')
            .lean()

        res.status(201).json({
            message: 'Bill created successfully',
            bill: populatedBill,
        })
    } catch (error) {
        sendControllerError(res, error, 'Create bill failed')
    }
}

export async function getBills(req, res) {
    try {
        const filter = {}
        const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status: statusFilter } = req.query
        const pageNum = Math.max(1, parseInt(page, 10) || 1)
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))

        if (req.query.patientId) {
            filter.patientId = req.query.patientId
        }

        if (statusFilter && statusFilter !== 'All') {
            filter.status = statusFilter
        }

        // Text search across patient name, billNumber, phone, patientId
        if (search && search.trim()) {
            const searchStr = search.trim()
            // Try to find matching patient ObjectIds first
            const matchingPatients = await Patient.find({
                $or: [
                    { name: { $regex: searchStr, $options: 'i' } },
                    { id: { $regex: searchStr, $options: 'i' } },
                    { phone: { $regex: searchStr, $options: 'i' } },
                ],
            }).select('_id').lean()

            const patientIds = matchingPatients.map((p) => p._id)

            filter.$or = [
                { billNumber: { $regex: searchStr, $options: 'i' } },
                { patient: { $in: patientIds } },
                { patientId: { $regex: searchStr, $options: 'i' } },
            ]
        }

        const sortObj = {}
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1

        const total = await Bill.countDocuments(filter)
        const bills = await Bill.find(filter)
            .populate('patient', 'name id phone age gender')
            .populate('createdBy', 'name')
            .sort(sortObj)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean()

        res.json({
            bills,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        })
    } catch (error) {
        sendControllerError(res, error, 'Get bills failed')
    }
}

export async function getBillById(req, res) {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('patient', 'name id phone age gender')
            .populate('createdBy', 'name')
            .populate('paymentHistory.collectedBy', 'name')
            .lean()

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' })
        }

        // If patient reference is missing, provide fallback info
        if (!bill.patient) {
            bill.patient = { name: 'Deleted Patient', id: bill.patientId || 'Unknown', phone: '' }
        }

        res.json({ bill })
    } catch (error) {
        sendControllerError(res, error, 'Get bill failed')
    }
}

export async function payBill(req, res) {
    try {
        const bill = await Bill.findById(req.params.id)

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' })
        }

        const { paymentMethod, amount, transactionId } = req.body

        // Support partial payments
        const payAmount = amount !== undefined ? Number(amount) : bill.totalAmount
        const payMethod = paymentMethod || bill.paymentMethod

        if (payAmount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than 0' })
        }

        // Add to payment history
        bill.paymentHistory.push({
            amount: payAmount,
            method: payMethod,
            collectedBy: req.user?._id,
            collectedAt: new Date(),
            transactionId: transactionId || '',
        })

        bill.amountPaid += payAmount
        if (payMethod) {
            bill.paymentMethod = payMethod
        }

        await bill.save()

        const populatedBill = await Bill.findById(bill._id)
            .populate('patient', 'name id phone age gender')
            .populate('createdBy', 'name')
            .populate('paymentHistory.collectedBy', 'name')
            .lean()

        res.json({
            message: 'Payment recorded successfully',
            bill: populatedBill,
        })
    } catch (error) {
        sendControllerError(res, error, 'Pay bill failed')
    }
}

export async function deleteBill(req, res) {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id)

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' })
        }

        await Payment.deleteMany({ billId: bill._id })
        res.json({ message: 'Bill deleted successfully', bill })
    } catch (error) {
        sendControllerError(res, error, 'Delete bill failed')
    }
}
