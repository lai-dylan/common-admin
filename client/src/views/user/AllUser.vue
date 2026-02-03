<template>
  <div class="user-page">
    <CommonTable
        ref="tableRef"
        :column-configs="columnConfigs"
        :filter-configs="filterConfigs"
        :initial-filters="initialFilters"
        :fetcher="fetcher"
        :table-actions="tableActions"
        :row-actions="rowActions"
        :selectable="true"
        :page-sizes="[10, 20, 50]"
        row-key="id"
        full-height
    >
      <template #row-actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </CommonTable>

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
        <el-form-item label="角色" prop="roleId">
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

<script setup lang="tsx">
import {ref, reactive, computed} from "vue";
import {ElMessage, ElMessageBox, type FormInstance, type FormRules} from "element-plus";
import type {FilterField, QueryPayload, RowAction, TableColumn, TableAction} from "@/components/common/crud-table/types";
import type {User} from "@/types";
import {getUsers, createUser, updateUser, deleteUser, batchDeleteUsers} from "@/api/user";

const tableRef = ref();
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const initialFilters = {
  keyword: "",
  status: undefined as 0 | 1 | undefined,
  roleId: undefined as number | undefined,
  createdRange: undefined as [string, string] | undefined,
};

const filterConfigs = computed<FilterField<typeof initialFilters>[]>(() => [
  {
    key: "keyword",
    label: "搜索",
    kind: "input",
    placeholder: "用户名/邮箱/手机号",
    clearable: true,
  },
  {
    key: "roleId",
    label: "角色",
    kind: "select",
    placeholder: "请选择角色",
    clearable: true,
    options: [
      {label: "超级管理员", value: 1},
      {label: "管理员", value: 2},
      {label: "普通用户", value: 3},
    ],
  },
  {
    key: "status",
    label: "状态",
    kind: "select",
    placeholder: "状态",
    clearable: true,
    options: [
      {label: "启用", value: 1},
      {label: "禁用", value: 0},
    ],
  },
  {
    key: "createdRange",
    label: "注册时间",
    kind: "daterange",
    placeholder: "请选择时间范围",
    clearable: true,
  },
]);

const columnConfigs = computed<TableColumn<User>[]>(() => [
  {key: "id", title: "ID", width: 80},
  {
    key: "username",
    title: "用户名",
    minWidth: 120,
    renderCell: ({row}) => (
        <div class="flex items-center gap-1">
          <div><el-avatar size={32} src={row.avatar}/></div>
          <div>{row.username}</div>
        </div>
    ),
  },
  {key: "email", title: "邮箱", minWidth: 150},
  {key: "phone", title: "手机号", minWidth: 120},
  {key: "role", title: "角色", minWidth: 100},
  {
    key: "status",
    title: "状态",
    minWidth: 80,
    renderCell: ({value}) => (
        <el-tag type={value === 1 ? "success" : "danger"}>
          {value === 1 ? "启用" : "禁用"}
        </el-tag>
    ),
  },
  {key: "createdAt", title: "创建时间", minWidth: 160},
]);

const tableActions: TableAction[] = [
  {
    key: "add",
    label: "新增用户",
    action: () => handleAdd(),
  },
  {
    key: "batch-delete",
    label: "批量删除",
    kind: "dangerButton",
    disabled: (selection) => selection.length === 0,
    async action({selection, refresh}) {
      if (selection.length === 0) return;
      try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selection.length} 个用户吗？`, "确认删除", {type: "warning"});
        const ids = (selection as User[]).map((u: User) => u.id);
        await batchDeleteUsers(ids);
        ElMessage.success("删除成功");
        await refresh();
      } catch {
        // 用户取消
      }
    },
  },
];

const rowActions: RowAction<User>[] = [
  {
    key: "edit",
    label: "编辑",
    action: ({row}) => handleEdit(row),
  },
  {
    key: "delete",
    label: "删除",
    danger: true,
    action: ({row}) => handleDelete(row),
  },
];

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

async function fetcher(payload: QueryPayload<typeof initialFilters>) {
  const {page, pageSize} = payload.pagination;
  const {keyword, status, roleId, createdRange} = payload.filters;
  const params: any = {
    page,
    pageSize,
    keyword,
    status: status !== undefined ? String(status) : undefined,
    roleId,
  };
  if (createdRange && createdRange.length === 2) {
    params.dateStart = createdRange[0];
    params.dateEnd = createdRange[1];
  }
  const res = await getUsers(params);
  return {
    rows: res.data.list,
    total: res.data.total,
  };
}

function handleAdd() {
  isEdit.value = false;
  Object.assign(formData, {
    id: 0,
    username: "",
    email: "",
    phone: "",
    roleId: 3,
    status: 1,
    password: "",
  });
  dialogVisible.value = true;
}

function handleEdit(row: User) {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    roleId: row.roleId,
    status: row.status,
    password: "",
  });
  dialogVisible.value = true;
}

function handleDelete(row: User) {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, "确认删除", {type: "warning"})
      .then(async () => {
        await deleteUser(row.id);
        ElMessage.success("删除成功");
        await tableRef.value?.refresh();
      })
      .catch(() => {
        // 用户取消
      });
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

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const roleMap = {1: '超级管理员', 2: '管理员', 3: '普通用户'};
    const data = {
      ...formData,
      role: roleMap[formData.roleId as keyof typeof roleMap],
    };
    
    if (isEdit.value) {
      await updateUser(formData.id, data);
    } else {
      await createUser(data);
    }
    dialogVisible.value = false;
    ElMessage.success("操作成功");
    await tableRef.value?.refresh();
  } finally {
    submitLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.user-page {
  height: 100%;
}
</style>
