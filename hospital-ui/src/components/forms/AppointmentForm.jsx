import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { getDoctorSlots } from '../../api/doctorsApi'

export default function AppointmentForm({ defaultValues, patients = [], doctors = [], onSubmit, onCancel, submitLabel = 'Book Appointment' }) {
  const fallbackDoctorId = defaultValues?.doctorId || doctors.find((doctor) => doctor.name === defaultValues?.doctor)?.id || doctors[0]?.id || ''
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      priority: 'Routine',
      ...defaultValues,
      doctorId: fallbackDoctorId,
    },
  })
  const hasPatients = patients.length > 0
  const selectedDoctorId = watch('doctorId')
  const selectedDate = watch('date')
  const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.id === selectedDoctorId), [doctors, selectedDoctorId])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (fallbackDoctorId) {
      setValue('doctorId', fallbackDoctorId)
    }
  }, [fallbackDoctorId, setValue])

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setSlots([])
      return
    }

    setLoadingSlots(true)
    getDoctorSlots(selectedDoctorId, selectedDate)
      .then((nextSlots) => {
        setSlots(nextSlots)
        const currentTime = defaultValues?.time
        if (!nextSlots.some((slot) => slot.time === currentTime && slot.available)) {
          const firstOpen = nextSlots.find((slot) => slot.available)
          setValue('time', firstOpen?.time || '')
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDoctorId, selectedDate, setValue, defaultValues?.time])

  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Patient</span>
        <select
          {...register('patientId')}
          disabled={!hasPatients}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {hasPatients ? (
            patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)
          ) : (
            <option value="">Add a patient first</option>
          )}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Doctor</span>
        <select {...register('doctorId')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} - {d.department}</option>)}
        </select>
      </label>
      <Input label="Department" value={selectedDoctor?.department || ''} readOnly />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Priority</span>
        <select {...register('priority')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          <option>Routine</option><option>Follow-up</option><option>Emergency</option>
        </select>
      </label>
      <Input label="Date" type="date" {...register('date')} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Available Slot</span>
        <select
          {...register('time')}
          disabled={!selectedDoctorId || !selectedDate || loadingSlots || !slots.some((slot) => slot.available)}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!selectedDate && <option value="">Select a date first</option>}
          {selectedDate && loadingSlots && <option value="">Loading slots...</option>}
          {selectedDate && !loadingSlots && slots.filter((slot) => slot.available).length === 0 && <option value="">No slots available</option>}
          {slots.filter((slot) => slot.available).map((slot) => <option key={slot.time} value={slot.time}>{slot.time}</option>)}
        </select>
      </label>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!hasPatients || !selectedDoctorId || !selectedDate || !slots.some((slot) => slot.available)}>{submitLabel}</Button>
      </div>
    </form>
  )
}
