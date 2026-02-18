import { reactive, ref } from "vue";
import type { Filters, QueryPayload, SortState, TableRow } from "../../types";

export interface TableStateOptions {
  defaultPageSize?: number;
}

export function useTableState(options: TableStateOptions = {}) {
  const { defaultPageSize = 10 } = options;

  // 分页状态
  const pagination = reactive({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  // 排序状态
  const sortState = ref<SortState | null>(null);

  // 数据
  const rows = ref<TableRow[]>([]);
  const loading = ref(false);

  // 请求序列号（用于竞态处理）
  const requestSequence = ref(0);

  // AbortController（用于取消请求）
  let abortController: AbortController | null = null;

  function resetPagination() {
    pagination.page = 1;
  }

  function setTotal(total: number) {
    pagination.total = total;
  }

  function setPage(page: number) {
    pagination.page = page;
  }

  function setPageSize(size: number) {
    pagination.pageSize = size;
    pagination.page = 1;
  }

  function setSort(sort: SortState | null) {
    sortState.value = sort;
    pagination.page = 1;
  }

  function setRows(newRows: TableRow[]) {
    rows.value = newRows;
  }

  function buildPayload(filters: Partial<Filters>): QueryPayload {
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

  function startRequest(): { requestId: number; signal?: AbortSignal } {
    // 取消之前的请求
    abortController?.abort();
    abortController = new AbortController();

    const requestId = ++requestSequence.value;
    return { requestId, signal: abortController.signal };
  }

  function isCurrentRequest(requestId: number): boolean {
    return requestId === requestSequence.value;
  }

  function setLoading(value: boolean, requestId?: number) {
    // 只有当前请求才能更新 loading
    if (requestId === undefined || isCurrentRequest(requestId)) {
      loading.value = value;
    }
  }

  return {
    // 状态
    pagination,
    sortState,
    rows,
    loading,

    // 方法
    resetPagination,
    setTotal,
    setPage,
    setPageSize,
    setSort,
    setRows,
    buildPayload,
    startRequest,
    isCurrentRequest,
    setLoading,
  };
}

export type TableState = ReturnType<typeof useTableState>;
