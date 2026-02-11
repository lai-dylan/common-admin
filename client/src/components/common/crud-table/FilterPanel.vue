<template>
  <div v-loading="panelLoading" class="p-4! rounded-lg border border-gray-200">
    <el-form
        :model="draftFilters"
        :disabled="disabled"
        inline
        @submit.prevent
    >
      <template v-for="config in visibleConfigs" :key="String(config.key)">
        <slot
            v-if="config.slotName"
            :name="config.slotName"
            :field="config"
            :model="draftFilters"
            size="small"
            :update="updateField"
        ></slot>
        <slot
            v-else
            :name="`field-${String(config.key)}`"
            :field="config"
            :model="draftFilters"
            size="small"
            :update="updateField"
        >
          <el-form-item :label="config.label">
            <slot
                :name="`control-${String(config.key)}`"
                :field="config"
                :model="draftFilters"
                size="small"
                :update="updateField"
            >
              <component
                  v-if="config.kind === 'component' && config.component"
                  :is="config.component"
                  :model-value="getFieldValue(config)"
                  size="small"
                  v-bind="config.componentProps"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              />
              <el-input
                  v-else-if="config.kind === 'input'"
                  :model-value="getFieldValue(config) as any"
                  :placeholder="config.placeholder"
                  class="w-40!"
                  size="small"

                  :clearable="config.clearable"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              />
              <el-input-number
                  v-else-if="config.kind === 'number'"
                  :model-value="(getFieldValue(config) ?? null) as any"
                  class="w-40!"
                  size="small"
                  v-bind="config.componentProps"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              />
              <el-select
                  v-else-if="config.kind === 'select'"
                  :model-value="getFieldValue(config) as any"
                  size="small"
                  :placeholder="config.placeholder"
                  class="w-40!"
                  :clearable="config.clearable"
                  :disabled="disabled || config.disabled"
                  :loading="fieldLoading(config.key)"
                  @visible-change="handleSelectVisible(config, $event)"
                  @update:model-value="handleUpdate(config, $event)"
              >
                <el-option
                    v-for="option in fieldOptions(config)"
                    :key="String(option.value)"
                    :value="option.value as any"
                    :label="option.label"
                    :disabled="option.disabled"
                />
              </el-select>
              <el-select
                  v-else-if="config.kind === 'multi-select'"
                  :model-value="getFieldValue(config) as any"
                  size="small"
                  class="w-40!"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  :placeholder="config.placeholder"
                  :clearable="config.clearable"
                  :disabled="disabled || config.disabled"
                  :loading="fieldLoading(config.key)"
                  @visible-change="handleSelectVisible(config, $event)"
                  @update:model-value="handleUpdate(config, $event)"
              >
                <el-option
                    v-for="option in fieldOptions(config)"
                    :key="String(option.value)"
                    :value="option.value as any"
                    :label="option.label"
                    :disabled="option.disabled"
                />
              </el-select>
              <el-checkbox
                  v-else-if="config.kind === 'checkbox'"
                  :model-value="getFieldValue(config) as any"
                  size="small"

                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              >
                {{ config.placeholder }}
              </el-checkbox>
              <el-checkbox-group
                  v-else-if="config.kind === 'checkbox-group'"
                  :model-value="(getFieldValue(config) ?? []) as any"
                  class="w-40!"
                  size="small"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              >
                <template v-if="(config.checkboxStyle ?? 'default') === 'button'">
                  <el-checkbox-button
                      v-for="option in fieldOptions(config)"
                      :key="String(option.value)"
                      :value="option.value as any"
                      :disabled="option.disabled"
                  >{{ option.label }}</el-checkbox-button>
                </template>
                <template v-else>
                  <el-checkbox
                      v-for="option in fieldOptions(config)"
                      :key="String(option.value)"
                      :value="option.value as any"
                      :disabled="option.disabled"
                  >{{ option.label }}</el-checkbox>
                </template>
              </el-checkbox-group>
              <el-date-picker
                  v-else-if="config.kind === 'date'"
                  :model-value="getFieldValue(config) as any"
                  size="small"
                  type="date"
                  :placeholder="config.placeholder"
                  :clearable="config.clearable"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              />
              <el-date-picker
                  v-else-if="config.kind === 'daterange'"
                  :model-value="(getFieldValue(config) ?? null) as any"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"

                  :clearable="config.clearable"
                  :disabled="disabled || config.disabled"
                  @update:model-value="handleUpdate(config, $event)"
              />
            </slot>
            <el-button
                v-if="fieldError(config.key)"
                text
                type="danger"
                @click="retryField(config)"
            >
              重试
            </el-button>
          </el-form-item>
        </slot>
      </template>
      <div class="filter-actions">
        <slot
            name="actions"
            :loading="panelLoading"
            :disabled="disabled"
            :submit="handleSubmit"
            :reset="handleReset"
            :refresh="refreshOptions"
        >
          <el-button type="primary" :disabled="panelLoading" @click="handleSubmit" size="small">
            查询
          </el-button>
          <el-button :disabled="panelLoading" @click="handleReset" size="small">
            重置
          </el-button>
          <el-button :disabled="panelLoading" @click="handleRefresh" size="small">
            刷新选项
          </el-button>
        </slot>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, reactive, ref, unref, watch} from "vue";
import {ElMessageBox} from "element-plus";
import {isEqual} from "lodash-es";
import type {
  FilterField,
  FilterPanelEmits,
  FilterPanelExpose,
  FilterPanelProps,
  SelectOption,
} from "./types";

type Filters = Record<string, unknown>;
const props = defineProps<FilterPanelProps<any>>();
const emit = defineEmits<FilterPanelEmits<any>>();

function resolveInitialFilters(): Record<string, unknown> {
  const val = typeof props.initialFilters === "function" ? (props.initialFilters as () => Record<string, unknown>)() : props.initialFilters;
  return {...(val || {})};
}
const draftFilters = reactive<Record<string, unknown>>(resolveInitialFilters());
const optionsMap = reactive<Record<string, SelectOption[]>>({});
const optionsLoadingMap = reactive<Record<string, boolean>>({});
const optionsErrorMap = reactive<Record<string, string | null>>({});
const ready = ref(false);
const initialized = ref(false);

const visibleConfigs = computed(() =>
    (unref(props.filterConfigs) || []).filter(field => {
      if (typeof field.hidden === "function") return !field.hidden();
      if (typeof field.hidden === "boolean") return !field.hidden;
      if (typeof field.permission === "function") return field.permission();
      return true;
    })
);

const panelLoading = computed(() => Object.values(optionsLoadingMap).some(Boolean));

watch(panelLoading, value => emit("update:loading", value), {immediate: true});

function fieldOptions(field: FilterField<any>) {
  return optionsMap[String(field.key)] || field.options || [];
}

function fieldLoading(key: any) {
  return optionsLoadingMap[String(key)] || false;
}

function fieldError(key: any) {
  return optionsErrorMap[String(key)];
}

function updateField(key: any, value: any) {
  draftFilters[String(key)] = value;
}

function getFieldValue(field: FilterField<any>): unknown {
  return draftFilters[String(field.key)];
}

// 模型值直接透传，必要时在模板中使用 `as any` 以避免不必要的类型噪音

function handleUpdate(field: FilterField<any>, value: unknown) {
  updateField(field.key, value as any);
}

function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || value === "";
}

function resolveDefaultValue(field: FilterField<any>) {
  if (typeof field.defaultValue === "function") return (field.defaultValue as () => Filters[keyof Filters])();
  return field.defaultValue;
}

function applyDefaults(timing: "init" | "optionsReady") {
  visibleConfigs.value.forEach(config => {
    const applyTiming = config.applyDefaultTiming || "init";
    if (applyTiming !== timing) return;
    const currentValue = draftFilters[String(config.key)];
    if (!isEmptyValue(currentValue)) return;
    const defaultValue = resolveDefaultValue(config);
    if (!isEmptyValue(defaultValue)) {
      draftFilters[String(config.key)] = defaultValue as any;
      return;
    }
    if (
        config.autoSelectFirst &&
        (config.kind === "select" || config.kind === "multi-select") &&
        fieldOptions(config).length > 0
    ) {
      const firstValue = fieldOptions(config)[0].value;
      draftFilters[String(config.key)] =
          config.kind === "multi-select" ? ([firstValue] as any) : (firstValue as any);
    }
  });
}

async function loadFieldOptions(field: FilterField<any>) {
  if (!field.loadOptions) return;
  const key = String(field.key);
  optionsLoadingMap[key] = true;
  optionsErrorMap[key] = null;
  try {
    const options = await field.loadOptions();
    optionsMap[key] = options;
  } catch (error) {
    optionsErrorMap[key] = (error as Error)?.message || "加载失败";
  } finally {
    optionsLoadingMap[key] = false;
  }
}

async function refreshOptions() {
  const tasks = visibleConfigs.value.map(config => loadFieldOptions(config));
  await Promise.allSettled(tasks);
  applyDefaults("optionsReady");
  if (!ready.value) {
    ready.value = true;
    emit("update:ready", true);
  }
}

async function retryField(field: FilterField<any>) {
  await loadFieldOptions(field);
  applyDefaults("optionsReady");
}

function normalizeFilters() {
  const result: Record<string, unknown> = {};
  visibleConfigs.value.forEach(config => {
    const key = String(config.key);
    const raw = draftFilters[key];
    const normalized = config.normalize ? config.normalize(raw) : (raw as any);
    if (!isEmptyValue(normalized)) {
      result[key] = normalized as any;
    }
  });
  return result as any;
}

function setDraftFilters(filters: Partial<Filters>, options?: { replace?: boolean }) {
  if (options?.replace) {
    Object.keys(draftFilters).forEach(key => {
      delete draftFilters[key];
    });
    Object.assign(draftFilters, resolveInitialFilters());
    Object.assign(draftFilters, filters);
    applyDefaults("init");
    return;
  }
  Object.assign(draftFilters, filters);
}

function getFilters(): Partial<Filters> {
  return normalizeFilters();
}

async function handleReset() {
  if (!isEqual(props.initialFilters, draftFilters)) {
    const confirmed = await ElMessageBox.confirm("确定要重置筛选条件吗？", "重置确认", {
      type: "warning",
      distinguishCancelAndClose: true,
    }).then(() => true).catch(() => false);
    if (!confirmed) return;
  }
  Object.keys(draftFilters).forEach(key => {
    delete draftFilters[key];
  });
  Object.assign(draftFilters, resolveInitialFilters());
  applyDefaults("init");
  emit("reset");
}

async function handleRefresh() {
  if (!isEqual(props.initialFilters, draftFilters)) {
    const confirmed = await ElMessageBox.confirm("刷新筛选项会清空未提交的修改，是否继续？", "刷新确认", {
      type: "warning",
      distinguishCancelAndClose: true,
    }).then(() => true).catch(() => false);
    if (!confirmed) return;
  }
  await refreshOptions();
}

function handleSelectVisible(field: FilterField<any>, visible: boolean) {
  if (!visible) return;
  const key = String(field.key);
  if (optionsMap[key]?.length || !field.loadOptions || optionsLoadingMap[key]) return;
  loadFieldOptions(field);
}

function handleSubmit() {
  emit("submit", normalizeFilters());
}

onMounted(async () => {
  if (!initialized.value) {
    applyDefaults("init");
    await nextTick();
    await refreshOptions();
    initialized.value = true;
  }
});

defineExpose<FilterPanelExpose<Filters>>({
  reset: handleReset,
  refreshOptions,
  setDraftFilters,
  getFilters,
});
</script>

<style lang="scss" scoped>
@media (max-width: 768px) {
  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
