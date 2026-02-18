<template>
  <div class="flex flex-col gap-6" :class="{ 'h-full': fullHeight }">
    <FilterPanel
      ref="filterPanelRef"
      :filter-configs="filterConfigs"
      :initial-filters="initialFilters"
      @update:loading="(value) => (filterLoading = value)"
      @update:initialized="(value) => (filterInitialized = value)"
      @submit="handleFilterSubmit"
      @reset="handleFilterReset"
    />

    <Table
      :class="{ 'min-h-0 flex-1': fullHeight }"
      :full-height="fullHeight"
      :column-configs="columnConfigs"
      :rows="tableState.rows.value"
      :loading="tableState.loading.value || (autoQuery && !filterInitialized)"
      :pagination="tableState.pagination"
      :sort="tableState.sortState.value"
      :row-key="rowKey"
      :page-sizes="pageSizes"
      :selectable="selectable"
      :virtualized="virtualized"
      :virtualized-row-height="virtualizedRowHeight"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
      @sort-change="handleSortChange"
      @selection-change="tableSelection.handleSelectionChange"
    >
      <template v-if="tableActions.visibleTableActions.value.length" #table-actions>
        <template v-for="action in tableActions.visibleTableActions.value" :key="action.key">
          <el-button
            :type="action.type"
            :disabled="tableActions.isTableActionDisabled(action)"
            size="small"
            @click="handleTableAction(action)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </template>

      <template v-if="rowActions.length" #row-actions="{ row, rowIndex }">
        <div class="flex justify-start gap-2">
          <template v-for="action in rowActions" :key="action.key">
            <el-button
              v-if="!tableActions.isRowActionHidden(action, row, rowIndex)"
              :type="action.type"
              :disabled="tableActions.isRowActionDisabled(action, row, rowIndex)"
              size="small"
              @click="handleRowAction(action, row, rowIndex)"
            >
              {{ action.label }}
            </el-button>
          </template>
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_PAGE_SIZES } from "@/components/common/const/table.ts";
import Table from "@/components/common/table-container/data-table/table.vue";
import FilterPanel from "@/components/common/table-container/filter-panel/index.vue";
import { computed, ref, useTemplateRef, watch } from "vue";
import type {
  FilterPanelExpose,
  Filters,
  QueryPayload,
  RowAction,
  TableAction,
  TableContainerEmits,
  TableContainerExpose,
  TableContainerProps,
  TableRow,
} from "../types";
import { useTableActions, useTableSelection, useTableState, useUrlSync } from "./hooks";

const props = withDefaults(defineProps<TableContainerProps>(), {
  filterConfigs: () => [],
  columnConfigs: () => [],
  tableActions: () => [],
  rowActions: () => [],
  pageSizes: () => DEFAULT_PAGE_SIZES,
  selectable: true,
  autoQuery: true,
  virtualized: false,
  virtualizedRowHeight: 44,
  fullHeight: false,
});
const emit = defineEmits<TableContainerEmits>();

const filterPanelRef = useTemplateRef<FilterPanelExpose | null>("filterPanelRef");
const filterLoading = ref(false);
const filterInitialized = ref(false);

// 解析初始筛选条件
function resolveInitialFilters(): Partial<Filters> {
  if (typeof props.initialFilters === "function") {
    return (props.initialFilters as () => Partial<Filters>)();
  }
  return { ...(props.initialFilters || {}) };
}

// URL 同步
const filterKeys = computed(() => props.filterConfigs.map((c) => c.key));
const urlSync = useUrlSync({ filterKeys });

// 表格状态
const tableState = useTableState({ defaultPageSize: props.pageSizes[0] });

// 选择状态
const tableSelection = useTableSelection({ rowKey: props.rowKey });

// 操作按钮
const tableActions = useTableActions({
  tableActions: props.tableActions,
  rowActions: props.rowActions,
  selection: tableSelection,
  onRefresh: () => fetchList(appliedFilters.value),
});

// 当前应用的筛选条件
const appliedFilters = ref<Partial<Filters>>(resolveInitialFilters());

/**
 * 获取数据列表
 */
async function fetchList(filters: Partial<Filters>) {
  if (!props.fetcher) return;

  const { requestId, signal } = tableState.startRequest();
  tableState.setLoading(true, requestId);

  try {
    const payload = tableState.buildPayload(filters);
    emit("query-change", payload);

    const result = await props.fetcher(payload);

    // 检查是否是当前请求
    if (!tableState.isCurrentRequest(requestId)) return;

    tableState.setRows(Array.isArray(result.rows) ? result.rows : []);
    tableState.setTotal(Number(result.total) || 0);
  } catch (error) {
    if (tableState.isCurrentRequest(requestId)) {
      tableActions.handleError(error as Error, "加载");
    }
  } finally {
    tableState.setLoading(false, requestId);
  }
}

/**
 * 处理筛选提交
 */
async function handleFilterSubmit(filters: Partial<Filters>) {
  tableState.resetPagination();
  appliedFilters.value = { ...filters };
  urlSync.syncToUrl(filters as Record<string, unknown>);
  await fetchList(filters);
}

/**
 * 处理筛选重置
 */
async function handleFilterReset() {
  tableState.resetPagination();
  const filters = (filterPanelRef.value?.getFilters() as Partial<Filters>) || {};
  appliedFilters.value = { ...filters };
  urlSync.syncToUrl(filters as Record<string, unknown>);
  await fetchList(filters);
}

/**
 * 处理页码变化
 */
async function handlePageChange(page: number) {
  tableState.setPage(page);
  await fetchList(appliedFilters.value);
}

/**
 * 处理每页条数变化
 */
async function handlePageSizeChange(pageSize: number) {
  tableState.setPageSize(pageSize);
  await fetchList(appliedFilters.value);
}

/**
 * 处理排序变化
 */
async function handleSortChange(sort: QueryPayload<Filters>["sort"]) {
  tableState.setSort(sort);
  await fetchList(appliedFilters.value);
}

/**
 * 处理表格操作按钮点击
 */
async function handleTableAction(action: TableAction) {
  await tableActions.handleTableAction(action);
  emit("table-action", { action: action.key, rows: tableSelection.selectedRows.value });
}

/**
 * 处理行操作按钮点击
 */
async function handleRowAction(action: RowAction, row: TableRow, rowIndex: number) {
  await tableActions.handleRowAction(action, row, rowIndex);
  emit("row-action", { action: action.key, row, rowIndex });
}

/**
 * 初始化：筛选面板就绪后触发首次查询
 */
watch(
  filterInitialized,
  (initialized) => {
    if (!initialized) return;

    // 从 URL 恢复筛选条件
    if (urlSync.hasUrlFilters.value) {
      filterPanelRef.value?.appendFilters(urlSync.filtersFromUrl.value as Partial<Filters>);
    }

    // 获取当前筛选条件
    const filters = filterPanelRef.value?.getFilters() as Partial<Filters>;
    appliedFilters.value = { ...filters };

    // 自动查询
    if (props.autoQuery) {
      urlSync.syncToUrl(filters as Record<string, unknown>);
      void fetchList(filters);
    }
  },
  { immediate: true },
);

// 暴露方法
defineExpose<TableContainerExpose>({
  refresh: () => {
    void fetchList(appliedFilters.value);
  },
  getFilters: () => {
    return filterPanelRef.value?.getFilters() as Partial<Filters>;
  },
  appendFilters: (filters: Partial<Filters>) => {
    filterPanelRef.value?.appendFilters(filters);
  },
  replaceFilters: (filters?: Partial<Filters>) => {
    filterPanelRef.value?.replaceFilters(filters);
  },
  resetFilters: () => {
    void handleFilterReset();
  },
  submitFilters: () => {
    const filters = filterPanelRef.value?.getFilters() as Partial<Filters>;
    void handleFilterSubmit(filters);
  },
});
</script>

<style lang="scss" scoped></style>
