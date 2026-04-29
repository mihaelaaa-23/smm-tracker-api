const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let token: string | null = localStorage.getItem('api_token')
let tokenExpiry: number | null = Number(localStorage.getItem('api_token_expiry')) || null

export const getToken = async (): Promise<string> => {
  const now = Date.now()

  // Refresh if expired or missing
  if (!token || !tokenExpiry || now >= tokenExpiry) {
    const res = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    })
    const data = await res.json()
    token = data.token
    tokenExpiry = now + 55 * 1000 // refresh 5s before expiry
    localStorage.setItem('api_token', token!)
    localStorage.setItem('api_token_expiry', String(tokenExpiry))
  }

  return token!
}

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const t = await getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'API error')
  }

  return res.json()
}