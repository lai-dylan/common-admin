<template>
  <el-input
    :model-value="modelValue as any"
    :placeholder="config.placeholder"
    class="w-40!"
    size="small"
    :clearable="config.clearable"
    :disabled="disabled"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
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
