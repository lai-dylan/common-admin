# [Refactor] CRUD Table Component Architecture & Review Findings

## Overview
This issue tracks the implementation of the CRUD Table component refactoring and the resolution of findings from the design review conducted on 2026-02-01.

**Review Document**: `docs/reviews/2026-02-01-crud-table-review.md`

## Architecture Goals
- **Decoupling**: Strictly separate `Page Container` (Logic/State), `FilterPanel` (Form UI), and `DataTable` (Presentation).
- **State Management**: Use URL `q` parameter as the Single Source of Truth, synced via `qs` library.
- **Async Handling**: Support parallel loading of filter options and manage loading states gracefully.

## Action Items (Prioritized)

### P0 - Critical / Security
- [ ] **XSS Prevention**: Ensure `renderCell` returns VNodes or sanitized content; strictly avoid direct `v-html` with user input.
- [ ] **Type Definitions**: Extract core types (`FilterField`, `TableColumn`, `PaginationState`) to `types.ts` to prevent circular dependencies.

### P1 - High Priority / Core Features
- [ ] **Permission Control**: Add `permission` field to `TableColumn` and `FilterField` for granular access control.
- [ ] **Virtual Scroll Strategy**: Define strategy for large datasets (e.g., switch to `TableV2` when rows > 500 or add `virtualized` prop).
- [ ] **A11y Compliance**: Ensure ARIA labels for filter expansion/sorting and keyboard navigation support.
- [ ] **Delete Protection**: Enforce "Double Confirmation" pattern for delete actions in parent component documentation/examples.

### P2 - Enhancements / UX
- [ ] **Column Customization**: Implement column width persistence and visibility toggling.
- [ ] **Table Density**: Add support for Compact/Default/Relaxed density modes.
- [ ] **Focus Management**: Optimize focus restoration after filtering/querying.
- [ ] **Plugin Mechanism**: Explore hooks for reusable logic (e.g., `useTableSelection`).

## Implementation Checklist
- [ ] Update `docs/crud-table-component-design.md` with missing features (Permissions, Virtual Scroll).
- [ ] Create `types.ts` shared definition file.
- [ ] Implement `PageContainer` with `useUrlSync` hook.
- [ ] Implement `FilterPanel` with async loading support.
- [ ] Implement `DataTable` with TSX/Slot support.
- [ ] Add Unit/Component tests as per review strategy.

## References
- Design Doc: `docs/crud-table-component-design.md`
- Review Report: `docs/reviews/2026-02-01-crud-table-review.md`
