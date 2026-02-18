import type { Filters, QueryPayload, TableRow } from "./core.ts";
import type { FilterField } from "./filter.ts";
import type { RowAction, TableAccessors, TableAction, TableColumn } from "./table.ts";

export interface TableContainerProps extends TableAccessors {
  columnConfigs: Array<TableColumn>;
  filterConfigs: Array<FilterField>;
  initialFilters: Partial<Filters> | (() => Partial<Filters>);
  rowKey?: ((row: TableRow) => string) | string;
  fetcher: (payload: QueryPayload) => Promise<{ rows: TableRow[]; total: number }>;
  autoQuery?: boolean;
  tableActions?: TableAction[];
  rowActions?: RowAction[];
}

export interface TableContainerEmits {
  (event: "query-change", payload: QueryPayload): void;
  (event: "row-updated", payload: TableRow): void;
  (event: "rows-deleted", payload: TableRow[]): void;
  (event: "table-action", payload: { action: string; rows?: TableRow[] }): void;
  (event: "row-action", payload: { action: string; row: TableRow; rowIndex: number }): void;
}

export interface TableContainerExpose {
  refresh: () => void;
  getFilters: () => Partial<Filters>;
  appendFilters: (filters: Partial<Filters>) => void;
  replaceFilters: (filters?: Partial<Filters>) => void;
  resetFilters: () => void;
  submitFilters: () => void;
}
