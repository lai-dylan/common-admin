import { get, post, put, del } from './request'
import type { Role, PaginationParams, PaginationResult } from '@/types'

export const getRoles = (params: PaginationParams & { keyword?: string }) =>
  get<PaginationResult<Role>>('/roles', params)

export const getRole = (id: number) => get<Role>(`/roles/${id}`)

export const createRole = (data: Partial<Role>) => post<Role>('/roles', data)

export const updateRole = (id: number, data: Partial<Role>) => put<Role>(`/roles/${id}`, data)

export const deleteRole = (id: number) => del(`/roles/${id}`)

export const getAllPermissions = () => get<string[]>('/roles/permissions')
