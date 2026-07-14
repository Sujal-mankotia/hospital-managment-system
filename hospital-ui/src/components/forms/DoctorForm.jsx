import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { departments as fallbackDepartments } from '../../data/doctors'

const availabilityOptions = ['Available', 'In Surgery', 'On Leave']
const statusOptions = ['Active', 'On Leave', 'Inactive']

export default function DoctorForm({ defaultValues, departments = [], onSubmit, onCancel, submitLabel = 'Save Doctor' }) {
  const mergedDefaults = useMemo(() => ({
    availability: 'Available',
    status: 'Active',
    photo: '',
    ...defaultValues,
  }), [defaultValues])
  const { register, handleSubmit, setValue, reset } = useForm({ defaultValues: mergedDefaults })
  const [preview, setPreview] = useState(mergedDefaults.photo || '')
  const departmentOptions = departments.length > 0 ? departments : fallbackDepartments

  useEffect(() => {
    reset(mergedDefaults)
    setPreview(mergedDefaults.photo || '')
  }, [mergedDefaults, reset])

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPreview('')
      setValue('photo', '')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextValue = typeof reader.result === 'string' ? reader.result : ''
      setPreview(nextValue)
      setValue('photo', nextValue, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Full name" placeholder="e.g. Dr. Rohan Mehta" {...register('name')} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Department</span>
        <select {...register('department')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {departmentOptions.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <Input label="Qualification" placeholder="e.g. MD, DM Cardiology" {...register('qualification')} />
      <Input label="Experience" placeholder="e.g. 14 yrs" {...register('experience')} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Availability</span>
        <select {...register('availability')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {availabilityOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
        <select {...register('status')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {statusOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <Input label="Phone" placeholder="+91 98765 43210" {...register('phone')} />
      <Input label="Email" placeholder="name@meridianhealth.example" {...register('email')} />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Profile photo</span>
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line bg-slate-50 p-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200">
            {preview ? <img src={preview} alt="Doctor preview" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-slate-light">No photo</div>}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="block w-full text-sm text-slate file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark" />
            <input type="hidden" {...register('photo')} />
            <p className="mt-2 text-xs text-slate-light">Upload from your device to replace the current profile photo.</p>
          </div>
        </div>
      </label>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
