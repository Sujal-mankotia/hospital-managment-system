const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '')

async function request(path, options = {}) {
  const token = localStorage.getItem('hospital_token')

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

export function loginUser(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function signupUser(userData) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export function createUserByAdmin(userData) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export function getCurrentUser() {
  return request('/auth/me')
}

export function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token, password) {
  return request(`/auth/reset-password/${token}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  })
}
