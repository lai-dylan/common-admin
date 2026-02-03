import { get, post, put, del } from './request'
import type { User, PaginationParams, PaginationResult } from '@/types'

export const getUsers = (params: PaginationParams & { 
  keyword?: string
  status?: string 
  roleId?: number
  dateStart?: string
  dateEnd?: string
}) =>
  get<PaginationResult<User>>('users', params)

export const getUser = (id: number) => get<User>(`users/${id}`)

export const createUser = (data: Partial<User>) => post<User>('users', data)

export const updateUser = (id: number, data: Partial<User>) => put<User>(`users/${id}`, data)

export const deleteUser = (id: number) => del(`users/${id}`)

export const batchDeleteUsers = (ids: number[]) => post('users/batch-delete', { ids })
