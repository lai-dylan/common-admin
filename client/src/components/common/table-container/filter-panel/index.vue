<template>
  <div v-loading="panelLoading" class="rounded-lg border border-gray-200 p-4">
    <el-form
      class="table-filter-form flex flex-wrap items-center gap-2"
      :model="filterModel"
      :disabled="disabled"
      @submit.prevent
    >
      <template v-for="config in visibleConfigs" :key="String(config.key)">
        <el-form-item :label="config.label">
          <FieldControl
            :config="config"
            :model-value="getFieldValue(config)"
            :disabled="Boolean(disabled || config.disabled)"
            :loading="isFieldLoading(config.key)"
            :options="getFieldOptions(config)"
            @update:model-value="(value) => updateFieldValue(config, value)"
            @select-visible-change="(value: boolean) => handleSelectVisible(config, value)"
          />
          <ui-button v-if="optionsErrorMap[config.key]" @click="refetchFieldOptions(config)">
            重试
          </ui-button>
        </el-form-item>
      </template>
    </el-form>
    <div class="filter-actions mt-4 flex gap-2">
      <ui-button type="primary" :disabled="panelLoading" size="default" @click="handleSubmit">
        <template #icon-left>
          <el-icon><Plus /></el-icon>
        </template>
        查询
        <template #icon-right
          ><el-icon><Plus /></el-icon
        ></template>
      </ui-button>
      <ui-button :disabled="true" size="default" @click="handleReset"> 重置 </ui-button>
      <ui-button :disabled="panelLoading" size="default" @click="handleRefresh">
        刷新选项
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import FieldControl from "@/components/common/fields/field.vue";
import type {
  FilterPanelEmits,
  FilterPanelExpose,
  FilterPanelProps,
} from "@/components/common/types/filter";
import { computed, onMounted, reactive, ref, unref, watch } from "vue";
import { useFilterOptions } from "../../hooks/use-filter-options.ts";
import type { FilterField, Filters } from "../../types";

const props = defineProps<FilterPanelProps>();
const emit = defineEmits<FilterPanelEmits>();

function resolveInitialFilters(): Filters {
  const val =
    typeof props.initialFilters === "function" ? props.initialFilters() : props.initialFilters;
  return { ...(val || {}) };
}

const filterModel = reactive<Record<string, unknown>>(resolveInitialFilters());
const initialized = ref(false);
const initPromise = ref<PromiseWithResolvers<void> | null>(null);

const visibleConfigs = computed(() =>
  (unref(props.filterConfigs) || []).filter((field) => {
    if (typeof field.hidden === "function") return !field.hidden();
    if (typeof field.hidden === "boolean") return !field.hidden;
    return true;
  }),
);

const {
  optionsErrorMap,
  panelLoading,
  getFieldOptions,
  isFieldLoading,
  fetchFilterOptions: fetchOptionsInVisibleConfigs,
  refetchFieldOptions: refetchSingleFieldOptions,
  handleSelectVisible,
} = useFilterOptions(visibleConfigs);

watch(panelLoading, (value) => emit("update:loading", value), { immediate: true });

function getFieldValue(field: FilterField) {
  return filterModel[field.key];
}

function updateFieldValue(field: FilterField, value: unknown) {
  filterModel[field.key] = value;
}

function isDefaultEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || value === "";
}

function isFieldEmpty(field: FilterField, value: unknown) {
  if (typeof field.isEmpty === "function") return field.isEmpty(value);
  return isDefaultEmptyValue(value);
}

/**
 * 为空值字段自动选择第一项选项（仅 select/multi-select 有效）
 */
function applySelectFirstByDefault() {
  visibleConfigs.value.forEach((config) => {
    if (config.kind !== "select" && config.kind !== "multi-select") return;
    if (!config.selectFirstByDefault) return;

    const currentValue = filterModel[config.key];
    if (!isFieldEmpty(config, currentValue)) return;

    const options = getFieldOptions(config);
    if (options.length === 0) return;

    const firstValue = options[0].value;
    filterModel[config.key] = config.kind === "multi-select" ? [firstValue] : firstValue;
  });
}

async function fetchFilterOptions() {
  await fetchOptionsInVisibleConfigs();
  applySelectFirstByDefault();

  if (!initialized.value) {
    initialized.value = true;
    emit("update:initialized", true);
    // resolve promise
    initPromise.value?.resolve();
    initPromise.value = null;
  }
}

async function refetchFieldOptions(field: FilterField) {
  await refetchSingleFieldOptions(field);
  applySelectFirstByDefault();
}

function normalizeFieldValue(config: FilterField, rawValue: unknown) {
  let value = rawValue;

  if (config.kind === "input" && typeof value === "string") {
    value = value.trim();
  }

  return config.normalize ? config.normalize(value) : value;
}

function normalizeFilters(): Partial<Filters> {
  const result: Partial<Filters> = {};
  visibleConfigs.value.forEach((config) => {
    const key = config.key;
    const raw = filterModel[key];
    const normalized = normalizeFieldValue(config, raw);
    if (!isFieldEmpty(config, normalized)) {
      (result as Record<string, unknown>)[key] = normalized;
    }
  });
  return result;
}

function appendFilters(filters: Partial<Filters>) {
  Object.assign(filterModel, filters);
}

function replaceFilters(filters: Partial<Filters> = {}) {
  Object.keys(filterModel).forEach((key) => {
    delete filterModel[key];
  });
  Object.assign(filterModel, resolveInitialFilters());
  Object.assign(filterModel, filters);
}

function getFilters(): Partial<Filters> {
  return normalizeFilters();
}

function handleReset() {
  replaceFilters();
  emit("reset");
}

async function handleRefresh() {
  await fetchFilterOptions();
}

function handleSubmit() {
  emit("submit", normalizeFilters());
}

/**
 * 等待初始化完成（返回 Promise）
 */
function ready(): Promise<void> {
  if (initialized.value) return Promise.resolve();
  if (!initPromise.value) {
    initPromise.value = Promise.withResolvers<void>();
  }
  return initPromise.value.promise;
}

onMounted(async () => {
  await fetchFilterOptions();
});

defineExpose<FilterPanelExpose>({
  reset: handleReset,
  appendFilters,
  replaceFilters,
  getFilters,
  ready,
});
</script>

<style lang="scss" scoped>
@media (max-width: 768px) {
  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.table-filter-form {
  :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
  }

  //:deep(.el-form-item__label) {
  //  font-size: 12px;
  //  font-weight: 500;
  //  color: var(--ui-text-secondary);
  //  line-height: 32px;
  //}

  //:deep(.el-input__wrapper),
  //:deep(.el-select__wrapper),
  //:deep(.el-input-number) {
  //  border-radius: 8px;
  //  min-height: 32px;
  //  box-shadow: none;
  //}
}
</style>
