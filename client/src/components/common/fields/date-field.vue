<template>
  <el-date-picker
    v-if="config.kind === 'date'"
    :model-value="modelValue as any"
    size="small"
    type="date"
    :placeholder="config.placeholder"
    :clearable="config.clearable"
    :disabled="disabled"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
  <el-date-picker
    v-else
    :model-value="(modelValue ?? null) as any"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    size="small"
    :clearable="config.clearable"
    :disabled="disabled"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilterField } from "../types";

defineProps<{
  config: FilterField;
  modelValue: any;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
}>();
</script>
