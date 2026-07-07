import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { forgotPassword } from '../../api/authApi'

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      setApiError('')
      const data = await forgotPassword(email)
      setMessage(data.resetUrl || data.message)
    } catch (error) {
      setMessage('')
      setApiError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">Forgot password</h1>
        <p className="mt-1 text-sm text-slate">Enter your email to generate a reset link.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            icon={FiMail}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />

          {apiError && <p className="text-sm text-rose">{apiError}</p>}
          {message && <p className="break-words rounded-xl bg-primary-light p-3 text-sm text-primary">{message}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating reset link...' : 'Create reset link'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Remember password? <Link to="/" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
