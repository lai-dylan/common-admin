<template>
  <div class="content-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('content.title') }}</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        {{ $t('content.addContent') }}
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :model="filterForm" inline @submit.prevent="handleSearch">
        <el-form-item :label="$t('content.titleLabel')">
          <el-input v-model="filterForm.keyword" clearable placeholder="请输入标题" />
        </el-form-item>
        <el-form-item :label="$t('content.category')">
          <el-select v-model="filterForm.category" clearable placeholder="请选择分类">
            <el-option label="技术文章" value="tech" />
            <el-option label="生活随笔" value="life" />
            <el-option label="产品动态" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('content.status')">
          <el-select v-model="filterForm.status" clearable placeholder="请选择状态">
            <el-option :label="$t('content.draft')" value="draft" />
            <el-option :label="$t('content.published')" value="published" />
            <el-option :label="$t('content.archived')" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="contentList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column :label="$t('content.titleLabel')" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" :underline="false">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" :label="$t('content.category')" min-width="100">
          <template #default="{ row }">
            <el-tag>{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" :label="$t('content.author')" min-width="100" />
        <el-table-column :label="$t('content.status')" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ $t(`content.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" :label="$t('content.views')" min-width="80" />
        <el-table-column prop="createdAt" :label="$t('user.createdAt')" min-width="160" />
        <el-table-column :label="$t('user.actions')" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button v-if="row.status === 'draft'" type="success" link @click="handlePublish(row)">
              发布
            </el-button>
            <el-button v-if="row.status === 'published'" type="warning" link @click="handleArchive(row)">
              归档
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? $t('content.editContent') : $t('content.addContent')" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item :label="$t('content.titleLabel')" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item :label="$t('content.category')" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="技术文章" value="tech" />
            <el-option label="生活随笔" value="life" />
            <el-option label="产品动态" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('content.contentBody')" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="8" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { Content } from '@/types'

const { t } = useI18n()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const contentList = ref<Content[]>([])

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const filterForm = reactive({ keyword: '', category: '', status: '' })

const formData = reactive({
  id: 0,
  title: '',
  category: 'tech',
  content: '',
  status: 'draft' as 'draft' | 'published' | 'archived',
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const categories = { tech: '技术文章', life: '生活随笔', product: '产品动态' }

const mockContents: Content[] = [
  { id: 1, title: 'Vue3 最佳实践指南', category: 'tech', author: '张三', status: 'published', views: 1234, createdAt: '2024-01-10 10:00:00', publishedAt: '2024-01-10 10:30:00' },
  { id: 2, title: 'TypeScript 入门教程', category: 'tech', author: '李四', status: 'published', views: 856, createdAt: '2024-01-08 14:20:00', publishedAt: '2024-01-08 15:00:00' },
  { id: 3, title: '我的周末生活', category: 'life', author: '王五', status: 'draft', views: 0, createdAt: '2024-01-12 09:15:00' },
  { id: 4, title: '产品更新日志 v2.0', category: 'product', author: '赵六', status: 'published', views: 2345, createdAt: '2024-01-05 16:00:00', publishedAt: '2024-01-05 16:30:00' },
  { id: 5, title: 'Vite 构建工具详解', category: 'tech', author: '张三', status: 'archived', views: 567, createdAt: '2023-12-20 11:00:00', publishedAt: '2023-12-20 11:30:00' },
]

function getCategoryLabel(cat: string) {
  return categories[cat as keyof typeof categories] || cat
}

function getStatusType(status: string) {
  const types: Record<string, string> = { draft: 'info', published: 'success', archived: 'warning' }
  return types[status] || 'info'
}

function loadData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockContents]
    if (filterForm.keyword) {
      filtered = filtered.filter(c => c.title.includes(filterForm.keyword))
    }
    if (filterForm.category) {
      filtered = filtered.filter(c => c.category === filterForm.category)
    }
    if (filterForm.status) {
      filtered = filtered.filter(c => c.status === filterForm.status)
    }
    pagination.total = filtered.length
    contentList.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 300)
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  Object.assign(filterForm, { keyword: '', category: '', status: '' })
  handleSearch()
}

function handleAdd() {
  isEdit.value = false
  Object.assign(formData, { id: 0, title: '', category: 'tech', content: '', status: 'draft' })
  dialogVisible.value = true
}

function handleEdit(row: Content) {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

function handlePublish(row: Content) {
  row.status = 'published'
  row.publishedAt = new Date().toLocaleString()
  ElMessage.success('发布成功')
}

function handleArchive(row: Content) {
  row.status = 'archived'
  ElMessage.success('归档成功')
}

function handleDelete(row: Content) {
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirmDeleteTitle'), { type: 'warning' }).then(() => {
    const index = mockContents.findIndex(c => c.id === row.id)
    if (index > -1) {
      mockContents.splice(index, 1)
      ElMessage.success(t('common.success'))
      loadData()
    }
  })
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockContents.findIndex(c => c.id === formData.id)
        if (index > -1) Object.assign(mockContents[index], formData)
      } else {
        mockContents.unshift({ ...formData, id: Math.max(...mockContents.map(c => c.id)) + 1, author: '当前用户', views: 0, createdAt: new Date().toLocaleString() })
      }
      submitLoading.value = false
      dialogVisible.value = false
      ElMessage.success(t('common.success'))
      loadData()
    }, 500)
  })
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.content-page {
  .filter-card { margin-bottom: 20px; }
  .pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
}
</style>
