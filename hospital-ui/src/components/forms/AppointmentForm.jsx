import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { doctors, departments } from '../../data/doctors'
import { patients } from '../../data/patients'

export default function AppointmentForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Book Appointment' }) {
  const { register, handleSubmit } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Patient</span>
        <select {...register('patient')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {patients.map((p) => <option key={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Doctor</span>
        <select {...register('doctor')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Department</span>
        <select {...register('department')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Priority</span>
        <select {...register('priority')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          <option>Routine</option><option>Follow-up</option><option>Emergency</option>
        </select>
      </label>
      <Input label="Date" type="date" {...register('date')} />
      <Input label="Time" type="time" {...register('time')} />
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
