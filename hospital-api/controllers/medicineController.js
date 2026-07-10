import Medicine from '../models/Medicine.js'

export async function createMedicine(req, res) {
  try {
    const { name, category, stockQuantity, unitPrice, expiryDate, supplier } = req.body

    if (!name || !category || stockQuantity === undefined || unitPrice === undefined || !supplier) {
      return res.status(400).json({ message: 'name, category, stockQuantity, unitPrice and supplier are required' })
    }

    const medicine = await Medicine.create({
      name,
      category,
      stockQuantity,
      unitPrice,
      expiryDate,
      supplier,
    })

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine,
    })
  } catch (error) {
    res.status(500).json({ message: 'Create medicine failed', error: error.message })
  }
}

export async function getMedicines(req, res) {
  try {
    const filter = {}

    if (req.query.lowStock === 'true') {
      filter.stockQuantity = { $lte: 10 }
    }

    const medicines = await Medicine.find(filter).sort({ expiryDate: 1, createdAt: -1 })

    res.json({ medicines })
  } catch (error) {
    res.status(500).json({ message: 'Get medicines failed', error: error.message })
  }
}

export async function updateMedicine(req, res) {
  try {
    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }

    Object.assign(medicine, req.body)
    await medicine.save()

    res.json({
      message: 'Medicine updated successfully',
      medicine,
    })
  } catch (error) {
    res.status(500).json({ message: 'Update medicine failed', error: error.message })
  }
}

export async function deleteMedicine(req, res) {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id)

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }

    res.json({ message: 'Medicine deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Delete medicine failed', error: error.message })
  }
}

export async function deductMedicine(req, res) {
  try {
    const { quantity } = req.body

    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'quantity is required and must be greater than 0' })
    }

    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }

    if (medicine.stockQuantity < Number(quantity)) {
      return res.status(400).json({ message: 'Insufficient stock' })
    }

    medicine.stockQuantity -= Number(quantity)
    await medicine.save()

    res.json({
      message: 'Medicine stock deducted successfully',
      medicine,
    })
  } catch (error) {
    res.status(500).json({ message: 'Deduct medicine failed', error: error.message })
  }
}
