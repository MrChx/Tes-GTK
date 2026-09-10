const TOKEN_KEY = 'gtk_token'
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE}${cleanPath}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Terjadi kesalahan pada server.')
    error.status = response.status
    throw error
  }
  return data
}
