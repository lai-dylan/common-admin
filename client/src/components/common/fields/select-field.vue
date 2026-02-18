<template>
  <el-select
    :model-value="modelValue as any"
    size="small"
    :placeholder="config.placeholder"
    class="w-40!"
    :clearable="config.clearable"
    :disabled="disabled"
    :loading="loading"
    :multiple="config.kind === 'multi-select'"
    :collapse-tags="config.kind === 'multi-select'"
    :collapse-tags-tooltip="config.kind === 'multi-select'"
    @visible-change="(visible: boolean) => emit('select-visible-change', visible)"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <el-option
      v-for="option in options"
      :key="String(option.value)"
      :value="option.value as any"
      :label="option.label"
      :disabled="option.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilterField, SelectOption } from "../types";

defineProps<{
  config: FilterField;
  modelValue: any;
  disabled: boolean;
  loading: boolean;
  options: SelectOption[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
  (event: "select-visible-change", visible: boolean): void;
}>();
</script>
