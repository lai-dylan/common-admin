<template>
  <div class="content-page">
    <div class="page-header">
      <h2 class="page-title">内容管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        发布内容
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :model="filterForm" inline @submit.prevent="handleSearch">
        <el-form-item label="标题">
          <el-input v-model="filterForm.keyword" clearable placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" clearable placeholder="请选择分类">
            <el-option label="技术文章" value="tech" />
            <el-option label="生活随笔" value="life" />
            <el-option label="产品动态" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" clearable placeholder="请选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="contentList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" min-width="100">
          <template #default="{ row }">
            <el-tag>{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" min-width="100" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" min-width="80" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" type="success" link @click="handlePublish(row)">
              发布
            </el-button>
            <el-button v-if="row.status === 'published'" type="warning" link @click="handleArchive(row)">
              归档
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { Content } from '@/types'
import {Plus} from "@element-plus/icons-vue";

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

type ElTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

function getStatusType(status: Content['status']): ElTagType {
  const types: Record<Content['status'], ElTagType> = {
    draft: 'info',
    published: 'success',
    archived: 'warning',
  }
  return types[status]
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = { draft: '草稿', published: '已发布', archived: '已归档' }
  return labels[status] || status
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
  ElMessageBox.confirm('确定要删除吗？', '确认删除', { type: 'warning' }).then(() => {
    const index = mockContents.findIndex(c => c.id === row.id)
    if (index > -1) {
      mockContents.splice(index, 1)
      ElMessage.success('操作成功')
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
      ElMessage.success('操作成功')
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
