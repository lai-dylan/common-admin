<template>
  <div class="flex flex-col gap-6">
    <FilterPanel
        :filter-configs="filterConfigs"
        :initial-filters="initialFilters"
        @update:loading="(value) => filterLoading = value"
        @update:ready="(value) => filterReady = value"
        @submit="handleFilterSubmit"
        @reset="handleFilterReset"
    >
    </FilterPanel>

    <DataTable
        :column-configs="columnConfigs"
        :rows="tableRows"
        :loading="tableLoading"
        :pagination="pagination"
        :sort="sortState"
        :row-key="rowKey"
        :selectable="selectable"
        :virtualized="virtualized"
        :virtualized-row-height="virtualizedRowHeight"

        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"

    >
      <template #table-actions>
        <slot name="table-actions" :selection="selectedRows" :refresh="fetchList">
          <template v-for="action in visibleTableActions" :key="action.key">
            <el-button
                :type="action.kind === 'dangerButton' ? 'danger' : 'primary'"
                :disabled="isTableActionDisabled(action)"
                size="small"
                @click="handleTableAction(action)"
            >
              {{ action.label }}
            </el-button>
          </template>
        </slot>
      </template>

      <template #row-actions="{ row, rowIndex }">
        <slot name="row-actions" :row="row" :rowIndex="rowIndex">
          <div class="flex justify-center">
            <template v-for="action in visibleRowActions" :key="action.key">
              <el-button
                  v-if="!isRowActionHidden(action, row, rowIndex)"
                  :type="action.danger ? 'danger' : 'primary'"
                  :disabled="isRowActionDisabled(action, row, rowIndex)"
                  size="small"
                  @click="handleRowAction(action, row, rowIndex)"
              >
                {{ action.label }}
              </el-button>
            </template>
          </div>
        </slot>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts" generic="Row extends Record<string, unknown>, Filters extends Record<string, unknown>">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import FilterPanel from "./FilterPanel.vue";
import DataTable from "./DataTable.vue";
import type {CommonTableEmits, CommonTableProps, QueryPayload, RowKey, TableAction, RowAction} from "./types";

const props = withDefaults(defineProps<CommonTableProps<Row, Filters>>(), {
  pageSizes: () => [10, 20, 50, 100],
  selectable: true,
  autoQuery: true,
  virtualized: false,
  virtualizedRowHeight: 44,
});
const emit = defineEmits<CommonTableEmits<Row, Filters>>();

const filterLoading = ref(false);
const filterReady = ref(false);
const tableLoading = ref(false);

const pagination = reactive({
  page: 1,
  pageSize: props.pageSizes[0],
  total: 0,
});
const sortState = ref<{ prop: string; order: "asc" | "desc" } | null>(null);
const rows = ref<Row[]>([]);
const tableRows = computed(() => rows.value as Row[]);
const appliedFilters = ref<Partial<Filters>>({...props.initialFilters});

const selectedRows = ref<Row[]>([]);
const selectedKeys = ref<RowKey[]>([]);

// Table actions
const visibleTableActions = computed(() => {
  if (!props.tableActions) return [];
  return props.tableActions.filter(action => {
    if (typeof action.permission === "function") return action.permission();
    if (typeof action.permission === "string") return true; // Assume permission check is handled externally
    return true;
  });
});

function handleTableAction(action: TableAction) {
  if (action.action) {
    action.action({selection: selectedRows.value as unknown[], refresh: fetchList});
  }
  ;(emit as (event: "table-action", payload: {
    action: string;
    rows?: Row[]
  }) => void)("table-action", {action: action.key, rows: selectedRows.value as Row[]});
}

function isTableActionDisabled(action: TableAction): boolean {
  if (typeof action.disabled === "function") {
    return Boolean(action.disabled(selectedRows.value as unknown[]));
  }
  return Boolean(action.disabled);
}

// Row actions
const visibleRowActions = computed<RowAction<Row>[]>(() => {
  if (!props.rowActions) return [];
  return props.rowActions.filter(action => {
    if (typeof action.permission === "function") {
      // Permission check without row context - assume allowed if permission function exists
      return true;
    }
    if (typeof action.permission === "string") return true;
    return true;
  });
});

function handleRowAction(action: RowAction<Row>, row: Row, rowIndex: number) {
  if (action.action) {
    action.action({row, rowIndex, refresh: fetchList});
  }
  ;(emit as (event: "row-action", payload: {
    action: string;
    row: Row;
    rowIndex: number
  }) => void)("row-action", {action: action.key, row, rowIndex});
}

function isRowActionHidden(action: RowAction<Row>, row: Row, rowIndex: number): boolean {
  if (typeof action.hidden === "function") return action.hidden(row, rowIndex);
  if (typeof action.hidden === "boolean") return action.hidden;
  return false;
}

function isRowActionDisabled(action: RowAction<Row>, row: Row, rowIndex: number): boolean {
  if (typeof action.disabled === "function") return action.disabled(row, rowIndex);
  if (typeof action.disabled === "boolean") return action.disabled;
  return false;
}

function buildPayload(filters: Partial<Filters>): QueryPayload<Filters> {
  return {
    filters,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
    },
    sort: sortState.value,
  };
}

async function fetchList(filters = appliedFilters.value) {
  if (!props.fetcher) return;
  tableLoading.value = true;
  try {
    const payload = buildPayload(filters);
    emit("query-change", payload);
    const result = await props.fetcher(payload);
    rows.value = result.rows;
    pagination.total = result.total;
  } catch (error) {
    ElMessage.error((error as Error)?.message || "加载失败");
  } finally {
    tableLoading.value = false;
  }
}

function handleFilterSubmit(filters: Partial<Filters>) {
  pagination.page = 1;
  appliedFilters.value = {...filters};
  tableLoading.value = true;
  fetchList(filters);
}

function handleFilterReset() {
  pagination.page = 1;
  appliedFilters.value = {...props.initialFilters};
  tableLoading.value = true;
  fetchList(props.initialFilters);
}

function handlePageChange(page: number) {
  pagination.page = page;
  tableLoading.value = true;
  fetchList();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  tableLoading.value = true;
  fetchList();
}

function handleSortChange(sort: { prop: string; order: "asc" | "desc" } | null) {
  sortState.value = sort;
  pagination.page = 1;
  tableLoading.value = true;
  fetchList();
}

function handleSelectionChange(payload: { rows: Row[]; keys: RowKey[] }) {
  selectedRows.value = payload.rows;
  selectedKeys.value = payload.keys;
}

watch(filterReady, value => {
  if (value && props.autoQuery) {
    fetchList();
  }
});

onMounted(() => {
  if (props.autoQuery && !filterReady.value) {
    fetchList();
  }
});
</script>

<style lang="scss" scoped>
</style>
