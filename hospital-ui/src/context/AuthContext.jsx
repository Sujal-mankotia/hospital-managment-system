import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const DUMMY_USER = {
  name: 'Dr. Ishaan Kapoor',
  role: 'Hospital Administrator',
  email: 'ishaan.kapoor@meridianhealth.example',
  avatar: 'https://i.pravatar.cc/120?img=68',
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const login = () => {
    setUser(DUMMY_USER)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
