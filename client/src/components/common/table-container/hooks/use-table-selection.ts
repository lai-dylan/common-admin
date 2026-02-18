import { computed, ref } from "vue";
import type { RowKey, TableRow } from "../../types";

export interface TableSelectionOptions {
  rowKey?: string | ((row: TableRow) => string);
}

export function useTableSelection(options: TableSelectionOptions = {}) {
  const { rowKey } = options;

  const selectedRows = ref<TableRow[]>([]);
  const selectedKeys = ref<string[]>([]);

  /**
   * 解析行的唯一标识
   */
  function resolveRowKey(row: TableRow, rowIndex?: number): string {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    if (typeof rowKey === "string" && rowKey in row) {
      return String(row[rowKey as keyof TableRow] ?? rowIndex ?? "");
    }
    // 默认使用 id 或 key 字段
    if ("id" in row) {
      return String((row as { id?: RowKey }).id ?? rowIndex ?? "");
    }
    if ("key" in row) {
      return String((row as { key?: RowKey }).key ?? rowIndex ?? "");
    }
    return String(rowIndex ?? "");
  }

  /**
   * 处理选择变化
   */
  function handleSelectionChange(payload: { rows: TableRow[]; keys: string[] }) {
    selectedRows.value = payload.rows;
    selectedKeys.value = payload.keys;
  }

  /**
   * 清空选择
   */
  function clearSelection() {
    selectedRows.value = [];
    selectedKeys.value = [];
  }

  /**
   * 是否有选中项
   */
  const hasSelection = computed(() => selectedRows.value.length > 0);

  /**
   * 选中数量
   */
  const selectionCount = computed(() => selectedRows.value.length);

  return {
    // 状态
    selectedRows,
    selectedKeys,
    hasSelection,
    selectionCount,

    // 方法
    resolveRowKey,
    handleSelectionChange,
    clearSelection,
  };
}

export type TableSelection = ReturnType<typeof useTableSelection>;
