<template>
  <div class="p-4 h-full">
    <CommonTable
      :column-configs="columns"
      :filter-configs="filters"
      :initial-filters="initialFilters"
      row-key="reportId"
      :fetcher="fetcher"
      :table-actions="[]"
      :row-actions="[]"
      :full-height="true"
    >
      <template #table-actions="{ selection, refresh }">
        <el-button
          type="danger"
          size="small"
          :disabled="!selection.length"
          @click="handleBatchDelete(selection, refresh)"
        >
          批量删除
        </el-button>
      </template>
      <template #row-actions="{ row }">
        <el-button type="danger" size="small" @click="handleRowDelete(row)">
          删除
        </el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/common/crud-table/CommonTable.vue'
import type {
  TableColumn,
  FilterField,
  QueryPayload,
} from '@/components/common/crud-table/types'
import { getReports, deleteReports, getReportTypes } from '@/api/reports'

type Row = {
  reportId: number
  reportName: string
  reportType: string
  department: string
  owner: string
  dataPeriod: string
  enabled: boolean
  published: boolean
  createdAt: string
  updatedAt: string
  visits: number
  qualityScore: number
  relatedSystems: string[]
}

type Filters = {
  keyword?: string
  minVisits?: number
  reportType?: string
  department?: number[] | string
  relatedSystems?: number[]
  periodsAny?: number[]
  enabled?: boolean
  createdRange?: [Date, Date]
}

const DEPARTMENTS = ['销售部', '财务部', '运营部', '技术部', '市场部', '人力资源部']
const RELATED_SYSTEMS = ['CRM系统', 'ERP系统', '财务系统', '供应链系统', '人力资源系统', '数据分析平台']
const DATA_PERIODS = ['日度', '周度', '月度', '季度', '年度']

const initialFilters: Partial<Filters> = {
  keyword: '',
  minVisits: undefined,
  reportType: undefined,
  department: undefined,
  relatedSystems: [],
  enabled: undefined,
}

const filters = ref<Array<FilterField<Filters>>>([
  { key: 'keyword', label: '关键字', kind: 'input', placeholder: '报表名称关键字', clearable: true },
  {
    key: 'minVisits',
    label: '最小访问量',
    kind: 'number',
    componentProps: {
      min: 0,
      step: 100,
      controls: true,
      clearable: true // 不生效
    },
    normalize: (val) => {
      const n = Number(val)
      return Number.isFinite(n) ? n : undefined as any
    },
  },
  {
    key: 'reportType',
    label: '报表类型',
    kind: 'select',
    clearable: true,
    loadOptions: async () => {
      const list = await getReportTypes()
      return (Array.isArray(list) ? list : []).map((t: string) => ({ label: t, value: t }))
    },
  },
  {
    key: 'department',
    label: '所属部门',
    kind: 'multi-select',
    clearable: true,
    options: DEPARTMENTS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: 'relatedSystems',
    label: '关联系统',
    kind: 'checkbox-group',
    clearable: true,
    options: RELATED_SYSTEMS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: 'periodsAny',
    label: '周期(多选)',
    kind: 'checkbox-group',
    checkboxStyle: 'button',
    options: DATA_PERIODS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: 'enabled',
    label: '启用',
    kind: 'checkbox',
    placeholder: '仅显示启用',
  },
  {
    key: 'createdRange',
    label: '创建时间',
    kind: 'daterange',
    clearable: true,
    normalize: (val) => {
      if (!Array.isArray(val) || val.length !== 2) return undefined
      const [start, end] = val
      const startDate = start instanceof Date ? start : new Date(start as any)
      const endDate = end instanceof Date ? end : new Date(end as any)
      if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return undefined
      return [startDate, endDate]
    },
  },
])

const columns = ref<Array<TableColumn<Row>>>([
  { key: 'reportId', title: 'ID', width: 90, sortable: 'server' },
  { key: 'reportName', title: '报表名称', minWidth: 220, sortable: 'server' },
  { key: 'reportType', title: '类型', width: 120 },
  { key: 'department', title: '部门', width: 120 },
  { key: 'owner', title: '负责人', width: 120 },
  { key: 'dataPeriod', title: '周期', width: 100 },
  { key: 'enabled', title: '启用', width: 90 },
  { key: 'published', title: '发布', width: 90 },
  { key: 'visits', title: '访问量', width: 110, sortable: 'server' },
  { key: 'qualityScore', title: '质量分', width: 100, sortable: 'server' },
  {
    key: 'relatedSystems',
    title: '关联系统',
    minWidth: 180,
    renderCell: ({ value }) => Array.isArray(value) ? (value as string[]).join('、') : '',
  },
])

async function fetcher(payload: QueryPayload<Filters>) {
  const result = await getReports(payload)
  return { rows: result.rows as Row[], total: result.total }
}

async function handleBatchDelete(selection: Row[], refresh: () => void) {
  if (!selection.length) return
  const confirmed = await ElMessageBox.confirm(`确定删除选中的 ${selection.length} 条报表吗？`, '删除确认', {
    type: 'warning',
    distinguishCancelAndClose: true,
  }).then(() => true).catch(() => false)
  if (!confirmed) return
  const ids = selection.map(r => r.reportId)
  const { deleted } = await deleteReports(ids)
  ElMessage.success(`删除成功：${deleted} 条`)
  refresh()
}

async function handleRowDelete(row: Row) {
  const confirmed = await ElMessageBox.confirm(`确定删除报表【${row.reportName}】吗？`, '删除确认', {
    type: 'warning',
    distinguishCancelAndClose: true,
  }).then(() => true).catch(() => false)
  if (!confirmed) return
  const { deleted } = await deleteReports([row.reportId])
  ElMessage.success(`删除成功：${deleted} 条`)
}
</script>

<style scoped>
</style>
