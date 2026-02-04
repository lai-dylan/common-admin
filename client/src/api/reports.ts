import { http } from './request'
import type { QueryPayload } from '@/components/common/crud-table/types'

export async function getReports(payload: QueryPayload<any>) {
  const { pagination, sort, filters } = payload
  const body: Record<string, any> = {
    page: pagination.page,
    pageSize: pagination.pageSize,
  }
  if (sort?.prop && sort?.order) {
    body.sortProp = sort.prop
    body.sortOrder = sort.order
  }
  if (filters?.keyword) body.keyword = filters.keyword
  if (filters?.minVisits !== undefined && filters?.minVisits !== null && filters?.minVisits !== '') {
    body.minVisits = filters.minVisits
  }
  if (filters?.reportType) body.reportType = filters.reportType
  if (Array.isArray(filters?.relatedSystems) && filters.relatedSystems.length) {
    body.relatedSystems = filters.relatedSystems.map((v: any) => Number(v))
  }
  if (Array.isArray(filters?.department) && filters.department.length) {
    body.departments = filters.department.map((v: any) => Number(v))
  } else if (typeof filters?.department === 'string' && filters.department) {
    body.department = filters.department
  }
  if (Array.isArray(filters?.periodsAny) && filters.periodsAny.length) {
    body.periods = filters.periodsAny.map((v: any) => Number(v))
  }
  if (filters?.enabled !== undefined) body.enabled = filters.enabled
  if (Array.isArray(filters?.createdRange) && filters.createdRange.length === 2) {
    const [start, end] = filters.createdRange as any[]
    if (start) body.createdStart = new Date(start).toISOString()
    if (end) body.createdEnd = new Date(end).toISOString()
  }

  const resp = await http.post('reports/query', { json: body }).json<any>()
  const data = resp?.data ?? { rows: [], total: 0 }
  return { rows: data.rows, total: data.total as number }
}

export async function deleteReports(ids: Array<number | string>) {
  const resp = await http.post('reports/delete', { json: { ids } }).json<any>()
  return resp?.data ?? { deleted: 0 }
}

export async function getReportTypes() {
  const resp = await http.get('reports/types').json<any>()
  return resp?.data ?? []
}
