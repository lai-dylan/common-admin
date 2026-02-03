<template>
  <div class="role-page">
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
    >
      <template #row-actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="() => { }">
          删除
        </el-button>
      </template>
    </CommonTable>

    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑角色' : '新增角色'"
        width="600px"
        @closed="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name"/>
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" :disabled="isEdit"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3"/>
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
import {Plus} from "@element-plus/icons-vue";
import type {FilterField, QueryPayload, RowAction, TableColumn, TableAction} from "@/components/common/crud-table/types";
import type {Role} from "@/types";
import {getRoles, createRole, updateRole, deleteRole} from "@/api/role";

const tableRef = ref();
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const initialFilters = {
  keyword: "",
};

const filterConfigs = computed<FilterField<typeof initialFilters>[]>(() => [
  {
    key: "keyword",
    label: "角色名称",
    kind: "input",
    placeholder: "请输入角色名称或编码",
    clearable: true,
  },
]);

const columnConfigs = computed<TableColumn<Role>[]>(() => [
  {key: "id", title: "ID", width: 80},
  {
    key: "name",
    title: "角色名称",
    minWidth: 120,
    renderCell: ({value}) => (<el-tag>{value}</el-tag>),
  },
  {key: "code", title: "角色编码", minWidth: 120},
  {key: "description", title: "描述", minWidth: 200},
  {
    key: "status",
    title: "状态",
    minWidth: 100,
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
    label: "新增角色",
    action: () => handleAdd(),
  },
];

const rowActions: RowAction<Role>[] = [
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
  name: "",
  code: "",
  description: "",
  permissions: [] as string[],
  status: 1 as 0 | 1,
});

const formRules: FormRules = {
  name: [{required: true, message: "请输入角色名称", trigger: "blur"}],
  code: [{required: true, message: "请输入角色编码", trigger: "blur"}],
};

async function fetcher(payload: QueryPayload<typeof initialFilters>) {
  const {page, pageSize} = payload.pagination;
  const {keyword} = payload.filters;
  const res = await getRoles({
    page,
    pageSize,
    keyword,
  });
  return {
    rows: res.data.list,
    total: res.data.total,
  };
}

function handleAdd() {
  isEdit.value = false;
  Object.assign(formData, {
    id: 0,
    name: "",
    code: "",
    description: "",
    permissions: [],
    status: 1,
  });
  dialogVisible.value = true;
}

function handleEdit(row: Role) {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    permissions: row.permissions,
    status: row.status,
  });
  dialogVisible.value = true;
}

function handleDelete(row: Role) {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, "确认删除", {type: "warning"})
      .then(async () => {
        await deleteRole(row.id);
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
    name: "",
    code: "",
    description: "",
    permissions: [],
    status: 1,
  });
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const data = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      permissions: formData.permissions,
      status: formData.status,
    };
    
    if (isEdit.value) {
      await updateRole(formData.id, data);
    } else {
      await createRole(data);
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
.role-page {
  /* No styles needed for now */
}
</style>
