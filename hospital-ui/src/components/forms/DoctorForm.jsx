import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { departments } from '../../data/doctors'

export default function DoctorForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save Doctor' }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Full name" placeholder="e.g. Dr. Rohan Mehta" {...register('name')} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Department</span>
        <select {...register('department')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <Input label="Qualification" placeholder="e.g. MD, DM Cardiology" {...register('qualification')} />
      <Input label="Experience" placeholder="e.g. 14 yrs" {...register('experience')} />
      <Input label="Phone" placeholder="+91 98765 43210" {...register('phone')} />
      <Input label="Email" placeholder="name@meridianhealth.example" {...register('email')} />
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
