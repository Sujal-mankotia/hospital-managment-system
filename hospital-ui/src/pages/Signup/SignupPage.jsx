import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiLock, FiMail, FiUser } from 'react-icons/fi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function SignupPage() {
  const [apiError, setApiError] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', role: 'patient' },
  })

  const onSubmit = async (values) => {
    try {
      setApiError('')
      await signup(values)
      navigate('/dashboard')
    } catch (error) {
      setApiError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <p className="mt-1 text-sm text-slate">Register a hospital user with a role.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
          <Input
            label="Full name"
            icon={FiUser}
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <Input
            label="Email address"
            type="email"
            icon={FiMail}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Use at least 6 characters' },
            })}
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Role</span>
            <select
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/15"
              {...register('role')}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {apiError && <p className="text-sm text-rose">{apiError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already registered? <Link to="/" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
