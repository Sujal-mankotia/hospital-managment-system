import User from '../models/User.js'
import { sendControllerError } from '../utils/controllerErrors.js'

export async function getSettings(req, res) {
  try {
    const user = await User.findById(req.user._id).select('name email role preferences createdAt updatedAt').lean()
    res.json({
      user,
      preferences: user?.preferences || { notifications: true },
    })
  } catch (error) {
    sendControllerError(res, error, 'Get settings failed')
  }
}

export async function updateSettings(req, res) {
  try {
    const preferences = {
      notifications: req.body.notifications !== false,
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('name email role preferences createdAt updatedAt')

    res.json({ message: 'Preferences saved', user, preferences })
  } catch (error) {
    sendControllerError(res, error, 'Save settings failed')
  }
}
