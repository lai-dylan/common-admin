import { http } from './request'

export async function login(payload: { username: string; password: string }) {
  const res = await http.post('auth/login', { json: payload }).json<{ token: string }>()
  return res
}

export async function logout() {
  await http.post('auth/logout').json().catch(() => {})
}

