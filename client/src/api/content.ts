import { get, post, put, del } from './request'
import type { Content, PaginationParams, PaginationResult } from '@/types'
import type { SelectOption } from '@/components/common/crud-table/types'

export const getContents = (
  payload: PaginationParams & {
    keyword?: string
    status?: string
    category?: string
    author?: string
    dateStart?: string
    dateEnd?: string
  },
) => post<PaginationResult<Content>>('content/search', payload)

export const getContent = (id: number) => get<Content>(`content/${id}`)

export const createContent = (data: Partial<Content>) => post<Content>('content', data)

export const updateContent = (id: number, data: Partial<Content>) => put<Content>(`content/${id}`, data)

export const deleteContent = (id: number) => del(`content/${id}`)

export const publishContent = (id: number) => post(`content/${id}/publish`)

export const archiveContent = (id: number) => post(`content/${id}/archive`)

export const getContentCategories =  () => get<SelectOption[]>('content/categories')
