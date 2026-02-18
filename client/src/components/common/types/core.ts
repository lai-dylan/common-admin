/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComputedRef, Ref } from "vue";

export type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

export type SortOrder = "asc" | "desc";
export type RowKey = string;

/**
 * 通用筛选条件类型
 */
export type Filters = Record<string, unknown>;

export interface SortState {
  prop: string;
  order: SortOrder;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total?: number;
}

export interface QueryPayload<T extends Filters = Filters> {
  filters: Partial<T>;
  pagination: PaginationState;
  sort: SortState | null;
}

export type TableRow = Record<string, any>;
