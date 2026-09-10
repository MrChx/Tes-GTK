import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const login = async (username, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { username, password },
      })
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
