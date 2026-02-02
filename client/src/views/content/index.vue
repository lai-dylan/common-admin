<template>
  <div class="content-page">
    <div class="page-header">
      <h2 class="page-title">内容管理</h2>
      <el-space>
        <el-checkbox v-model="showAdvanceFilters">显示高级筛选</el-checkbox>
        <el-checkbox v-model="showAuthorColumn">显示作者列</el-checkbox>
      </el-space>
    </div>

    <CommonTable
      ref="commonTableRef"
      :column-configs="columnConfigs"
      :filter-configs="filterConfigs"
      :initial-filters="initialFilters"
      :fetcher="fetcher"
      :row-key="'id'"
      :table-actions="tableActions"
      :row-actions="rowActions"
    >
      <template #table-actions>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          发布内容
        </el-button>
      </template>
    </CommonTable>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑内容' : '发布内容'" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="技术文章" value="tech" />
            <el-option label="生活随笔" value="life" />
            <el-option label="产品动态" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="8" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import CommonTable from '@/components/common/crud-table/CommonTable.vue'
import type { TableColumn, FilterField, QueryPayload, TableAction, RowAction, CommonTableExpose } from '@/components/common/crud-table/types'
import type { Content, PaginationParams, PaginationResult, ApiResponse } from '@/types'
import { getContents, createContent, updateContent, deleteContent, publishContent, archiveContent, getContentCategories } from '@/api/content'

type Filters = {
  keyword?: string
  category?: string
  status?: string
  author?: string
  createdRange?: [string, string]
}

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已归档', value: 'archived' },
];

const showAdvanceFilters = ref(false)
const showAuthorColumn = ref(true)

const initialFilters = () => ({
  keyword: '',
  category: '',
  status: '',
  author: '',
  createdRange: undefined,
})

const filterConfigs = computed<Array<FilterField<Filters>>>(() => [
  { key: 'keyword', label: '标题', kind: 'input', placeholder: '请输入标题', clearable: true },
  {
    key: 'category',
    label: '分类',
    kind: 'select',
    placeholder: '请选择分类',
    clearable: true,
    loadOptions: async () => {
      const res = await getContentCategories()
      return (res as any).data
    },
  },
  {
    key: 'status',
    label: '状态',
    kind: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: statusOptions,
  },
  {
    key: 'author',
    label: '作者',
    kind: 'input',
    placeholder: '请输入作者',
    clearable: true,
    hidden: () => !showAdvanceFilters.value,
  },
  {
    key: 'createdRange',
    label: '创建时间',
    kind: 'daterange',
    placeholder: '请选择日期范围',
    clearable: true,
    hidden: () => !showAdvanceFilters.value,
  },
])

const columnConfigs = computed<Array<TableColumn<Content>>>(() => [
  { key: 'id', title: 'ID', width: 80 },
  {
    key: 'title',
    title: '标题',
    minWidth: 200,
    renderCell: ({ value }) => <div class="font-bold text-cyan-500">{value}</div>,
  },
  {
    key: 'category',
    title: '分类',
    minWidth: 120,
    renderCell: ({ value }) => {
      const labels: Record<string, string> = { tech: '技术文章', life: '生活随笔', product: '产品动态' }
      const label = labels[String(value)] || String(value ?? '')
      return <el-tag type="info" effect="plain">{label}</el-tag>
    },
  },
  { key: 'author', title: '作者', minWidth: 120, hidden: () => !showAuthorColumn.value },
  {
    key: 'status',
    title: '状态',
    minWidth: 120,
    renderCell: ({ value }) => {
      const option = statusOptions.find((o) => o.value === value)
      const types: Record<string, string> = { draft: 'info', published: 'success', archived: 'warning' }
      return <el-tag type={types[String(value)]}>{option?.label || value}</el-tag>
    },
  },
  { key: 'views', title: '浏览量', minWidth: 100 },
  { key: 'createdAt', title: '创建时间', minWidth: 160 },
])

const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: 0,
  title: '',
  category: 'tech',
  content: '',
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

async function fetcher(payload: QueryPayload<Filters>): Promise<{ rows: Content[]; total: number }> {
  const { filters, pagination } = payload
  const params: PaginationParams & {
    keyword?: string
    status?: string
    category?: string
    author?: string
    dateStart?: string
    dateEnd?: string
  } = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    keyword: filters.keyword,
    status: filters.status,
    category: filters.category,
    author: filters.author,
  }
  if (filters.createdRange && filters.createdRange.length === 2) {
    params.dateStart = filters.createdRange[0]
    params.dateEnd = filters.createdRange[1]
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  const res = await getContents(params) as unknown as ApiResponse<PaginationResult<Content>>
  return { rows: res.data.list, total: res.data.total }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(formData, { id: 0, title: '', category: 'tech', content: '' })
  dialogVisible.value = true
}

function handleEdit(row: Content) {
  isEdit.value = true
  Object.assign(formData, { id: row.id, title: row.title, category: row.category, content: '' })
  dialogVisible.value = true
}

async function handleSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updateContent(formData.id, { title: formData.title, category: formData.category })
      } else {
        await createContent({ title: formData.title, category: formData.category })
      }
      ElMessage.success('操作成功')
      dialogVisible.value = false
      commonTableRef.value?.refresh()
    } finally {
      submitLoading.value = false
    }
  })
}

const tableActions = computed<Array<TableAction>>(() => [
  {
    key: 'batchDelete',
    label: '批量删除',
    kind: 'dangerButton',
    disabled: (selection) => selection.length === 0,
    action: ({ selection }) => {
      ElMessageBox.confirm(`确定要删除选中的 ${selection.length} 项吗？`, '批量删除', { type: 'warning' }).then(() => {
        ElMessage.success('批量删除成功')
        commonTableRef.value?.refresh()
      })
    },
  },
])

const rowActions = computed<Array<RowAction<Content>>>(() => [
  {
    key: 'edit',
    label: '编辑',
    action: ({ row }) => {
      handleEdit(row)
    },
  },
  {
    key: 'publish',
    label: '发布',
    hidden: (row) => row.status !== 'draft',
    action: async ({ row }) => {
      await publishContent(row.id)
      ElMessage.success('发布成功')
      commonTableRef.value?.refresh()
    },
  },
  {
    key: 'archive',
    label: '归档',
    hidden: (row) => row.status !== 'published',
    action: async ({ row }) => {
      await archiveContent(row.id)
      ElMessage.success('归档成功')
      commonTableRef.value?.refresh()
    },
  },
  {
    key: 'delete',
    label: '删除',
    danger: true,
    action: async ({ row }) => {
      await ElMessageBox.confirm('确定要删除吗？', '确认删除', { type: 'warning' })
      await deleteContent(row.id)
      ElMessage.success('删除成功')
      commonTableRef.value?.refresh()
    },
  },
])
const commonTableRef = ref<CommonTableExpose<any> | null>(null)
</script>

<style lang="scss" scoped>
.content-page {
  .page-header { margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
}
</style>
