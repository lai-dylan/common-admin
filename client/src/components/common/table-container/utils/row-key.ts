import type { RowKey, TableRow } from "../../types";

/**
 * 解析行的唯一标识
 * @param row 行数据
 * @param rowKey 字段名或解析函数
 * @param rowIndex 行索引（作为兜底）
 */
export function resolveRowKey(
  row: TableRow,
  rowKey?: string | ((row: TableRow) => string),
  rowIndex?: number,
): string {
  // 优先使用传入的 rowKey 函数
  if (typeof rowKey === "function") {
    return rowKey(row);
  }

  // 使用传入的字段名
  if (typeof rowKey === "string" && rowKey in row) {
    const value = row[rowKey as keyof TableRow];
    return String(value ?? rowIndex ?? "");
  }

  // 默认使用 id 字段
  if ("id" in row) {
    return String((row as { id?: RowKey }).id ?? rowIndex ?? "");
  }

  // 尝试使用 key 字段
  if ("key" in row) {
    return String((row as { key?: RowKey }).key ?? rowIndex ?? "");
  }

  // 最后使用索引
  return String(rowIndex ?? "");
}
