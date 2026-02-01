# 通用 CRUD 列表架构设计（FilterPanel + DataTable 解耦）

目标：封装 Vue3 + TypeScript 的通用筛选组件与通用表格组件。两者解耦；筛选组件支持异步加载筛选项（多接口并行）、支持重置/刷新异步数据、对外暴露加载状态；父组件统一管控查询时机（筛选加载完成后自动首次查询）；表格组件支持加载态 / 分页 / 自定义列。

本文档以“架构契约”为主，不描述具体实现代码。

## 1. 组件与职责

- Page/Container（父组件）：唯一编排者。负责读取/写入 URL `q`，维护 filters/pagination/sort，控制首查与后续查询触发，控制并发。
- FilterPanel（筛选组件）：负责渲染筛选 UI，负责并行加载 options，并对外暴露 loading/ready/错误；不负责发起列表查询。
- DataTable（表格组件）：负责渲染表格与分页/排序 UI，并通过事件把交互抛给父组件；不负责请求数据。

### 1.1 状态划分（父组件单一事实来源）

父组件维护两类状态：
- AppliedQuery：已生效的查询状态（会驱动请求、会写入 URL `q`）
- DraftFilters：筛选面板的草稿态（用户正在改但未提交，不写入 `q`）

推荐父组件持有 AppliedQuery，并将 DraftFilters 下沉到 FilterPanel 内部（或者父组件持有 DraftFilters 并通过 v-model 下发，两者选其一，但要保证“只有提交才会变更 AppliedQuery 与 q”）。

### 1.2 组件契约（Props / Emits / Expose）

建议将核心类型定义抽取到 `types.ts` 以避免循环依赖。

```ts
// types.ts
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

// FilterPanel Interfaces
export interface FilterPanelProps<Filters extends Record<string, unknown>> {
  initialFilters: Partial<Filters>
  fields: Array<FilterField<Filters>>
  disabled?: boolean
}

export interface FilterPanelExpose {
  reset: () => void
  refreshOptions: () => Promise<void>
}

export interface FilterPanelEmits<Filters extends Record<string, unknown>> {
  'update:loading': (loading: boolean) => void
  'update:ready': (ready: boolean) => void
  'submit': (filters: Partial<Filters>) => void
  'reset': () => void
}

// DataTable Interfaces
export interface DataTableEmits<Row> {
  'update:page': (page: number) => void
  'update:pageSize': (pageSize: number) => void
  'sort-change': (sort: SortState | null) => void
  'selection-change': (payload: { rows: Row[]; keys: RowKey[] }) => void
  'row-action': (payload: { action: string; row: Row; rowIndex: number }) => void
  'table-action': (payload: { action: string }) => void
  'update:density': (density: 'small' | 'default' | 'large') => void
}

export interface DataTableProps<Row> {
  columns: Array<TableColumn<Row>>
  rows: Row[]
  loading: boolean
  pagination: PaginationState
  sort: SortState | null
  rowKey?: ((row: Row) => RowKey) | string
  selectable?: boolean
  selectedKeys?: RowKey[]
  density?: 'small' | 'default' | 'large'
  virtualized?: boolean // [New] 支持大数据量虚拟滚动
  virtualizedRowHeight?: number // [New] 虚拟滚动行高
}
```

约束：
- FilterPanel 不读写路由；所有 URL 行为由父组件完成
- FilterPanel 不触发列表请求；只产出“用户意图”（submit/reset/刷新 options）
- DataTable 不触发列表请求；只产出“表格交互”（翻页/排序/刷新等）

### 1.3 FilterPanel：字段模型（多类型 + 复合组件 + 默认值策略 + 权限）

目标：FilterPanel 既能覆盖常见字段类型（输入/下拉/多选/时间等），也能让业务通过“复合组件”扩展；并且默认值来源清晰、可预测。

建议 FilterPanel 接受两类输入：
- `initialFilters`：父组件下发的“回放/默认”值（来自 URL `q` 的 AppliedQuery.filters 或业务默认）
- `fields`：字段渲染与行为配置（类型、options、默认值策略、校验/转换、权限）

```ts
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

export interface FilterField<Filters extends Record<string, unknown>, K extends keyof Filters = keyof Filters> {
  key: K
  label: string
  kind: FilterFieldKind
  
  // [New] 权限控制：若返回 false 则该筛选字段不渲染
  permission?: string | (() => boolean)

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
```

默认值优先级（从高到低）：
1. URL `q` 回放得到的 AppliedQuery.filters（进入页面/前进后退）
2. 父组件传入的业务默认 `initialFilters`
3. 字段自身 `defaultValue`
4. 字段 `autoSelectFirst`（仅对 select/multi-select 且 optionsReady 时生效）

默认值生效时机建议：
- `init`：组件初始化时（适合 input、静态 options 的 select）
- `optionsReady`：字段 options 异步加载完成后（适合 autoSelectFirst、依赖 options 的默认值）

复合组件支持策略（任选其一或同时支持）：
- 配置式：`kind='component' + component/componentProps`，FilterPanel 负责把该组件接入到草稿态 v-model（需要约定 modelValue/更新事件）
- 插槽式：按 `slotName` 或 `field.key` 暴露插槽，让业务自行渲染并拿到草稿态/字段元信息

加载态与丝滑动画（Element Plus）：
- 颗粒度：既要有 panel 级 `loading`，也要支持字段级 options loading（例如只某个下拉框在 loading）
- 表现：优先使用 skeleton/占位宽度稳定，避免布局抖动；对 options 刷新使用轻量 loading（例如下拉框 loading，而不是全屏遮罩）

插槽命名建议：
- `actions`：筛选区域右侧按钮区（查询/重置/刷新等）
- `field-{key}`：某字段整体自定义（例如 `field-status`）
- `control-{key}`：某字段控件自定义（仅替换输入控件，保留 label/布局）

### 1.4 DataTable：列模型（插槽/TSX 渲染 + 行为扩展 + 权限）

目标：DataTable 负责把“表格表现 + 表格交互”抽象好，所有业务行为回传父组件；同时提供足够的可扩展渲染能力（插槽 + TSX render）。

建议通过 `columns` 描述列，并同时支持两种自定义渲染方式：
- 插槽：适合在 .vue 模板里写，方便团队协作
- render 函数：适合 TSX，类型提示更好，避免写 `h()`

```ts
import { VNode } from 'vue'

export interface CellRenderContext<Row> {
  row: Row
  rowIndex: number
  value: unknown
  columnKey: string
}

// [Security] 明确返回类型为 VNode | string，禁止直接返回 HTML 字符串以防 XSS
export type CellRenderer<Row> = (ctx: CellRenderContext<Row>) => VNode | string | number

export interface TableColumn<Row> {
  key: string
  title: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'

  // [New] 权限控制：若返回 false 则该列不渲染
  permission?: string | (() => boolean)
  // [New] 默认显隐：用户可配置列显隐时使用
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
}
```

表格能力清单（建议纳入契约）：
- 多选：受控/半受控（父组件可传 selectedKeys，并接收 selection-change）
- 远端排序：表格 emit sort-change → 父组件更新 AppliedQuery.sort → 请求 → 写入 `q`
- 表格行为区：toolbar 插槽（新增/导出/批量操作等），只负责发事件，不做业务
- 行行为：row-actions 插槽/列（编辑/删除/详情等），只负责发事件，不做业务
- 单元格插槽：按列 key 提供 cell slot（例如 `cell-status`），覆盖默认渲染
- 表格分组：支持按字段 groupBy，并提供 group header 的渲染入口（插槽或 render）
- **[New] 虚拟滚动**：当数据量 > 500 条时，建议开启 `virtualized` 模式（底层可切换为 `el-table-v2`），以保证渲染性能。
- **[New] 密度控制**：支持 `density` 切换（small/default/large），适应不同信息密度的场景。

插槽命名建议（便于统一约定）：
- `toolbar`：表格上方行为区
- `empty`：空状态
- `row-actions`：行操作区（通常是最后一列）
- `header-{columnKey}`：表头自定义（例如 `header-status`）
- `cell-{columnKey}`：单元格自定义（例如 `cell-status`）
- `group-header`：分组头（当启用分组时）

## 2. URL 查询参数 `q` 约定（qs）

页面 URL 中使用一个 query key：`q`，其值承载所有查询参数对象（filters / pagination / sort），用于：
- 进入页面回放查询条件（可复制链接复现）
- 与 FilterPanel 同步（URL → 状态）
- 触发查询后同步 URL（状态 → URL）

### 2.1 `q` 的数据结构（payload）

建议将 `q` 解析为如下结构：

```ts
export type SortOrder = 'asc' | 'desc'

export interface SortState {
  prop: string
  order: SortOrder
}

export interface QueryQPayload<Filters extends Record<string, unknown>> {
  filters?: Partial<Filters>
  pagination?: Partial<{ page: number; pageSize: number }>
  sort?: Partial<SortState>
}
```

### 2.2 `q` 的序列化/反序列化规则

- 写入：`q = qs.stringify(payload)`，通过路由写入 query（路由会负责编码，不要手写拼接 URL）
- 读取：读取 `route.query.q` 后执行 `qs.parse(q)` 得到 payload
- 容错：解析失败时视为无效 `q`，回退默认值，并可选择清空 URL 中的 `q`

### 2.3 URL 与状态同步策略（避免循环）

- URL → 状态：进入页面、浏览器前进/后退、外部打开链接时触发；将 payload 合并到父组件状态中
- 状态 → URL：仅在“提交查询/翻页/排序变化”等会改变结果集的动作后写入；payload 等价时跳过写入
- 写入方式：默认推荐 replace（避免历史记录爆炸），需要可回放每一步时再用 push

### 2.4 `q` 与 FilterPanel 的同步协议

约定：`q` 只描述 AppliedQuery（已提交并实际用于请求的一组 filters/pagination/sort）。

进入页面（或路由变化）时：
- parse `route.query.q` → 得到 payload
- 将 payload 合并到父组件 AppliedQuery
- 将 AppliedQuery.filters 作为“默认/回放值”下发给 FilterPanel，用于初始化草稿态

用户在 FilterPanel 内修改筛选时：
- 仅更新草稿态，不写 `q`，不请求

用户点击“查询/提交”时（FilterPanel emit submit）：
- 父组件 AppliedQuery.filters = 提交值
- 父组件 AppliedQuery.pagination.page = 1（除非明确希望保留页码）
- 父组件触发请求
- 请求触发后（或成功后）replace 写入 `q`

用户点击“重置”时（FilterPanel emit reset 或 expose.reset）：
- 父组件重置 AppliedQuery.filters 为默认值（或清空）
- 父组件 AppliedQuery.pagination.page = 1
- 父组件触发请求
- replace 写入 `q`

## 3. 首次查询时机（父组件统一管控）

核心原则：FilterPanel 首次 options 加载流程结束后，父组件才允许首查。

建议父组件维护以下状态：
- `filterOptionsLoading`：筛选项是否加载中
- `filterOptionsReady`：筛选项首次加载是否已结束（成功或部分失败）
- `tableLoading`：列表请求中
- `hasQueriedOnce`：是否已完成首查（防重复）

推荐时序：
1. 父组件读取 URL `q` → 得到 filters/pagination/sort 初始状态 → 下发给 FilterPanel 与 DataTable
2. FilterPanel mount 后并行拉取 options，对外暴露 `filterOptionsLoading=true`
3. FilterPanel 首次 options 拉取结束 → 对外暴露 `filterOptionsReady=true`
4. 父组件检测 `filterOptionsReady && !hasQueriedOnce` → 触发首查（page=1 或取自 q.pagination.page）

补充约束（避免首查重复与竞态）：
- 首查触发点只放在父组件：ready 变为 true 的那一刻，且 hasQueriedOnce=false
- URL 回放触发的状态变更不应立即触发查询；仍需等待 filterOptionsReady
- 同一时刻发生“ready=true”和“用户点击查询”，父组件只保留一次请求（以最后一次 AppliedQuery 为准）

## 4. 安全与防误操作兜底

- **[Security] XSS 防护**：`DataTable` 的 `renderCell` 必须返回 VNode 或经过 sanitize 的安全字符串。禁止直接将未过滤的用户输入传递给 `v-html`。
- **[Security] 删除防护**：所有“删除”或“批量删除”操作，父组件必须实现“二次确认弹窗 (Confirm Dialog)”，防止误触。
- **Dirty 保护**：当用户修改筛选但未提交时，点击“重置/刷新 options”应弹确认或提供恢复策略
- **重复点击保护**：options 刷新中禁用刷新按钮；查询中禁用查询按钮（或只保留最后一次请求）
- **options 部分失败降级**：单字段失败不阻断其它字段；字段级展示“加载失败，可重试”

## 5. 用户体验与无障碍 (UX & A11y)

- **[UX] 焦点管理**：查询结束后，焦点应合理保留或移动（如回到表格顶部），避免重置到页面顶部。
- **[A11y] 语义化标签**：`FilterPanel` 表单控件必须关联 `<label>`。
- **[A11y] 键盘导航**：表格需支持键盘上下键导航行（若支持单选）；筛选面板展开/收起需设置 `aria-expanded`。

## 6. 技术栈集成建议（Vue Query + VueUse + Element Plus）

### 6.1 列表查询（父组件使用 Vue Query）

建议把“列表请求”完全收敛在父组件，并用 Vue Query 管控缓存、并发与保留旧数据：
- `queryKey`：由资源名 + AppliedQuery（filters/pagination/sort）组成（建议以 `q` payload 作为唯一来源，保证一致性）
- `enabled`：在 `filterOptionsReady=true` 后才允许请求（实现“筛选项加载完成后自动首查”）
- `keepPreviousData`：翻页/排序时保持旧数据，配合 Table loading 表现更丝滑
- `staleTime/cacheTime`：按业务权衡（后台管理类通常可较短，避免显示过期数据）

对外暴露的 loading 建议拆分为两类，避免 UI 误导：
- `filterOptionsLoading`：筛选项 options 加载/刷新中
- `tableLoading`：列表查询中（分页、排序、提交筛选都会触发）

### 6.2 筛选项 options（FilterPanel 内部并行加载）

FilterPanel 自己负责并行拉取 options 时，可用 Vue Query 的并行能力（例如 useQueries 或等价方式）达到：
- 并行：每个字段一个 query；失败互不影响
- 字段级 loading/error：只让对应控件展示 loading/error
- 统一 ready：所有字段首次请求都 settled 后再 emit `update:ready(true)`（部分失败也算 ready，避免阻塞首查）

刷新策略建议：
- 全量刷新：`refreshOptions()` 触发所有字段 options refetch
- 单字段刷新：允许对某字段提供“重试”入口（字段级按钮或错误态里的重试）

### 6.3 交互增强（VueUse）

VueUse 更适合“交互与体验”层（不侵入业务逻辑）：
- 输入类字段：如果希望“停止输入后自动提交”，用 debounce（否则维持显式点击查询）
- 键盘体验：Enter 提交、Esc 清空等（如果团队习惯）
- 请求乱序防抖：快速操作场景下，配合 Vue Query 的并发/缓存能力，避免闪烁与回退
- **[New] 列宽/显隐持久化**：使用 `useStorage` 自动保存用户调整过的列宽和列显隐状态。

### 6.4 Element Plus 的丝滑加载表现

建议优先组合以下能力，而不是全屏遮罩：
- FilterPanel：使用骨架屏/占位（保持布局稳定），字段级 select loading
- DataTable：使用 table 的 loading（或局部 overlay），配合 keepPreviousData 实现“旧数据不抖动 + 顶部 loading”
- 空态：当 rows 为空且非 loading 时显示 empty slot；loading 时不要闪空态

## 7. TSX 是否必要（以及推荐用法）

结论：不需要强制把 FilterPanel/DataTable 写成 TSX；推荐“组件用 .vue（模板）做结构 + 对外提供 TSX 友好的 render 扩展点”。

推荐策略：
- 组件内部：用 SFC 模板更直观（尤其 Element Plus 的布局与表单），团队维护成本低
- 自定义渲染：通过 `columns.renderCell/renderHeader` 或插槽暴露，让业务用 TSX 写复杂单元格（无需 `h()`）
- 复合筛选控件：优先用 `kind='component'` 或 `control-{key}` 插槽，业务可用 TSX/组件任意实现

更适合 TSX（defineComponent 或 `<script setup lang="tsx">`）的场景：
- 列/字段完全动态（运行时拼装插槽名、批量生成渲染器）
- 需要高度可复用的“渲染函数库”（例如通用的状态 tag、金额格式化、权限包裹等）

不建议全 TSX 的场景：
- 表单布局、栅格、间距、Element Plus 组件组合为主的 UI（模板可读性更好）
