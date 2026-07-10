import Bill from '../models/Bill.js'
import Payment from '../models/Payment.js'

export async function createBill(req, res) {
  try {
    const { patientId, items, totalAmount } = req.body

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'patientId and items are required' })
    }

    const computedTotal = Number(totalAmount ?? items.reduce((sum, item) => sum + Number(item.amount || 0), 0))

    const bill = await Bill.create({
      patientId,
      items,
      totalAmount: computedTotal,
      amountPaid: 0,
      status: 'pending',
    })

    res.status(201).json({ message: 'Bill created successfully', bill })
  } catch (error) {
    res.status(500).json({ message: 'Create bill failed', error: error.message })
  }
}

export async function getBills(req, res) {
  try {
    const filter = {}

    if (req.query.patientId) {
      filter.patientId = req.query.patientId
    }
    if (req.query.status) {
      filter.status = req.query.status
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 })
    res.json({ bills })
  } catch (error) {
    res.status(500).json({ message: 'Get bills failed', error: error.message })
  }
}

export async function getBillById(req, res) {
  try {
    const bill = await Bill.findById(req.params.id)

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' })
    }

    res.json({ bill })
  } catch (error) {
    res.status(500).json({ message: 'Get bill failed', error: error.message })
  }
}

export async function deleteBill(req, res) {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id)

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' })
    }

    await Payment.deleteMany({ billId: bill._id })

    res.json({ message: 'Bill and payments deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Delete bill failed', error: error.message })
  }
}
