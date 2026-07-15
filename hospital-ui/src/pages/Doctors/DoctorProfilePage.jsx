import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPhone, FiMail, FiStar } from 'react-icons/fi'
import PageHeader from '../../components/common/PageHeader'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { getDoctor } from '../../api/doctorsApi'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function authHeaders() {
  const token = localStorage.getItem('hospital_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const doctorData = await getDoctor(id)
        let patientItems = []

        try {
          const patientResponse = await fetch(`${API}/patients?limit=1000`, {
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders(),
            },
          }).then((response) => (response.ok ? response.json() : response.json().then((error) => Promise.reject(error))))
          patientItems = patientResponse.items || []
        } catch {
          patientItems = []
        }

        setDoctor(doctorData)
        setPatients(patientItems)
      } catch {
        setDoctor(null)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id])

  const assignedPatients = patients.filter((patient) => patient.doctorId === doctor?.id || patient.doctor === doctor?.name)

  if (loading) {
    return (
      <EmptyState
        title="Loading doctor profile"
        description="Fetching the selected doctor and related patients from MongoDB..."
      />
    )
  }

  if (!doctor) {
    return (
      <EmptyState
        title="Doctor not found"
        description="The doctor profile may have been removed or the ID is invalid."
        action={<Button variant="outline" icon={FiArrowLeft} onClick={() => navigate('/doctors')}>Back to list</Button>}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Doctor Profile"
        breadcrumb={[{ label: 'Doctors', path: '/doctors' }, { label: doctor.name }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/appointments?doctorId=${encodeURIComponent(doctor.id)}&book=1`)}
            >
              Book Appointment
            </Button>
            <Button variant="outline" icon={FiArrowLeft} onClick={() => navigate('/doctors')}>Back to list</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar src={doctor.photo} name={doctor.name} size="xl" ring />
            <h2 className="mt-4 text-lg font-semibold text-ink">{doctor.name}</h2>
            <p className="text-sm text-primary">{doctor.department}</p>
            <div className="mt-2"><Badge>{doctor.availability}</Badge></div>
            <div className="mt-3 flex items-center gap-1 text-sm text-amber">
              <FiStar className="fill-amber" size={14} /> {doctor.rating} rating
            </div>
          </div>
          <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex items-center gap-2 text-slate"><FiPhone size={14} /> {doctor.phone}</div>
            <div className="flex items-center gap-2 text-slate"><FiMail size={14} /> {doctor.email}</div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 text-center">
            <div><p className="font-display text-xl font-bold text-ink">{doctor.experience}</p><p className="text-xs text-slate-light">Experience</p></div>
            <div><p className="font-display text-xl font-bold text-ink">{doctor.patients}</p><p className="text-xs text-slate-light">Patients</p></div>
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-light">Qualifications</p>
            <div className="flex flex-wrap gap-2">
              {(doctor.qualification || '').split(',').filter(Boolean).map((qualification, index) => (
                <span key={index} className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">{qualification.trim()}</span>
              ))}
              <span className="rounded-full bg-teal-light px-2.5 py-1 text-xs font-medium text-teal">{doctor.department} Specialist</span>
            </div>
          </div>
          <div className="mt-5 flex gap-2 border-t border-line pt-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/appointments?doctorId=${encodeURIComponent(doctor.id)}`)}
            >
              View Appointments
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">Weekly Schedule</h3>
            <div className="grid grid-cols-7 gap-2">
              {(doctor.schedule || []).map((entry) => (
                <div key={entry.day} className="rounded-xl border border-line p-2.5 text-center">
                  <p className="text-xs font-semibold text-ink">{entry.day}</p>
                  <div className="mt-2 space-y-1">
                    {entry.slots.map((slot, index) => (
                      <p key={index} className={`rounded-md px-1 py-1 text-[10px] font-medium ${slot === 'Off' ? 'bg-slate-100 text-slate-light' : 'bg-primary-light text-primary'}`}>
                        {slot}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-sm font-semibold text-ink">Assigned Patients</h3>
            {assignedPatients.length === 0 ? (
              <p className="text-sm text-slate">No patients currently linked to this profile.</p>
            ) : (
              <div className="space-y-3">
                {assignedPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={patient.photo} name={patient.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-ink">{patient.name}</p>
                        <p className="id-tag">{patient.id} - {patient.disease}</p>
                      </div>
                    </div>
                    <Badge>{patient.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
