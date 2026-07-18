export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '')

export function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem('hospital_token')
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(Boolean(options.body) && !(options.body instanceof FormData)),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed')
    Object.assign(error, data)
    throw error
  }

  return data
}
