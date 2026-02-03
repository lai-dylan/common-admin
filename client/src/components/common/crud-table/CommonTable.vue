<template>
  <div class="flex flex-col gap-6" :class="{ 'h-full': fullHeight }">
    <FilterPanel
        ref="filterPanelRef"
        :filter-configs="filterConfigsResolved"
        :initial-filters="initialFilters"
        @update:loading="(value) => filterLoading = value"
        @update:ready="(value) => filterReady = value"
        @submit="handleFilterSubmit"
        @reset="handleFilterReset"
    >
    </FilterPanel>

    <DataTable
        :class="{ 'flex-1 min-h-0': fullHeight }"
        :full-height="fullHeight"
        :column-configs="columnConfigsResolved"
        :rows="tableRows"
        :loading="tableLoading || (autoQuery && !filterReady)"
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
          <div class="flex justify-start">
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

<script setup lang="ts">
import {computed, reactive, ref, unref, watch} from "vue";
import {useRoute, useRouter, type LocationQueryRaw} from "vue-router";
import {ElMessage} from "element-plus";
import FilterPanel from "./FilterPanel.vue";
import DataTable from "./DataTable.vue";
import {QueryQUtils} from "../utils/queryQ";
import type {CommonTableEmits, CommonTableProps, FilterPanelExpose, QueryPayload, RowKey, TableAction, RowAction, CommonTableExpose} from "./types";

type Row = any;
type Filters = any;
const props = withDefaults(defineProps<CommonTableProps<any, any>>(), {
  pageSizes: () => [10, 20, 50, 100],
  selectable: true,
  autoQuery: true,
  virtualized: false,
  virtualizedRowHeight: 44,
  fullHeight: false,
});
const emit = defineEmits<CommonTableEmits<any, any>>();

const route = useRoute();
const router = useRouter();
const filterPanelRef = ref<FilterPanelExpose<any> | null>(null);

const filterConfigsResolved = computed(() => unref(props.filterConfigs) || []);
const columnConfigsResolved = computed(() => unref(props.columnConfigs) || []);
const tableActionsResolved = computed(() => unref(props.tableActions) || []);
const rowActionsResolved = computed(() => unref(props.rowActions) || []);

function pickFiltersFromQ(qObject: Record<string, unknown>): Partial<any> {
  const result: Record<string, unknown> = {};
  filterConfigsResolved.value.forEach((config: any) => {
    const keyString = String(config.key);
    if (!Object.prototype.hasOwnProperty.call(qObject, keyString)) return;
    result[keyString] = (qObject as any)[keyString];
  });
  return result as any;
}

const urlFilterOverrides = computed(() => pickFiltersFromQ(QueryQUtils.parseQ(route.query.q)));

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
  return tableActionsResolved.value.filter(action => {
    if (typeof action.hidden === "function" && action.hidden()) return false;
    if (typeof action.hidden === "boolean" && action.hidden) return false;
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
  return rowActionsResolved.value.filter(action => {
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
  replaceUrlQ(filters);
  tableLoading.value = true;
  fetchList(filters);
}

function handleFilterReset() {
  pagination.page = 1;
  const filters = filterPanelRef.value?.getFilters() ?? props.initialFilters;
  appliedFilters.value = {...filters};
  replaceUrlQ(filters);
  tableLoading.value = true;
  fetchList(filters);
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

watch(
  filterReady,
  value => {
    if (!value) return;
    if (Object.keys(urlFilterOverrides.value).length > 0) {
      filterPanelRef.value?.setDraftFilters(urlFilterOverrides.value, {replace: false});
    }
    const filters = filterPanelRef.value?.getFilters() ?? props.initialFilters;
    appliedFilters.value = {...filters};
    if (props.autoQuery) {
      replaceUrlQ(filters);
      fetchList(filters);
    }
  },
  {immediate: true},
);

function replaceUrlQ(filters: Partial<Filters>) {
  const q = QueryQUtils.encodeQ(filters as Record<string, unknown>);
  const nextQuery: Record<string, unknown> = {...(route.query as Record<string, unknown>)};
  if (!q) {
    delete nextQuery.q;
  } else {
    nextQuery.q = q;
  }
  router.replace({query: nextQuery as LocationQueryRaw});
}

defineExpose<CommonTableExpose<any>>({
  refresh: () => {
    fetchList();
  },
  getFilters: () => {
    return filterPanelRef.value?.getFilters() ?? appliedFilters.value;
  },
  setDraftFilters: (filters: Partial<any>, options?: { replace?: boolean }) => {
    filterPanelRef.value?.setDraftFilters(filters, options);
  },
  resetFilters: () => {
    handleFilterReset();
  },
  submitFilters: () => {
    const filters = filterPanelRef.value?.getFilters() ?? appliedFilters.value;
    handleFilterSubmit(filters);
  },
});

</script>

<style lang="scss" scoped>
</style>
