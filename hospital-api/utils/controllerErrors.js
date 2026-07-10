export function sendControllerError(res, error, fallbackMessage) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: fallbackMessage, error: error.message })
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id', error: error.message })
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', error: error.message })
  }

  return res.status(500).json({ message: fallbackMessage, error: error.message })
}
