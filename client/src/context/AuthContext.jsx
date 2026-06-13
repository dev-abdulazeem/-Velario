import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = res.data.user
      setUser(userData)
      localStorage.setItem('velario_user', JSON.stringify({ id: userData.id }))
      window.dispatchEvent(new StorageEvent('storage'))
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('velario_user', JSON.stringify({ id: userData.id }))
    setUser(userData)
    window.dispatchEvent(new StorageEvent('storage'))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('velario_user')
    localStorage.removeItem('velario_cart_guest')
    setUser(null)
    window.dispatchEvent(new StorageEvent('storage'))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isAdmin: user?.role === 'admin',
      token: getToken() 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)