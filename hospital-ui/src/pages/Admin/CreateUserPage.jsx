import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiLock, FiMail, FiUser } from 'react-icons/fi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { createUserByAdmin } from '../../api/authApi'

export default function CreateUserPage() {
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', password: '', role: 'patient' },
  })

  const onSubmit = async (values) => {
    try {
      setApiError('')
      setSuccessMessage('')
      const data = await createUserByAdmin(values)
      setSuccessMessage(`${data.user.name} was created as ${data.user.role}.`)
      reset({ name: '', email: '', password: '', role: 'patient' })
    } catch (error) {
      setSuccessMessage('')
      setApiError(error.message)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center px-6 py-8">
      <div className="w-full rounded-2xl bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">Create user</h1>
        <p className="mt-1 text-sm text-slate">Admins can create doctors, patients, receptionists, or other admins.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <Input
              label="Full name"
              icon={FiUser}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Email address"
              type="email"
              icon={FiMail}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          <div className="md:col-span-1">
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
          </div>
          <label className="block md:col-span-1">
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

          <div className="md:col-span-2">
            {apiError && <p className="mb-3 text-sm text-rose">{apiError}</p>}
            {successMessage && <p className="mb-3 rounded-xl bg-teal-light px-4 py-3 text-sm text-teal">{successMessage}</p>}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create user'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
