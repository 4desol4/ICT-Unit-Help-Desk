import { createContext, useContext, useState, useEffect } from 'react'
import { setToken, clearToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on page refresh
    const saved = localStorage.getItem('ict_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData, token) => {
    setToken(token)
    localStorage.setItem('ict_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    clearToken()
    localStorage.removeItem('ict_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Easy hook to use auth anywhere
export const useAuth = () => useContext(AuthContext)