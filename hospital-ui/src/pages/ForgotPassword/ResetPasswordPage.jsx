import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function ResetPasswordPage() {
  const [apiError, setApiError] = useState('')
  const { resetPassword } = useAuth()
  const { token } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ password }) => {
    try {
      setApiError('')
      await resetPassword(token, password)
      navigate('/dashboard')
    } catch (error) {
      setApiError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">Reset password</h1>
        <p className="mt-1 text-sm text-slate">Enter a new password for your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            icon={FiLock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Use at least 6 characters' },
            })}
          />

          {apiError && <p className="text-sm text-rose">{apiError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Updating password...' : 'Update password'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Back to <Link to="/" className="font-medium text-primary hover:underline">sign in</Link>
        </p>
      </div>
    </div>
  )
}
