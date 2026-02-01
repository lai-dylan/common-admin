<template>
  <div class="common-table-demo-page">
    <div class="page-header">
      <h2 class="page-title">通用表格组件</h2>
      <div class="header-actions">
        <div class="switch-item">
          <span>模拟网络异常</span>
          <el-switch v-model="simulateError" />
        </div>
        <div class="switch-item">
          <span>权限列</span>
          <el-switch v-model="allowSecret" />
        </div>
        <div class="switch-item">
          <span>高级筛选</span>
          <el-switch v-model="showAdvanced" />
        </div>
        <div class="switch-item">
          <span>虚拟滚动</span>
          <el-switch v-model="virtualized" />
        </div>
      </div>
    </div>

    <CommonTable
      :column-configs="columnConfigs"
      :filter-configs="filterConfigs"
      :initial-filters="initialFilters"
      :fetcher="fetcher"
      :table-actions="tableActions"
      :row-actions="rowActions"
      :selectable="true"
      :page-sizes="[10, 20, 50]"
      :virtualized="virtualized"
      row-key="id"
    />
  </div>
</template>

<script setup lang="tsx">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import CommonTable from '@/components/common/crud-table/CommonTable.vue'
import type { FilterField, QueryPayload, RowAction, TableColumn, TableAction } from '@/components/common/crud-table/types'

type DemoStatus = 'active' | 'disabled' | 'pending'

type DemoRow = Record<string, unknown> & {
  id: number
  name: string
  status: DemoStatus
  owner: string
  amount: number
  description: string
  createdAt: string
  tags: string[]
  secret: string
}

type DemoFilters = Record<string, unknown> & {
  keyword?: string
  status?: DemoStatus
  owner?: string
  tags?: string[]
  dateRange?: [string, string]
  priority?: string
}

const simulateError = ref(false)
const allowSecret = ref(false)
const showAdvanced = ref(false)
const virtualized = ref(false)

const dataSource = ref<DemoRow[]>(createRows())

const initialFilters: Partial<DemoFilters> = {
  status: 'active',
}

const tableActions: TableAction[] = [
  {
    key: 'batch-delete',
    label: '批量删除',
    kind: 'dangerButton',
    disabled: ((selection: unknown[]) => selection.length > 0) as unknown as boolean,
    async action({ selection, refresh }) {
      const rows = selection as DemoRow[]
      if (rows.length === 0) return
      try {
        ElMessage.success('删除成功')
        await refresh()
      } catch {
        ElMessage.error('删除失败')
      }
    },
  },
  {
    key: 'export',
    label: '导出',
    action() {
      console.log('Export clicked')
      // Implement export logic
    },
  },
  {
    key: 'refresh',
    label: '刷新',
    action({ refresh }) {
      refresh()
    },
  },
]

const rowActions: RowAction<DemoRow>[] = [
  {
    key: 'edit',
    label: '编辑',
    action({ row }) {
      console.log('Edit row:', row)
      // Implement edit logic
    },
  },
  {
    key: 'delete',
    label: '删除',
    danger: true,
    async action({ refresh }) {
      try {
        ElMessage.success('删除成功')
        refresh()
      } catch {
        ElMessage.error('删除失败')
      }
    },
  },
  // {
  //   key: 'view',
  //   label: '查看',
  //   action({ row }) {
  //     console.log('View row:', row)
  //     // Implement view logic
  //   },
  // },
]

const columnConfigs = computed<TableColumn<DemoRow>[]>(() => [
  { key: 'id', title: 'ID', width: 80 },
  {
    key: 'name',
    title: '名称',
    minWidth: 160,
    sortable: 'server',
    editable: true,
    editKind: 'input',
    editPlaceholder: '请输入名称',
    editRules: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  },
  {
    key: 'status',
    title: '状态',
    minWidth: 120,
    editable: true,
    editKind: 'select',
    editOptions: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'disabled' },
      { label: '待定', value: 'pending' },
    ],
    renderCell: ({ value }) => {
      if (value === 'active') return '启用'
      if (value === 'disabled') return '禁用'
      return '待定'
    },
  },
  {
    key: 'owner',
    title: '负责人',
    minWidth: 140,
    editable: true,
    editKind: 'input',
  },
  {
    key: 'amount',
    title: '金额',
    minWidth: 120,
    sortable: 'server',
    editable: true,
    editKind: 'number',
  },
  {
    key: 'description',
    title: '描述',
    minWidth: 260,
    editable: true,
    editKind: 'textarea',
    renderCell: ({ value }) => value as string,
  },
  {
    key: 'tags',
    title: '标签',
    minWidth: 160,
    renderCell: ({ value }) => (Array.isArray(value) ? value.join(' / ') : ''),
  },
  {
    key: 'createdAt',
    title: '创建时间',
    minWidth: 180,
    sortable: 'server',
    editable: true,
    editKind: 'date',
  },
  {
    key: 'secret',
    title: '权限字段',
    minWidth: 160,
    permission: () => allowSecret.value,
  },
])

const filterConfigs = computed<FilterField<DemoFilters>[]>(() => [
  {
    key: 'keyword',
    label: '关键词',
    kind: 'input',
    placeholder: '名称或描述',
    clearable: true,
  },
  {
    key: 'status',
    label: '状态',
    kind: 'select',
    clearable: true,
    loadOptions: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'disabled' },
        { label: '待定', value: 'pending' },
      ]
    },
    autoSelectFirst: true,
    applyDefaultTiming: 'optionsReady',
  },
  {
    key: 'owner',
    label: '负责人',
    kind: 'select',
    clearable: true,
    loadOptions: async () => {
      await sleep(200)
      return [
        { label: '李雷', value: '李雷' },
        { label: '韩梅梅', value: '韩梅梅' },
        { label: '王一', value: '王一' },
      ]
    },
  },
  {
    key: 'tags',
    label: '标签',
    kind: 'multi-select',
    clearable: true,
    loadOptions: async () => {
      await sleep(200)
      return [
        { label: '高优先级', value: 'P0' },
        { label: '中优先级', value: 'P1' },
        { label: '低优先级', value: 'P2' },
      ]
    },
  },
  {
    key: 'dateRange',
    label: '创建时间',
    kind: 'daterange',
    clearable: true,
  },
  {
    key: 'priority',
    label: '高级筛选',
    kind: 'select',
    permission: () => showAdvanced.value,
    clearable: true,
    options: [
      { label: '紧急', value: 'urgent' },
      { label: '普通', value: 'normal' },
    ],
  },
])

async function fetcher(payload: QueryPayload<DemoFilters>) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (simulateError.value) {
    throw new Error('模拟网络异常')
  }
  let result = [...dataSource.value]
  const { keyword, status, owner, tags, dateRange } = payload.filters
  if (keyword) {
    const key = keyword.toLowerCase()
    result = result.filter(row => row.name.toLowerCase().includes(key) || row.description.toLowerCase().includes(key))
  }
  if (status) {
    result = result.filter(row => row.status === status)
  }
  if (owner) {
    result = result.filter(row => row.owner === owner)
  }
  if (tags && tags.length > 0) {
    result = result.filter(row => tags.every(tag => row.tags.includes(tag)))
  }
  if (dateRange && dateRange[0] && dateRange[1]) {
    const start = new Date(dateRange[0]).getTime()
    const end = new Date(dateRange[1]).getTime()
    result = result.filter(row => {
      const value = new Date(row.createdAt).getTime()
      return value >= start && value <= end
    })
  }
  if (payload.sort) {
    const { prop, order } = payload.sort
    result.sort((a, b) => {
      const left = a[prop as keyof DemoRow]
      const right = b[prop as keyof DemoRow]
      if (typeof left === 'number' && typeof right === 'number') {
        return order === 'asc' ? left - right : right - left
      }
      const leftText = String(left)
      const rightText = String(right)
      return order === 'asc' ? leftText.localeCompare(rightText) : rightText.localeCompare(leftText)
    })
  }
  const startIndex = (payload.pagination.page - 1) * payload.pagination.pageSize
  const endIndex = startIndex + payload.pagination.pageSize
  return {
    rows: result.slice(startIndex, endIndex),
    total: result.length,
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function createRows(): DemoRow[] {
  const owners = ['李雷', '韩梅梅', '王一']
  const statuses: DemoStatus[] = ['active', 'disabled', 'pending']
  const tags = ['P0', 'P1', 'P2']
  return Array.from({ length: 42 }).map((_, index) => ({
    id: index + 1,
    name: `任务 ${index + 1}`,
    status: statuses[index % statuses.length],
    owner: owners[index % owners.length],
    amount: Math.round(Math.random() * 10000),
    description:
      index % 3 === 0
        ? '这是一个超长描述，用来模拟极限文本展示效果，包含较多内容以测试布局稳定性和换行表现。'
        : '常规描述信息',
    createdAt: `2024-02-${String((index % 28) + 1).padStart(2, '0')}`,
    tags: [tags[index % tags.length]],
    secret: '仅有权限可见',
  }))
}
</script>

<style lang="scss" scoped>
.common-table-demo-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}
</style>
