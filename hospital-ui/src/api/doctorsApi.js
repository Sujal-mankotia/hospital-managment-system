const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

function authHeaders() {
  const token = localStorage.getItem('hospital_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed')
  }

  return data
}

export async function listDoctors() {
  const data = await request('/doctors')
  return data.items || []
}

export async function getDoctor(id) {
  const data = await request(`/doctors/${id}`)
  return data.doctor || null
}

export async function createDoctor(payload) {
  const data = await request('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data.doctor || null
}

export async function updateDoctor(id, payload) {
  const data = await request(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return data.doctor || null
}

export async function removeDoctor(id) {
  const data = await request(`/doctors/${id}`, {
    method: 'DELETE',
  })

  return data.doctor || null
}

export async function getDoctorSlots(id, date) {
  const data = await request(`/doctors/${id}/slots?date=${encodeURIComponent(date)}`)
  return data.slots || []
}
