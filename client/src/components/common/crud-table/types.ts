import type { ComputedRef, Ref, VNode } from 'vue'

export type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export type SortOrder = 'asc' | 'desc'
export type RowKey = string | number

export interface SortState {
  prop: string
  order: SortOrder
}

export interface PaginationState {
  page: number
  pageSize: number
  total?: number
}

export interface QueryPayload<Filters extends Record<string, unknown>> {
  filters: Partial<Filters>
  pagination: PaginationState
  sort: SortState | null
}

export interface SelectOption<Value = unknown> {
  label: string
  value: Value
  disabled?: boolean
}

export type FilterFieldKind =
  | 'input'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'date'
  | 'daterange'
  | 'component'

export type DefaultApplyTiming = 'init' | 'optionsReady'

export interface FilterField<
  Filters extends Record<string, unknown>,
  K extends keyof Filters = keyof Filters,
> {
  key: K
  label: string
  kind: FilterFieldKind
  permission?: string | (() => boolean)
  hidden?: boolean | (() => boolean)
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  options?: SelectOption[]
  loadOptions?: () => Promise<SelectOption[]>
  autoSelectFirst?: boolean
  defaultValue?: Filters[K] | (() => Filters[K])
  applyDefaultTiming?: DefaultApplyTiming
  component?: unknown
  componentProps?: Record<string, unknown>
  slotName?: string
  normalize?: (draftValue: unknown) => Filters[K]
}

export interface FilterPanelProps<Filters extends Record<string, unknown>> {
  initialFilters: Partial<Filters> | (() => Partial<Filters>)
  filterConfigs: MaybeRef<Array<FilterField<Filters>>>
  disabled?: boolean
}

export interface FilterPanelExpose<Filters extends Record<string, unknown>> {
  reset: () => void
  refreshOptions: () => Promise<void>
  setDraftFilters: (filters: Partial<Filters>, options?: { replace?: boolean }) => void
  getFilters: () => Partial<Filters>
}

export interface FilterPanelEmits<Filters extends Record<string, unknown>> {
  (event: 'update:loading', loading: boolean): void
  (event: 'update:ready', ready: boolean): void
  (event: 'submit', filters: Partial<Filters>): void
  (event: 'reset'): void
}

export interface CellRenderContext<Row> {
  row: Row
  rowIndex: number
  value: unknown
  columnKey: string
}

export type CellRenderer<Row> = (ctx: CellRenderContext<Row>) => VNode | string | number

export type EditorKind =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'switch'
  | 'date'
  | 'daterange'

export interface TableColumn<Row> {
  key: string
  title: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  permission?: string | (() => boolean)
  hidden?: boolean | (() => boolean)
  defaultHidden?: boolean
  sortable?: boolean | 'server'
  renderHeader?: () => VNode | string
  renderCell?: CellRenderer<Row>
  headerSlot?: string
  cellSlot?: string
  headerClassName?: string
  className?: string
  headerStyle?: Record<string, string> | ((ctx: { columnKey: string }) => Record<string, string>)
  cellStyle?: Record<string, string> | ((ctx: CellRenderContext<Row>) => Record<string, string>)
  editable?: boolean
  editKind?: EditorKind
  editOptions?: SelectOption[]
  editComponent?: unknown
  editComponentProps?: Record<string, unknown>
  editRules?: Array<unknown>
  editPlaceholder?: string
  editDisabled?: boolean
}

export interface DataTableProps<Row> {
  columnConfigs: MaybeRef<Array<TableColumn<Row>>>
  rows: Row[]
  loading: boolean
  pagination: PaginationState
  sort: SortState | null
  rowKey?: ((row: Row) => RowKey) | string
  selectable?: boolean
  selectedKeys?: RowKey[]
  virtualized?: boolean
  virtualizedRowHeight?: number
}

export type TableActionKind = 'button' | 'dangerButton'

export interface TableAction {
  key: string
  label: string
  kind?: TableActionKind
  permission?: string | (() => boolean)
  hidden?: boolean | (() => boolean)
  disabled?: boolean | ((selection: unknown[]) => unknown)
  icon?: unknown
  action?: (ctx: { selection: unknown[]; refresh: () => void }) => void | Promise<void>
}

export interface RowAction<Row> {
  key: string
  label: string
  permission?: string | ((row: Row, rowIndex: number) => boolean)
  disabled?: boolean | ((row: Row, rowIndex: number) => boolean)
  hidden?: boolean | ((row: Row, rowIndex: number) => boolean)
  danger?: boolean
  action?: (ctx: { row: Row; rowIndex: number; refresh: () => void }) => void | Promise<void>
}

export interface DataTableEmits<Row> {
  (event: 'update:page', page: number): void
  (event: 'update:pageSize', pageSize: number): void
  (event: 'sort-change', sort: SortState | null): void
  (event: 'selection-change', payload: { rows: Row[]; keys: RowKey[] }): void
  (event: 'row-action', payload: { action: string; row: Row; rowIndex: number }): void
  (event: 'table-action', payload: { action: string }): void
}

export interface CommonTableProps<Row, Filters extends Record<string, unknown>> {
  columnConfigs: MaybeRef<Array<TableColumn<Row>>>
  filterConfigs: MaybeRef<Array<FilterField<Filters>>>
  initialFilters: Partial<Filters> | (() => Partial<Filters>)
  rowKey?: ((row: Row) => RowKey) | string
  pageSizes?: number[]
  selectable?: boolean
  virtualized?: boolean
  virtualizedRowHeight?: number
  fetcher: (payload: QueryPayload<Filters>) => Promise<{ rows: Row[]; total: number }>
  autoQuery?: boolean
  tableActions?: MaybeRef<TableAction[]>
  rowActions?: MaybeRef<RowAction<Row>[]>
}

export interface CommonTableEmits<Row, Filters extends Record<string, unknown>> {
  (event: 'query-change', payload: QueryPayload<Filters>): void
  (event: 'row-updated', payload: Row): void
  (event: 'rows-deleted', payload: Row[]): void
  (event: 'table-action', payload: { action: string; rows?: Row[] }): void
  (event: 'row-action', payload: { action: string; row: Row; rowIndex: number }): void
}

export interface CommonTableExpose<Filters extends Record<string, unknown>> {
  refresh: () => void
  getFilters: () => Partial<Filters>
  setDraftFilters: (filters: Partial<Filters>, options?: { replace?: boolean }) => void
  resetFilters: () => void
  submitFilters: () => void
}
