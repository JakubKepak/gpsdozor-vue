const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://a1.gpsguard.eu'
const API_BASE_URL = RAW_BASE.replace(/\/+$/, '') + '/api/v1'
const API_USERNAME = import.meta.env.VITE_API_USERNAME ?? ''
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD ?? ''

if (import.meta.env.DEV && (!API_USERNAME || !API_PASSWORD)) {
  console.warn('[GPSDozor] VITE_API_USERNAME or VITE_API_PASSWORD is not set — API calls may fail.')
}

function getAuthHeader(): string {
  return 'Basic ' + btoa(`${API_USERNAME}:${API_PASSWORD}`)
}

const API_TIMEOUT_MS = 15_000

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch('GET', path)
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiFetch('PUT', path, body)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch('POST', path, body)
}
