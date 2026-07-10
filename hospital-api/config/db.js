import mongoose from 'mongoose'
import User from '../models/User.js'

async function connectWithUri(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log('MongoDB connected')
}

function getFallbackUri() {
  return process.env.MONGO_URI_FALLBACK || ''
}

export default async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env')
    }

    try {
      await connectWithUri(mongoUri)
    } catch (error) {
      const fallbackUri = getFallbackUri()
      if (fallbackUri && error.message.includes('querySrv ECONNREFUSED')) {
        console.warn('MongoDB SRV connection failed, trying fallback direct URI...')
        await connectWithUri(fallbackUri)
      } else {
        throw error
      }
    }

    // Seed default admin if it doesn't already exist
    const adminEmail = process.env.ADMIN_EMAIL || 'sujalmankotia15@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'sujal2006@'
    const adminName = process.env.ADMIN_NAME || 'System Admin'

    const adminExists = await User.findOne({ email: adminEmail })
    if (!adminExists) {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      })
      console.log('--------------------------------------------------')
      console.log('Default admin user created:')
      console.log(`Email: ${adminEmail}`)
      console.log(`Password: ${adminPassword}`)
      console.log('--------------------------------------------------')
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    return false
  }

  return true
}
