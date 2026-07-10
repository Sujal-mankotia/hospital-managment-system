import User from '../models/User.js'
import { sendControllerError } from '../utils/controllerErrors.js'

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users: users.map(serializeUser) })
  } catch (error) {
    sendControllerError(res, error, 'Get users failed')
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: serializeUser(user) })
  } catch (error) {
    sendControllerError(res, error, 'Get user failed')
  }
}

export async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const allowed = ['name', 'email', 'password', 'role']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field]
      }
    })

    await user.save()
    res.json({ message: 'User updated successfully', user: serializeUser(user) })
  } catch (error) {
    sendControllerError(res, error, 'Update user failed')
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ message: 'User deleted successfully', user: serializeUser(user) })
  } catch (error) {
    sendControllerError(res, error, 'Delete user failed')
  }
}
