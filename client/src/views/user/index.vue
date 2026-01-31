<template>
  <div class="user-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">{{ $t('user.title') }}</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        {{ $t('user.addUser') }}
      </el-button>
    </div>

    <!-- 过滤表单 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline @submit.prevent="handleSearch">
        <el-form-item :label="$t('user.username')">
          <el-input
            v-model="filterForm.keyword"
            :placeholder="$t('login.usernamePlaceholder')"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('user.status')">
          <el-select v-model="filterForm.status" :placeholder="$t('user.status')" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            {{ $t('common.search') }}
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column :label="$t('user.username')" min-width="120">
          <template #default="{ row }">
            <div class="user-info-cell">
              <el-avatar :size="32" :src="row.avatar" />
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" :label="$t('user.email')" min-width="150" />
        <el-table-column prop="phone" :label="$t('user.phone')" min-width="120" />
        <el-table-column prop="role" :label="$t('user.role')" min-width="100" />
        <el-table-column :label="$t('user.status')" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? $t('user.enable') : $t('user.disable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="$t('user.createdAt')" min-width="160" />
        <el-table-column :label="$t('user.actions')" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('user.editUser') : $t('user.addUser')"
      width="500px"
      @closed="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item :label="$t('user.username')" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="$t('user.email')" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item :label="$t('user.phone')" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item :label="$t('user.role')" prop="role">
          <el-select v-model="formData.roleId">
            <el-option label="超级管理员" :value="1" />
            <el-option label="管理员" :value="2" />
            <el-option label="普通用户" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEdit" :label="$t('user.password')" prop="password">
          <el-input v-model="formData.password" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('user.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">{{ $t('user.enable') }}</el-radio>
            <el-radio :label="0">{{ $t('user.disable') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { User } from '@/types'

const { t } = useI18n()

// 状态
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref<number[]>([])

const userList = ref<User[]>([])
const formRef = ref<FormInstance>()

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: '',
})

// 表单数据
const formData = reactive({
  id: 0,
  username: '',
  email: '',
  phone: '',
  roleId: 3,
  status: 1 as 0 | 1,
  password: '',
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
}

// 模拟用户数据
function generateMockUsers(): User[] {
  const roles = ['超级管理员', '管理员', '普通用户']
  const users: User[] = []
  for (let i = 1; i <= 50; i++) {
    users.push({
      id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      phone: `13800138${String(i).padStart(4, '0')}`,
      avatar: `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`,
      role: roles[i % 3],
      roleId: (i % 3) + 1,
      status: i % 4 === 0 ? 0 : 1,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
    })
  }
  return users
}

const mockUsers = generateMockUsers()

// 加载数据
function loadData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...mockUsers]
    
    // 筛选
    if (filterForm.keyword) {
      filtered = filtered.filter(u => 
        u.username.includes(filterForm.keyword) || 
        u.email.includes(filterForm.keyword)
      )
    }
    if (filterForm.status !== '') {
      filtered = filtered.filter(u => u.status === Number(filterForm.status))
    }

    // 分页
    pagination.total = filtered.length
    const start = (pagination.page - 1) * pagination.pageSize
    userList.value = filtered.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 300)
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadData()
}

// 重置
function handleReset() {
  filterForm.keyword = ''
  filterForm.status = ''
  handleSearch()
}

// 新增
function handleAdd() {
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
function handleEdit(row: User) {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
function handleDelete(row: User) {
  ElMessageBox.confirm(
    t('common.confirmDelete'),
    t('common.confirmDeleteTitle'),
    { type: 'warning' }
  ).then(() => {
    const index = mockUsers.findIndex(u => u.id === row.id)
    if (index > -1) {
      mockUsers.splice(index, 1)
      ElMessage.success(t('common.success'))
      loadData()
    }
  })
}

// 多选变化
function handleSelectionChange(selection: User[]) {
  selectedIds.value = selection.map(u => u.id)
}

// 对话框关闭
function handleDialogClose() {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: 0,
    username: '',
    email: '',
    phone: '',
    roleId: 3,
    status: 1,
    password: '',
  })
}

// 提交
function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockUsers.findIndex(u => u.id === formData.id)
        if (index > -1) {
          Object.assign(mockUsers[index], formData)
        }
      } else {
        mockUsers.unshift({
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          ...formData,
          role: ['普通用户', '管理员', '超级管理员'][formData.roleId - 1],
          createdAt: new Date().toLocaleString(),
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        })
      }
      submitLoading.value = false
      dialogVisible.value = false
      ElMessage.success(t('common.success'))
      loadData()
    }, 500)
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.user-page {
  .filter-card {
    margin-bottom: 20px;
  }

  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
