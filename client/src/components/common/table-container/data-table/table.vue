<template>
  <div :class="{ 'flex h-full flex-col': fullHeight }">
    <div
      v-if="$slots['table-actions']"
      class="mb-2! flex items-center justify-end"
      :class="{ 'flex-none': fullHeight }"
    >
      <slot name="table-actions"></slot>
    </div>

    <div :class="fullHeight ? 'min-h-0 flex-1' : ''">
      <el-table
        v-loading="loading"
        :data="rows"
        :row-key="resolveRowKeyFn"
        :height="fullHeight ? '100%' : undefined"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column v-if="selectable" type="selection" width="50" />
        <el-table-column
          v-for="config in visibleConfigs"
          :key="config.key"
          :prop="config.key"
          :width="config.width"
          :min-width="config.minWidth"
          :fixed="config.fixed"
          :align="config.align"
          :sortable="config.sortable === 'server' ? 'custom' : config.sortable"
          :class-name="config.className"
          :label-class-name="config.labelClassName"
        >
          <template #header>
            <component :is="resolveLabelRenderer(config)" />
          </template>
          <template #default="scope">
            <component :is="resolveCellRenderer(config, scope.row, scope.$index)" />
          </template>
        </el-table-column>
        <el-table-column v-if="$slots['row-actions']" fixed="right" label="操作" min-width="200">
          <template #default="scope">
            <slot name="row-actions" :row="scope.row" :row-index="scope.$index"></slot>
          </template>
        </el-table-column>
        <template #empty>
          <slot name="empty">
            <div class="empty-state">
              <el-empty description="暂无数据" />
            </div>
          </slot>
        </template>
      </el-table>
    </div>

    <div class="mt-2! flex justify-center" :class="{ 'flex-none': fullHeight }">
      <el-pagination
        :disabled="loading"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :total="pagination.total || 0"
        size="small"
        layout="total, sizes, prev, pager, next"
        @update:current-page="(page) => emit('update:page', page)"
        @update:page-size="(pageSize) => emit('update:page-size', pageSize)"
      />
    </div>
  </div>
</template>

<script setup lang="tsx">
import type { DataTableProps } from "@/components/common/types/table.ts";
import { computed, type VNode } from "vue";
import type { SortState, TableColumn, TableEmits, TableRow } from "../../types";
import { resolveRowKey } from "../utils/row-key";

const props = withDefaults(defineProps<DataTableProps>(), {
  columnConfigs: () => [],
});

const emit = defineEmits<TableEmits>();

const visibleConfigs = computed(() =>
  props.columnConfigs.filter((column) => {
    if (column.hidden == null) return true;
    if (typeof column.hidden === "function") return !column.hidden();
    return !column.hidden;
  }),
);

/**
 * 行 key 解析函数（供 el-table 使用）
 */
function resolveRowKeyFn(row: TableRow): string {
  return resolveRowKey(row, props.rowKey);
}

function handleSelectionChange(selection: TableRow[]) {
  const keys = selection.map((row) => resolveRowKey(row, props.rowKey));
  emit("selection-change", { rows: selection, keys });
}

function handleSortChange(payload: { prop: string; order: "ascending" | "descending" | null }) {
  if (!payload.order) {
    emit("sort-change", null);
    return;
  }
  const order: SortState["order"] = payload.order === "ascending" ? "asc" : "desc";
  emit("sort-change", { prop: payload.prop, order });
}

function resolveLabelRenderer(column: TableColumn): VNode {
  if (typeof column.label === "string") return <span>{column.label}</span>;
  return column.label();
}

function resolveCellRenderer(config: TableColumn, row: TableRow, rowIndex: number) {
  if (!config.renderCell) {
    return undefined;
  }

  return config.renderCell({
    row,
    rowIndex,
    key: config.key,
  });
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: var(--el-text-color-placeholder);
  }

  .empty-text {
    font-size: 14px;
  }
}
</style>
