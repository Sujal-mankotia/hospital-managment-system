import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { createResetToken, hashToken } from '../utils/hashToken.js'

function sendAuthResponse(res, user, statusCode = 200) {
  const token = generateToken(user)

  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // Bug #4 fix: always force 'patient' on public signup – role can only be set by admin
    const user = await User.create({ name, email, password, role: 'patient' })
    sendAuthResponse(res, user, 201)
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message })
  }
}

export async function createUserByAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password, role })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Create user failed', error: error.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    sendAuthResponse(res, user)
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user })
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' })
    }

    const { plainToken, hashedToken } = createResetToken()
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl}/reset-password/${plainToken}`

    res.json({
      message: 'Password reset token created',
      resetUrl,
      note: 'For learning/demo, copy this resetUrl. In production, send it by email.',
    })
  } catch (error) {
    res.status(500).json({ message: 'Forgot password failed', error: error.message })
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    sendAuthResponse(res, user)
  } catch (error) {
    res.status(500).json({ message: 'Reset password failed', error: error.message })
  }
}
