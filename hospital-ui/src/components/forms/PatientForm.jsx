import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { doctors } from '../../data/doctors'

export default function PatientForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save Patient' }) {
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues })
  const [preview, setPreview] = useState(defaultValues?.photo || '')

  const watchedFile = watch('photoFile')

  useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      const file = watchedFile[0]
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [watchedFile])

  const handleFileChange = (e) => {
    const file = e.target.files
    setValue('photoFile', file)
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit?.(data))}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Input label="Full name" placeholder="e.g. Ananya Sharma" {...register('name')} />
      <Input label="Age" type="number" placeholder="e.g. 34" {...register('age')} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Gender</span>
        <select {...register('gender')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          <option>Female</option><option>Male</option><option>Other</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Blood group</span>
        <select {...register('bloodGroup')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <Input label="Phone" placeholder="+91 98765 43210" {...register('phone')} />
      <Input label="Diagnosis / Condition" placeholder="e.g. Hypertension" {...register('disease')} />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Assigned doctor</span>
        <select {...register('doctor')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {doctors.map((d) => <option key={d.id}>{d.name}</option>)}
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium text-ink">Profile photo (optional)</span>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
            {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <input type="hidden" {...register('photo')} />
            <input type="hidden" {...register('photoFile')} />
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
