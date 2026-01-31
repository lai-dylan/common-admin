<template>
  <div class="role-page">
    <div class="page-header">
      <h2 class="page-title">角色权限</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :model="filterForm" inline @submit.prevent="handleSearch">
        <el-form-item label="角色名称">
          <el-input v-model="filterForm.keyword" clearable placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="roleList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="角色名称" min-width="120">
          <template #default="{ row }">
            <el-tag>{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="formData.permissions">
            <el-checkbox label="user:all">用户列表</el-checkbox>
            <el-checkbox label="user:add">新增用户</el-checkbox>
            <el-checkbox label="user:edit">编辑用户</el-checkbox>
            <el-checkbox label="user:delete">删除用户</el-checkbox>
            <el-checkbox label="role:list">角色列表</el-checkbox>
            <el-checkbox label="role:add">新增角色</el-checkbox>
            <el-checkbox label="content:list">内容列表</el-checkbox>
            <el-checkbox label="content:add">发布内容</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import type { Role } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const roleList = ref<Role[]>([])

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const filterForm = reactive({ keyword: '' })

const formData = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
  status: 1 as 0 | 1,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

const mockRoles: Role[] = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, permissions: ['*'], createdAt: '2024-01-01 00:00:00' },
  { id: 2, name: '管理员', code: 'manager', description: '管理大部分功能', status: 1, permissions: ['user:*', 'role:list'], createdAt: '2024-01-05 10:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '基础用户权限', status: 1, permissions: ['content:list'], createdAt: '2024-01-10 15:30:00' },
  { id: 4, name: '编辑', code: 'editor', description: '内容编辑权限', status: 1, permissions: ['content:list', 'content:add', 'content:edit'], createdAt: '2024-01-12 09:20:00' },
]

function loadData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockRoles]
    if (filterForm.keyword) {
      filtered = filtered.filter(r => r.name.includes(filterForm.keyword) || r.code.includes(filterForm.keyword))
    }
    pagination.total = filtered.length
    roleList.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 300)
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  filterForm.keyword = ''
  handleSearch()
}

function handleAdd() {
  isEdit.value = false
  dialogVisible.value = true
}

function handleEdit(row: Role) {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

function handleDelete(row: Role) {
  ElMessageBox.confirm('确定要删除吗？', '确认删除', { type: 'warning' }).then(() => {
    const index = mockRoles.findIndex(r => r.id === row.id)
    if (index > -1) {
      mockRoles.splice(index, 1)
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
        const index = mockRoles.findIndex(r => r.id === formData.id)
        if (index > -1) Object.assign(mockRoles[index], formData)
      } else {
        mockRoles.unshift({ ...formData, id: Math.max(...mockRoles.map(r => r.id)) + 1, createdAt: new Date().toLocaleString() })
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
.role-page {
  .filter-card { margin-bottom: 20px; }
  .pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
}
</style>
