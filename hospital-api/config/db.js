import mongoose from 'mongoose'
import User from '../models/User.js'

export default async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env')
    }

    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')

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
    process.exit(1)
  }
}
