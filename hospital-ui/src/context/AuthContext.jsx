import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, signupUser, resetPassword as resetPasswordRequest } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = Boolean(user)

  useEffect(() => {
    async function loadUserFromToken() {
      const token = localStorage.getItem('hospital_token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser()
        setUser(data.user)
      } catch (error) {
        localStorage.removeItem('hospital_token')
      } finally {
        setLoading(false)
      }
    }

    loadUserFromToken()
  }, [])

  const login = async (credentials) => {
    const data = await loginUser(credentials)
    localStorage.setItem('hospital_token', data.token)
    setUser(data.user)
    return data.user
  }

  const signup = async (userData) => {
    const data = await signupUser(userData)
    localStorage.setItem('hospital_token', data.token)
    setUser(data.user)
    return data.user
  }

  const resetPassword = async (token, password) => {
    const data = await resetPasswordRequest(token, password)
    localStorage.setItem('hospital_token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('hospital_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, signup, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

