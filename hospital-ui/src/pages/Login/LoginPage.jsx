import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock } from 'react-icons/fi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      setApiError('')
      await login(values)
      navigate('/dashboard')
    } catch (error) {
      setApiError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-primary lg:flex">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md px-10 text-white"
        >
          <svg width="220" height="70" viewBox="0 0 240 60" className="mb-8">
            <polyline
              points="0,30 40,30 55,10 70,50 85,30 110,30 122,18 134,42 146,30 240,30"
              fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="240" className="animate-pulseline"
            />
          </svg>
          <h2 className="font-display text-3xl font-bold leading-tight">Care, coordinated.</h2>
          <p className="mt-3 text-sm text-white/80">
            One dashboard for patients, doctors, appointments and every vital sign that matters - built for the pace of a real hospital floor.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold">1,284</p>
              <p className="text-xs text-white/70">Patients</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">46</p>
              <p className="text-xs text-white/70">Doctors</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">132</p>
              <p className="text-xs text-white/70">Appointments</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="19" fill="#0F6FDE" />
              <polyline points="8,21 14,21 17,13 22,28 25,17 28,21 32,21" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="font-display text-base font-bold text-ink">Meridian</p>
              <p className="-mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-light">Health System</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-slate">Sign in to access the hospital dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              icon={FiMail}
              placeholder="you@meridianhealth.example"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              icon={FiLock}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate">
                <input type="checkbox" className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link>
            </div>

            {apiError && <p className="text-sm text-rose">{apiError}</p>}

            <Button type="submit" className="mt-2 w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-light">
            Accounts are created by an admin after login.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
