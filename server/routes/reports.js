import Router from 'koa-router'
import { res } from '../utils/response.js'
import {
  reports,
  departments as DEPARTMENTS,
  dataPeriods as DATA_PERIODS,
  relatedSystems as RELATED_SYSTEMS,
} from '../data/mockData.js'

const router = new Router()

function toBool(val) {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'boolean') return val
  const s = String(val).toLowerCase()
  if (s === 'true') return true
  if (s === 'false') return false
  return undefined
}

function compareBy(prop, order = 'asc') {
  const factor = order === 'desc' ? -1 : 1
  return (a, b) => {
    const va = a[prop]
    const vb = b[prop]
    if (va == null && vb == null) return 0
    if (va == null) return -1 * factor
    if (vb == null) return 1 * factor
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor
    if (typeof va === 'boolean' && typeof vb === 'boolean') return ((va === vb) ? 0 : (va ? 1 : -1)) * factor
    return String(va).localeCompare(String(vb)) * factor
  }
}

router.get('/api/reports', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const {
    page = '1',
    pageSize = '10',
    sortProp,
    sortOrder,
    keyword = '',
    minVisits,
    reportType,
    department,
    enabled,
    relatedSystems: relatedSystemsParam,
    createdStart,
    createdEnd,
    dataPeriod,
    periods: periodsParam,
  } = ctx.query

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const sizeNum = Math.max(1, parseInt(pageSize, 10) || 10)
  const enabledBool = toBool(enabled)
  const startTs = createdStart ? Date.parse(String(createdStart)) : undefined
  const endTs = createdEnd ? Date.parse(String(createdEnd)) : undefined
  const minVisitsNum = minVisits !== undefined && minVisits !== '' ? Number(minVisits) : undefined
  const relatedCodes = Array.isArray(relatedSystemsParam)
    ? relatedSystemsParam
    : (relatedSystemsParam ? [relatedSystemsParam] : [])
  const departmentsCodes = Array.isArray(ctx.query.departments)
    ? ctx.query.departments
    : (ctx.query.departments ? [ctx.query.departments] : [])
  const periodsCodes = Array.isArray(periodsParam) ? periodsParam : (periodsParam ? [periodsParam] : [])
  const relatedLabels = relatedCodes.map(v => RELATED_SYSTEMS[Number(v)]).filter(Boolean)
  const departmentsLabels = departmentsCodes.map(v => DEPARTMENTS[Number(v)]).filter(Boolean)
  const periodsLabels = periodsCodes.map(v => DATA_PERIODS[Number(v)]).filter(Boolean)

  let list = reports.slice()
  // 过滤
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(r => String(r.reportName).toLowerCase().includes(kw))
  }
  if (minVisitsNum !== undefined && !Number.isNaN(minVisitsNum)) {
    list = list.filter(r => Number(r.visits) >= minVisitsNum)
  }
  if (reportType) {
    list = list.filter(r => r.reportType === reportType)
  }
  if (department) {
    list = list.filter(r => r.department === department)
  }
  if (departmentsLabels.length > 0) {
    const set = new Set(departmentsLabels)
    list = list.filter(r => set.has(r.department))
  }
  if (dataPeriod) {
    list = list.filter(r => r.dataPeriod === dataPeriod)
  }
  if (periodsLabels.length > 0) {
    const set = new Set(periodsLabels)
    list = list.filter(r => set.has(r.dataPeriod))
  }
  if (enabledBool !== undefined) {
    list = list.filter(r => r.enabled === enabledBool)
  }
  if (relatedLabels.length > 0) {
    list = list.filter(r => {
      const set = new Set(r.relatedSystems || [])
      return relatedLabels.some(x => set.has(x))
    })
  }
  if (startTs !== undefined || endTs !== undefined) {
    list = list.filter(r => {
      const iso = r.createdAtISO || r.createdAt
      const ts = Date.parse(String(iso))
      if (Number.isNaN(ts)) return false
      if (startTs !== undefined && ts < startTs) return false
      if (endTs !== undefined && ts > endTs) return false
      return true
    })
  }

  // 排序
  if (sortProp && sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) {
    list.sort(compareBy(sortProp, sortOrder))
  }

  const total = list.length
  const start = (pageNum - 1) * sizeNum
  const end = start + sizeNum
  const rows = list.slice(start, end)
  res(ctx, { rows, total })
})

router.post('/api/reports/query', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const body = ctx.request.body || {}
  const {
    page = 1,
    pageSize = 10,
    sortProp,
    sortOrder,
    keyword = '',
    minVisits,
    reportType,
    department,
    enabled,
    relatedSystems: relatedSystemsParam,
    createdStart,
    createdEnd,
    dataPeriod,
    periods: periodsParam,
    departments: departmentsParam,
  } = body

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1)
  const sizeNum = Math.max(1, parseInt(String(pageSize), 10) || 10)
  const enabledBool = toBool(enabled)
  const startTs = createdStart ? Date.parse(String(createdStart)) : undefined
  const endTs = createdEnd ? Date.parse(String(createdEnd)) : undefined
  const minVisitsNum = minVisits !== undefined && minVisits !== '' ? Number(minVisits) : undefined
  const relatedCodes = Array.isArray(relatedSystemsParam) ? relatedSystemsParam : (relatedSystemsParam ? [relatedSystemsParam] : [])
  const departmentsCodes = Array.isArray(departmentsParam) ? departmentsParam : (departmentsParam ? [departmentsParam] : [])
  const periodsCodes = Array.isArray(periodsParam) ? periodsParam : (periodsParam ? [periodsParam] : [])
  const relatedLabels = relatedCodes.map(v => RELATED_SYSTEMS[Number(v)]).filter(Boolean)
  const departmentsLabels = departmentsCodes.map(v => DEPARTMENTS[Number(v)]).filter(Boolean)
  const periodsLabels = periodsCodes.map(v => DATA_PERIODS[Number(v)]).filter(Boolean)

  let list = reports.slice()
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter(r => String(r.reportName).toLowerCase().includes(kw))
  }
  if (minVisitsNum !== undefined && !Number.isNaN(minVisitsNum)) {
    list = list.filter(r => Number(r.visits) >= minVisitsNum)
  }
  if (reportType) {
    list = list.filter(r => r.reportType === reportType)
  }
  if (department) {
    list = list.filter(r => r.department === department)
  }
  if (departmentsLabels.length > 0) {
    const set = new Set(departmentsLabels)
    list = list.filter(r => set.has(r.department))
  }
  if (dataPeriod) {
    list = list.filter(r => r.dataPeriod === dataPeriod)
  }
  if (periodsLabels.length > 0) {
    const set = new Set(periodsLabels)
    list = list.filter(r => set.has(r.dataPeriod))
  }
  if (enabledBool !== undefined) {
    list = list.filter(r => r.enabled === enabledBool)
  }
  if (relatedLabels.length > 0) {
    list = list.filter(r => {
      const set = new Set(r.relatedSystems || [])
      return relatedLabels.some(x => set.has(x))
    })
  }
  if (startTs !== undefined || endTs !== undefined) {
    list = list.filter(r => {
      const iso = r.createdAtISO || r.createdAt
      const ts = Date.parse(String(iso))
      if (Number.isNaN(ts)) return false
      if (startTs !== undefined && ts < startTs) return false
      if (endTs !== undefined && ts > endTs) return false
      return true
    })
  }

  if (sortProp && sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) {
    list.sort(compareBy(sortProp, sortOrder))
  }

  const total = list.length
  const start = (pageNum - 1) * sizeNum
  const end = start + sizeNum
  const rows = list.slice(start, end)
  res(ctx, { rows, total })
})

router.post('/api/reports/delete', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const body = ctx.request.body || {}
  const ids = Array.isArray(body.ids) ? body.ids : []
  if (ids.length === 0) {
    return res(ctx, { deleted: 0 }, '无删除项')
  }
  let deleted = 0
  const idSet = new Set(ids.map(id => Number(id)))
  for (let i = reports.length - 1; i >= 0; i--) {
    const item = reports[i]
    if (idSet.has(Number(item.reportId))) {
      reports.splice(i, 1)
      deleted++
    }
  }
  res(ctx, { deleted }, '删除成功')
})

router.get('/api/reports/types', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const set = new Set(reports.map(r => r.reportType).filter(Boolean))
  const list = Array.from(set)
  res(ctx, list)
})

export default router
