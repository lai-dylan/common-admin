/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VNode } from "vue";
import type { PaginationState, SortState, TableRow } from "./core.ts";

export type CellRenderer<Row> = (ctx: { row: Row; rowIndex: number; key: string }) => VNode;

export type EditorKind =
  | "input"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "date"
  | "daterange";

type ActionPredicate<Ctx> = boolean | ((ctx: Ctx) => boolean);

export interface TableColumn {
  key: string;
  label: string | (() => VNode);
  width?: number | string;
  minWidth?: number | string;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  hidden?: boolean | (() => boolean);
  sortable?: boolean | "server";
  renderCell?: CellRenderer<TableRow>;
  labelClassName?: string;
  className?: string;
  editable?: boolean;
  editKind?: EditorKind;
  editOptions?: Array<{ label: string; value: any; disabled?: boolean }>;
  editComponent?: unknown;
  editComponentProps?: Record<string, unknown>;
  editRules?: Array<unknown>;
  editPlaceholder?: string;
  editDisabled?: boolean;
}

export interface DataTableProps extends TableAccessors {
  columnConfigs: Array<TableColumn>;
  rows: TableRow[];
  loading: boolean;
  pagination: PaginationState;
  sort: SortState | null;
  selectedKeys?: string[];
}

export interface TableEmits {
  (event: "sort-change", sort: SortState | null): void;
  (event: "selection-change", payload: { rows: TableRow[]; keys: string[] }): void;
  (event: "update:page", page: number): void;
  (event: "update:page-size", pageSize: number): void;
}

export interface TableAction {
  key: string;
  label: string;
  type: "primary" | "info" | "danger";
  hidden?: ActionPredicate<{ selectedRows: TableRow[] }>;
  disabled?: ActionPredicate<{ selectedRows: TableRow[] }>;
  icon?: unknown;
  action?: (ctx: { selection: TableRow[]; refresh: () => void }) => void | Promise<void>;
}

export interface RowAction {
  key: string;
  label: string;
  disabled?: ActionPredicate<{ row: TableRow; rowIndex: number }>;
  hidden?: ActionPredicate<{ row: TableRow; rowIndex: number }>;
  type: "primary" | "info" | "danger";
  action?: (ctx: { row: TableRow; rowIndex: number; refresh: () => void }) => void | Promise<void>;
}

export interface TableAccessors {
  rowKey?: ((row: TableRow) => string) | string;
  pageSizes?: number[];
  selectable?: boolean;
  virtualized?: boolean;
  virtualizedRowHeight?: number;
  fullHeight?: boolean;
}
