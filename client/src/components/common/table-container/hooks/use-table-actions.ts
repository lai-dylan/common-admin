import { ElMessage } from "element-plus";
import { computed, reactive } from "vue";
import type { RowAction, TableAction, TableRow } from "../../types";
import type { TableSelection } from "./use-table-selection";

export interface TableActionsOptions {
  tableActions?: TableAction[];
  rowActions?: RowAction[];
  selection: TableSelection;
  onRefresh: () => Promise<void>;
}

export function useTableActions(options: TableActionsOptions) {
  const { tableActions = [], selection, onRefresh } = options;

  // 操作按钮加载状态
  const tableActionLoadingMap = reactive<Record<string, boolean>>({});
  const rowActionLoadingMap = reactive<Record<string, boolean>>({});

  /**
   * 过滤可见的表格操作按钮
   */
  const visibleTableActions = computed(() => {
    return tableActions.filter((action) => {
      if (typeof action.hidden === "function") {
        return !action.hidden({ selectedRows: selection.selectedRows.value });
      }
      if (typeof action.hidden === "boolean") {
        return !action.hidden;
      }
      return true;
    });
  });

  /**
   * 解析行操作按钮的加载状态 key
   */
  function resolveRowActionLoadingKey(actionKey: string, row: TableRow): string {
    return `${actionKey}:${selection.resolveRowKey(row)}`;
  }

  /**
   * 判断表格操作按钮是否禁用
   */
  function isTableActionDisabled(action: TableAction): boolean {
    if (tableActionLoadingMap[action.key]) return true;
    if (typeof action.disabled === "function") {
      return action.disabled({ selectedRows: selection.selectedRows.value });
    }
    if (typeof action.disabled === "boolean") return action.disabled;
    return false;
  }

  /**
   * 判断行操作按钮是否隐藏
   */
  function isRowActionHidden(action: RowAction, row: TableRow, rowIndex: number): boolean {
    if (typeof action.hidden === "function") return action.hidden({ row, rowIndex });
    if (typeof action.hidden === "boolean") return action.hidden;
    return false;
  }

  /**
   * 判断行操作按钮是否禁用
   */
  function isRowActionDisabled(action: RowAction, row: TableRow, rowIndex: number): boolean {
    const loadingKey = resolveRowActionLoadingKey(action.key, row);
    if (rowActionLoadingMap[loadingKey]) return true;
    if (typeof action.disabled === "function") return action.disabled({ row, rowIndex });
    if (typeof action.disabled === "boolean") return action.disabled;
    return false;
  }

  /**
   * 执行表格操作
   */
  async function handleTableAction(action: TableAction): Promise<void> {
    if (tableActionLoadingMap[action.key]) return;

    tableActionLoadingMap[action.key] = true;
    try {
      await action.action?.({
        selection: selection.selectedRows.value,
        refresh: onRefresh,
      });
    } catch (error) {
      handleError(error as Error, action.label);
    } finally {
      tableActionLoadingMap[action.key] = false;
    }
  }

  /**
   * 执行行操作
   */
  async function handleRowAction(
    action: RowAction,
    row: TableRow,
    rowIndex: number,
  ): Promise<void> {
    const loadingKey = resolveRowActionLoadingKey(action.key, row);
    if (rowActionLoadingMap[loadingKey]) return;

    rowActionLoadingMap[loadingKey] = true;
    try {
      await action.action?.({
        row,
        rowIndex,
        refresh: onRefresh,
      });
    } catch (error) {
      handleError(error as Error, action.label);
    } finally {
      rowActionLoadingMap[loadingKey] = false;
    }
  }

  /**
   * 统一错误处理
   */
  function handleError(error: Error, actionLabel?: string): void {
    const message = error.message || `${actionLabel || "操作"}失败`;
    ElMessage.error(message);
    // 可扩展：上报错误、记录日志
    console.error("[TableActions]", error);
  }

  return {
    // 状态
    tableActionLoadingMap,
    rowActionLoadingMap,
    visibleTableActions,

    // 方法
    resolveRowActionLoadingKey,
    isTableActionDisabled,
    isRowActionHidden,
    isRowActionDisabled,
    handleTableAction,
    handleRowAction,
    handleError,
  };
}

export type TableActions = ReturnType<typeof useTableActions>;
