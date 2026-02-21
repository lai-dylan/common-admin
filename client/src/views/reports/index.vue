<template>
  <div class="h-full p-4">
    <TableContainer
      :column-configs="columns"
      :filter-configs="filters"
      :initial-filters="initialFilters"
      row-key="reportId"
      :fetcher="fetcher"
      :table-actions="tableActions"
      :row-actions="rowActions"
      :full-height="true"
    />
  </div>
</template>

<script setup lang="tsx">
import { deleteReports, getReports, getReportTypes } from "@/api/reports";
import TableContainer from "@/components/common/table-container/index.vue";
import type {
  FilterField,
  QueryPayload,
  RowAction,
  TableAction,
  TableColumn,
} from "@/components/common/types";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed } from "vue";

type Row = {
  reportId: number;
  reportName: string;
  reportType: string;
  department: string;
  owner: string;
  dataPeriod: string;
  enabled: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  visits: number;
  qualityScore: number;
  relatedSystems: string[];
};

type Filters = {
  keyword?: string;
  minVisits?: number;
  reportType?: string;
  department?: number[] | string;
  relatedSystems?: number[];
  periodsAny?: number[];
  enabled?: boolean;
  createdRange?: [Date, Date];
};

const DEPARTMENTS = ["销售部", "财务部", "运营部", "技术部", "市场部", "人力资源部"];
const RELATED_SYSTEMS = [
  "CRM系统",
  "ERP系统",
  // "财务系统",
  // "供应链系统",
  // "人力资源系统",
  // "数据分析平台",
];
const DATA_PERIODS = ["日度", "周度", "月度", "季度", "年度"];

const initialFilters = () => {
  return {
    // keyword: "市场",
    // enabled: true,
  };
};

const filters = computed<Array<FilterField>>(() => [
  {
    key: "keyword",
    label: "关键字",
    kind: "input",
    placeholder: "报表名称关键字",
    clearable: true,
  },
  {
    key: "minVisits",
    label: "最小访问量",
    kind: "number",
    componentProps: {
      min: 0,
      step: 100,
      controls: false,
    },
    // 自定义数据处理
    // normalize: (val) => {
    //   if (val === null) return undefined;
    // },
  },
  {
    key: "reportType",
    label: "报表类型",
    kind: "select",
    clearable: true,
    loadOptions: async () => {
      const list = await getReportTypes();
      return (Array.isArray(list) ? list : []).map((t: string) => ({ label: t, value: t }));
    },
  },
  {
    key: "department",
    label: "所属部门",
    kind: "multi-select",
    clearable: true,
    options: DEPARTMENTS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: "relatedSystems",
    label: "关联系统",
    kind: "checkbox-group",
    clearable: true,
    options: RELATED_SYSTEMS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: "periodsAny",
    label: "周期(多选)",
    kind: "checkbox-group",
    checkboxStyle: "button",
    options: DATA_PERIODS.map((t, i) => ({ label: t, value: i })),
  },
  {
    key: "enabled",
    label: "启用",
    kind: "checkbox",
    placeholder: "仅显示启用",
  },
  {
    key: "createdRange",
    label: "创建时间",
    kind: "daterange",
    clearable: true,
    normalize: (val) => {
      if (!Array.isArray(val) || val.length !== 2) return undefined;
      const [start, end] = val;
      const startDate = start instanceof Date ? start : new Date(String(start));
      const endDate = end instanceof Date ? end : new Date(String(end));
      if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()))
        return undefined;
      return [startDate, endDate];
    },
  },
]);

const columns = computed<Array<TableColumn>>(() => [
  {
    key: "reportId",
    label: "ID",
    width: 90,
    sortable: "server",
  },
  { key: "reportName", label: "报表名称", minWidth: 220, sortable: "server" },
  { key: "reportType", label: "类型", width: 120 },
  {
    key: "department",
    label: "部门",
    // label: () => {
    //   return (
    //     <div class="flex flex-col">
    //       <div>部门</div>
    //       <div>(一级)</div>
    //     </div>
    //   );
    // },
    width: 120,
    // renderCell: (ctx) => {
    //   console.log(ctx);
    //   return <span>@{ctx.row.department}</span>;
    // },
  },
  { key: "owner", label: "负责人", width: 120 },
  { key: "dataPeriod", label: "周期", width: 100 },
  { key: "enabled", label: "启用", width: 90 },
  { key: "published", label: "发布", width: 90 },
  { key: "visits", label: "访问量", width: 110, sortable: "server" },
  { key: "qualityScore", label: "质量分", width: 100, sortable: "server" },
  {
    key: "relatedSystems",
    label: "关联系统",
    minWidth: 180,
    renderCell: ({ row }) => (
      <span>{Array.isArray(row.relatedSystems) ? row.relatedSystems.join("、") : ""}</span>
    ),
  },
]);

async function fetcher(payload: QueryPayload<Filters>) {
  const result = await getReports(payload);
  return { rows: result.rows as Row[], total: result.total };
}

const tableActions = computed<TableAction[]>(() => [
  {
    key: "batch-delete",
    label: "批量删除",
    type: "danger",
    disabled: () => true,
    action: async ({ selection, refresh }) => {
      if (!selection.length) return;
      const confirmed = await ElMessageBox.confirm(
        `确定删除选中的 ${selection.length} 条报表吗？`,
        "删除确认",
        {
          type: "warning",
          distinguishCancelAndClose: true,
        },
      )
        .then(() => true)
        .catch(() => false);
      if (!confirmed) return;
      const ids = selection.map((r) => r.reportId);
      const { deleted } = await deleteReports(ids);
      ElMessage.success(`删除成功：${deleted} 条`);
      refresh();
    },
  },
]);

const rowActions = computed<RowAction[]>(() => [
  {
    key: "delete",
    label: "删除",
    type: "danger",
    action: async ({ row, refresh }) => {
      const confirmed = await ElMessageBox.confirm(
        `确定删除报表【${row.reportName}】吗？`,
        "删除确认",
        {
          type: "warning",
          distinguishCancelAndClose: true,
        },
      )
        .then(() => true)
        .catch(() => false);
      if (!confirmed) return;
      const { deleted } = await deleteReports([row.reportId]);
      ElMessage.success(`删除成功：${deleted} 条`);
      refresh();
    },
  },
]);
</script>

<style scoped></style>
