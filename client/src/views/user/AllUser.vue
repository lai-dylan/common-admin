<template>
  <div class="user-page">
    <div class="page-header">
      <h2 class="page-title">全部用户</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus/>
        </el-icon>
        新增用户
      </el-button>
    </div>

    <!--    <el-card class="filter-card">-->
    <el-form :model="filterForm" inline @submit.prevent="handleSearch">
      <el-form-item label="用户名">
        <el-input
            v-model="filterForm.keyword"
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filterForm.status" placeholder="状态" clearable>
          <el-option label="全部" value=""/>
          <el-option label="启用" :value="1"/>
          <el-option label="禁用" :value="0"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon>
            <Search/>
          </el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon>
            <Refresh/>
          </el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <!--    </el-card>-->

    <!--    <el-card class="table-card">-->
    <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50"/>
      <el-table-column prop="id" label="ID" width="80"/>
      <el-table-column label="用户名" min-width="120">
        <template #default="{ row }">
          <div class="user-info-cell">
            <el-avatar :size="32" :src="row.avatar"/>
            <span>{{ row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="150"/>
      <el-table-column prop="phone" label="手机号" min-width="120"/>
      <el-table-column prop="role" label="角色" min-width="100"/>
      <el-table-column label="状态" min-width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160"/>
      <el-table-column label="操作" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
    <!--    </el-card>-->

    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑用户' : '新增用户'"
        width="500px"
        @closed="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone"/>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.roleId">
            <el-option label="超级管理员" :value="1"/>
            <el-option label="管理员" :value="2"/>
            <el-option label="普通用户" :value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" show-password/>
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
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import {ElMessage, ElMessageBox, type FormInstance, type FormRules} from "element-plus";
import type {User} from "@/types";
import {Plus, Refresh, Search} from "@element-plus/icons-vue";

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const selectedIds = ref<number[]>([]);

const userList = ref<User[]>([]);
const formRef = ref<FormInstance>();

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const filterForm = reactive({
  keyword: "",
  status: "",
});

const formData = reactive({
  id: 0,
  username: "",
  email: "",
  phone: "",
  roleId: 3,
  status: 1 as 0 | 1,
  password: "",
});

const formRules: FormRules = {
  username: [
    {required: true, message: "用户名不能为空", trigger: "blur"},
    {min: 3, max: 20, message: "用户名长度在3-20个字符", trigger: "blur"},
  ],
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {type: "email", message: "请输入正确的邮箱格式", trigger: "blur"},
  ],
  password: [
    {required: true, message: "请输入密码", trigger: "blur"},
    {min: 6, message: "密码长度至少6位", trigger: "blur"},
  ],
};

function generateMockUsers(): User[] {
  const roles = ["超级管理员", "管理员", "普通用户"];
  const users: User[] = [];
  for (let i = 1; i <= 50; i++) {
    users.push({
      id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      phone: `13800138${String(i).padStart(4, "0")}`,
      avatar: `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`,
      role: roles[i % 3],
      roleId: (i % 3) + 1,
      status: i % 4 === 0 ? 0 : 1,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
    });
  }
  return users;
}

const mockUsers = generateMockUsers();

function loadData() {
  loading.value = true;
  setTimeout(() => {
    let filtered = [...mockUsers];

    if (filterForm.keyword) {
      filtered = filtered.filter(
          u => u.username.includes(filterForm.keyword) || u.email.includes(filterForm.keyword)
      );
    }
    if (filterForm.status !== "") {
      filtered = filtered.filter(u => u.status === Number(filterForm.status));
    }

    pagination.total = filtered.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    userList.value = filtered.slice(start, start + pagination.pageSize);
    loading.value = false;
  }, 300);
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  filterForm.keyword = "";
  filterForm.status = "";
  handleSearch();
}

function handleAdd() {
  isEdit.value = false;
  dialogVisible.value = true;
}

function handleEdit(row: User) {
  isEdit.value = true;
  Object.assign(formData, row);
  dialogVisible.value = true;
}

function handleDelete(row: User) {
  ElMessageBox.confirm("确定要删除吗？", "确认删除", {type: "warning"}).then(() => {
    const index = mockUsers.findIndex(u => u.id === row.id);
    if (index > -1) {
      mockUsers.splice(index, 1);
      ElMessage.success("操作成功");
      loadData();
    }
  });
}

function handleSelectionChange(selection: User[]) {
  selectedIds.value = selection.map(u => u.id);
}

function handleDialogClose() {
  formRef.value?.resetFields();
  Object.assign(formData, {
    id: 0,
    username: "",
    email: "",
    phone: "",
    roleId: 3,
    status: 1,
    password: "",
  });
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return;

    submitLoading.value = true;
    setTimeout(() => {
      if (isEdit.value) {
        const index = mockUsers.findIndex(u => u.id === formData.id);
        if (index > -1) {
          Object.assign(mockUsers[index], formData);
        }
      } else {
        mockUsers.unshift({
          ...formData,
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          role: ["普通用户", "管理员", "超级管理员"][formData.roleId - 1],
          createdAt: new Date().toLocaleString(),
          avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
      }
      submitLoading.value = false;
      dialogVisible.value = false;
      ElMessage.success("操作成功");
      loadData();
    }, 500);
  });
}

onMounted(() => {
  loadData();
});
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
