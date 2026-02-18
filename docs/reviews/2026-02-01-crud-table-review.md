# CRUD Table 组件设计评审报告

**评审日期**: 2026-02-01
**评审对象**: `docs/crud-table-component-design.md`
**评审人**: Trae AI Assistant

---

## 1. 架构与可维护性 (Architecture & Maintainability)

### 检查结果
- **职责分离**: 
  - ✅ **优秀**: 明确划分了 `Page Container` (业务编排/状态/请求)、`FilterPanel` (筛选UI/草稿态)、`DataTable` (展示/交互) 三层结构。
  - ✅ **优秀**: 遵循单一职责原则 (SRP)，FilterPanel 和 DataTable 均不直接发起请求或操作路由，保证了纯粹性。
- **依赖关系**: 
  - ✅ **良**: 依赖流向清晰 (`Page -> FilterPanel`, `Page -> DataTable`)。
  - ✅ **无循环依赖**: 通过 `q` 参数作为单一事实来源 (Single Source of Truth) 和 Props/Emits 通信，避免了组件间的循环引用。
- **耦合度**:
  - ✅ **低耦合**: 组件间通过定义的 TypeScript 接口 (`FilterPanelProps`, `DataTableEmits`) 通信，不依赖具体实现。

### 改进建议
- **[P2] 类型复用**: 建议将 `SortState`, `PaginationState`, `TableColumn` 等核心类型定义抽取到独立的 `index.ts` 文件中，供父组件和子组件共享，避免类型定义的重复或循环导入。

---

## 2. 功能完整性 (Functionality Completeness)

### 检查结果
- **CRUD 覆盖**:
  - ✅ **Read**: 完整支持 (分页、筛选、排序、异步加载)。
  - ✅ **Create/Update**: 通过 `toolbar` 和 `row-action` 插槽支持，逻辑由父组件实现。
  - ✅ **Delete**: 通过 `row-action` 支持，批量删除通过 `selection-change` + `toolbar` 支持。
- **高级特性**:
  - ✅ **筛选**: 支持多种类型、默认值、异步 Options、复合组件。
  - ✅ **状态同步**: 完整的 URL `q` 参数双向同步协议。
  - ✅ **UX**: 包含加载态、防抖、防误操作设计。

### 缺失/未声明功能
- **[P1] 权限控制**: 设计文档未明确提及“列级权限”或“按钮级权限”的控制方式 (e.g., `TableColumn` 中的 `permission` 字段或 `hidden` 属性)。
- **[P2] 列宽拖拽/显隐设置**: 通用表格常需支持用户自定义列宽或显示/隐藏特定列，当前设计未包含此功能的持久化或配置。
- **[P2] 密度控制**: 未提及表格密度 (Small/Default/Large) 的切换支持。

---

## 3. 性能与可扩展性 (Performance & Scalability)

### 检查结果
- **渲染性能**:
  - ⚠️ **风险**: 对于 ≥10k 行的大数据量，当前设计基于 Element Plus 常规 Table，未明确强制使用虚拟滚动 (Virtual Scroll)。
  - ✅ **优化**: 推荐使用 `keepPreviousData` 减少 loading 闪烁，提升感知性能。
- **扩展性**:
  - ✅ **优秀**: 支持 TSX `renderCell` 和 插槽 (`slotName`) 两种自定义渲染方式，扩展性极强。
  - ✅ **动态性**: `columns` 和 `fields` 均为数组配置，支持运行时动态修改。

### 改进建议
- **[P1] 虚拟滚动策略**: 建议在 `DataTable` 中增加 `virtualized` 属性，或明确说明当数据量 > X 时应切换底层实现为 Element Plus `TableV2` (虚拟化表格)。
- **[P2] 插件机制**: 考虑引入简单的插件机制 (Hooks)，以便复用复杂的表格逻辑 (e.g., `useTableSelection`, `useTableSort`)。

---

## 4. 用户体验与无障碍 (UX & Accessibility)

### 检查结果
- **状态反馈**:
  - ✅ **优秀**: 明确区分了 `filterOptionsLoading` (局部) 和 `tableLoading` (列表)，以及空状态插槽。
- **可访问性 (A11y)**:
  - ❌ **缺失**: 文档未提及键盘导航 (Focus Management) 和 ARIA 标签的支持。例如，筛选面板展开/收起时的 `aria-expanded`，表格排序头的 `aria-sort`。

### 改进建议
- **[P1] A11y 规范**: 明确要求 `FilterPanel` 中的表单控件关联 `<label>`，表格需支持键盘上下键导航行 (若支持单选)。
- **[P2] 焦点管理**: 查询结束后，焦点应合理保留或移动，避免重置到页面顶部。

---

## 5. 安全与数据完整性 (Security & Data Integrity)

### 检查结果
- **XSS 风险**:
  - ⚠️ **注意**: `renderCell` 若返回 HTML 字符串而非 VNode，存在 XSS 风险。
- **状态安全**:
  - ✅ **优秀**: `q` 参数解析包含容错机制 (回退默认值)，防止畸形 URL 导致崩溃。

### 改进建议
- **[P0] XSS 防护**: 明确规范 `renderCell` 必须返回 VNode 或经过 sanitize 的内容，禁止直接使用 `v-html` 渲染用户数据。
- **[P1] 删除防护**: 在文档中补充“删除/批量删除”操作必须由父组件实现“二次确认 (Confirm Dialog)”的交互规范。

---

## 6. 测试覆盖 (Test Coverage)

### 检查结果
- 当前为设计阶段，无代码。

### 建议测试策略
- **单元测试**:
  - `qs` 序列化/反序列化逻辑 (包含边界值、特殊字符)。
  - `normalize` 函数的数据转换逻辑。
- **组件测试**:
  - `FilterPanel`: 验证 `submit` 事件触发时机，验证 `reset` 是否恢复默认值。
  - `DataTable`: 验证 `columns` 渲染正确，插槽内容正确挂载。
- **集成测试**:
  - URL `q` <-> 组件状态的双向同步流程。

---

## 7. 文档与示例 (Documentation & Examples)

### 检查结果
- ✅ **架构契约**: 包含详细的 Props/Emits/Interfaces 定义。
- ✅ **时序图**: 清晰描述了首次查询与筛选加载的时序。

### 改进建议
- **[P1] Storybook**: 建议后续产出 Storybook 文档，展示不同类型的 Filter 和 Table 配置。
- **[P2] 脚手架**: 提供一个 `useCrud(api)` 的组合式函数示例，自动连接 Page/Filter/Table，减少样板代码。

---

## 8. 总结与计划

### 问题清单 (按严重程度)

| ID | 严重程度 | 问题描述 | 建议方案 | 预估工时 |
|----|----------|----------|----------|----------|
| 1 | High (P0) | 缺乏 XSS 防护规范 | 明确 renderCell 返回类型，禁止不可信 v-html | 0.5h |
| 2 | High (P1) | 缺乏 A11y 规范 | 补充键盘导航与 ARIA 要求 | 1h |
| 3 | High (P1) | 大数据量渲染风险 | 引入虚拟滚动支持 (TableV2) | 4h |
| 4 | Medium (P1) | 缺少权限控制设计 | 在 TableColumn/FilterField 增加 permission 字段 | 2h |
| 5 | Medium (P2) | 缺少列设置功能 | 增加列显隐/排序配置组件 | 3h |

### 下一步计划
1. **完善设计文档**: 根据上述 P0/P1 问题，更新 `crud-table-component-design.md`。
2. **创建 GitHub Issue**: 将本报告转化为 Issue，关联任务。
3. **进入开发**: 按照修正后的设计文档进行组件开发。
