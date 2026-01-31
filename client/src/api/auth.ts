import { post } from './request'
import type { LoginParams, LoginResult } from '@/types'

export const login = (data: LoginParams) => post<LoginResult>('/auth/login', data)

export const logout = () => post('/auth/logout')

export const getUserInfo = () => post('/auth/info')
