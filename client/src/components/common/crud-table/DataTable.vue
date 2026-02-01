<template>
  <div>
    <div class="flex justify-end items-center mb-4!">
      <slot name="table-actions"></slot>
    </div>
    <el-table
        v-if="!virtualized"
        :data="rows"
        :row-key="resolveRowKeyValue"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
    >
      <el-table-column v-if="selectable" type="selection" width="50"/>
      <el-table-column
          v-for="config in visibleConfigs"
          :key="config.key"
          :prop="config.key"
          :label="config.title"
          :width="config.width"
          :min-width="config.minWidth"
          :fixed="config.fixed"
          :align="config.align"
          :sortable="config.sortable === 'server' ? 'custom' : config.sortable"
          :class-name="config.className"
          :header-class-name="config.headerClassName"
          :header-style="resolveHeaderStyle(config)"
          :cell-style="resolveCellStyle(config)"
      >
        <template #header>
          <slot
              v-if="config.headerSlot"
              :name="config.headerSlot"
              :column="config"
          ></slot>
          <slot
              v-else
              :name="`header-${config.key}`"
              :column="config"
          >
              <span v-if="config.renderHeader">
                <component :is="renderHeader(config)"/>
              </span>
            <span v-else>{{ config.title }}</span>
          </slot>
        </template>
        <template #default="scope">
          <slot
              v-if="config.cellSlot"
              :name="config.cellSlot"
              :row="scope.row"
              :rowIndex="scope.$index"
              :value="scope.row[config.key]"
              :column="config"
          ></slot>
          <slot
              v-else
              :name="`cell-${config.key}`"
              :row="scope.row"
              :rowIndex="scope.$index"
              :value="scope.row[config.key]"
              :column="config"
          >
            <template v-if="config.renderCell">
              <template
                  v-if="typeof config.renderCell({ row: scope.row, rowIndex: scope.$index, value: scope.row[config.key], columnKey: config.key }) === 'string'">
                {{
                  config.renderCell({
                    row: scope.row,
                    rowIndex: scope.$index,
                    value: scope.row[config.key],
                    columnKey: config.key
                  })
                }}
              </template>
              <component
                  :is="config.renderCell({ row: scope.row, rowIndex: scope.$index, value: scope.row[config.key], columnKey: config.key })"
                  v-else/>
            </template>
            <span v-else>
                {{ scope.row[config.key] }}
              </span>
          </slot>
        </template>
      </el-table-column>
      <el-table-column
          v-if="$slots['row-actions']"
          fixed="right"
          label="操作"
          min-width="140"
      >
        <template #default="scope">
          <slot name="row-actions" :row="scope.row" :rowIndex="scope.$index"></slot>
        </template>
      </el-table-column>
      <template #empty>
        <slot name="empty">
          <div class="empty-state">
            <el-empty description="暂无数据"/>
          </div>
        </slot>
      </template>
    </el-table>
    <el-table-v2
        v-else
        :columns="v2Columns"
        :data="rows"
        :row-height="virtualizedRowHeight"
        :height="v2Height"
        :width="v2Width"
        class="virtualized-table"
        @row-click="handleV2RowClick"
    />
    <div class="flex justify-center mt-4!">
      <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="pageSizes"
          :total="pagination.total || 0"
          layout="total, sizes, prev, pager, next"
          @update:current-page="page => emit('update:page', page)"
          @update:page-size="pageSize => emit('update:pageSize', pageSize)"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="Row extends Record<string, unknown>">
import {computed, h} from "vue";
import type {DataTableEmits, DataTableProps, RowKey, SortState, TableColumn} from "./types";

const props = withDefaults(defineProps<DataTableProps<Row>>(), {
  selectable: false,
  virtualized: false,
  virtualizedRowHeight: 44,
});
const emit = defineEmits<DataTableEmits<Row>>();

const pageSizes = computed(() => [10, 20, 50, 100]);

const visibleConfigs = computed(() =>
    props.columnConfigs.filter(column => {
      if (column.defaultHidden) return false;
      if (typeof column.permission === "function") return column.permission();
      return true;
    })
);

function resolveRowKeyValue(row: Row): string {
  if (typeof props.rowKey === "function") return String(props.rowKey(row));
  if (typeof props.rowKey === "string") return String(row[props.rowKey]);
  return String((row as Row & { id?: RowKey }).id ?? "");
}

function handleSelectionChange(selection: Row[]) {
  const keys = selection.map(row => resolveRowKeyValue(row));
  emit("selection-change", {rows: selection, keys});
}

function handleSortChange(payload: { prop: string; order: "ascending" | "descending" | null }) {
  if (!payload.order) {
    emit("sort-change", null);
    return;
  }
  const order: SortState["order"] = payload.order === "ascending" ? "asc" : "desc";
  emit("sort-change", {prop: payload.prop, order});
}

function renderHeader(column: TableColumn<Row>) {
  return column.renderHeader ? h("span", {}, column.renderHeader()) : null;
}

function renderCell(column: TableColumn<Row>, row: Row, rowIndex: number) {
  if (!column.renderCell) return null;
  return column.renderCell({
    row,
    rowIndex,
    value: row[column.key],
    columnKey: column.key,
  });
}

function resolveHeaderStyle(column: TableColumn<Row>) {
  return typeof column.headerStyle === "function" ? column.headerStyle({columnKey: column.key}) : column.headerStyle;
}

function resolveCellStyle(column: TableColumn<Row>) {
  return typeof column.cellStyle === "function"
      ? column.cellStyle({row: {} as Row, rowIndex: 0, value: undefined, columnKey: column.key})
      : column.cellStyle;
}

const v2Columns = computed(() =>
    visibleConfigs.value.map(config => {
      const cellContent = config.renderCell
          ? config.renderCell({row: {} as Row, rowIndex: 0, value: undefined, columnKey: config.key})
          : undefined;
      return {
        key: config.key,
        dataKey: config.key,
        title: config.title,
        width: Number(config.width || 160),
        align: config.align || "left",
        cellRenderer: ({rowData, rowIndex}: { rowData: Row; rowIndex: number }) => {
          if (!config.renderCell) return rowData[config.key];
          const content = config.renderCell({
            row: rowData,
            rowIndex,
            value: rowData[config.key],
            columnKey: config.key
          });
          return typeof content === "string" ? content : content ?? rowData[config.key];
        },
        headerRenderer: () => renderHeader(config) || config.title,
      };
    })
);

const v2Height = computed(() => Math.min(560, props.rows.length * (props.virtualizedRowHeight || 44) + 64));
const v2Width = computed(() => 1200);

function handleV2RowClick(row: Row, rowIndex: number) {
  emit("row-action", {action: "row-click", row, rowIndex});
}
</script>

<style lang="scss" scoped>
</style>
