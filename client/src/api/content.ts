import { get, post, put, del } from './request'
import type { Content, PaginationParams, PaginationResult } from '@/types'

export const getContents = (params: PaginationParams & { keyword?: string; status?: string; category?: string }) =>
  get<PaginationResult<Content>>('/content', params)

export const getContent = (id: number) => get<Content>(`/content/${id}`)

export const createContent = (data: Partial<Content>) => post<Content>('/content', data)

export const updateContent = (id: number, data: Partial<Content>) => put<Content>(`/content/${id}`, data)

export const deleteContent = (id: number) => del(`/content/${id}`)

export const publishContent = (id: number) => post(`/content/${id}/publish`)

export const archiveContent = (id: number) => post(`/content/${id}/archive`)
