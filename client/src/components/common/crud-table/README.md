# Common Table

通用表格由 FilterPanel、DataTable、CommonTable 组成，遵循筛选与表格解耦的架构，父组件负责请求与状态编排。

## 基础用法

```vue
<template>
  <CommonTable
    :column-configs="columns"
    :filter-configs="filterFields"
    :initial-filters="initialFilters"
    :fetcher="fetcher"
    :table-actions="tableActions"
    :row-actions="rowActions"
    row-key="id"
  />
</template>

<script setup lang="ts">
import CommonTable from '@/components/common/crud-table/CommonTable.vue'
import type { FilterField, QueryPayload, TableColumn, TableAction, RowAction } from '@/components/common/crud-table/types'

interface Row {
  id: number
  name: string
  status: string
}

interface Filters {
  keyword?: string
  status?: string
}

const columns: TableColumn<Row>[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '名称', editable: true, editKind: 'input' },
  { key: 'status', title: '状态', editable: true, editKind: 'select', editOptions: [
    { label: '启用', value: 'active' },
    { label: '禁用', value: 'disabled' },
  ] },
]

const filterFields: FilterField<Filters>[] = [
  { key: 'keyword', label: '关键词', kind: 'input', clearable: true },
  { key: 'status', label: '状态', kind: 'select', clearable: true, options: [
    { label: '启用', value: 'active' },
    { label: '禁用', value: 'disabled' },
  ] },
]

const initialFilters: Partial<Filters> = { status: 'active' }

async function fetcher(payload: QueryPayload<Filters>) {
  return { rows: [], total: 0 }
}

const tableActions: TableAction[] = [
  {
    key: 'batch-delete',
    label: '批量删除',
    kind: 'dangerButton',
    async action({ selection, refresh }) {
      // 删除逻辑
      await refresh()
    },
  },
]

const rowActions: RowAction<Row>[] = [
  {
    key: 'edit',
    label: '编辑',
    action({ row }) {
      // 编辑逻辑
    },
  },
  {
    key: 'delete',
    label: '删除',
    danger: true,
    async action({ row, refresh }) {
      // 删除逻辑
      await refresh()
    },
  },
]
</script>
```

## Props

- columnConfigs: 表格列配置，支持权限控制、插槽、自定义渲染、行内编辑
- filterConfigs: 筛选字段配置，支持异步 options、默认值与字段级 loading
- initialFilters: 初始筛选值
- fetcher: 列表请求函数
- tableActions: 表格操作按钮配置
- rowActions: 行操作按钮配置
- rowKey: 行唯一标识字段或函数
- pageSizes: 分页可选页大小
- selectable: 是否支持多选
- autoQuery: 是否自动首查
- virtualized: 是否启用虚拟滚动
- virtualizedRowHeight: 虚拟滚动行高

## Events

- query-change: 列表查询参数变更
- table-action: 表格操作按钮点击
- row-action: 行操作按钮点击

## Slots

- filter-actions: 筛选区域操作按钮
- table-actions: 表格工具栏
- row-actions: 行操作
- header-{columnKey}: 表头自定义
- cell-{columnKey}: 单元格自定义
- empty: 空状态

## 性能与安全

- renderCell 必须返回 VNode 或安全字符串，避免 v-html 引入 XSS
- 表格数据量较大时建议开启 virtualized
- 删除与批量删除需在父组件二次确认
