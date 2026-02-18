<template>
  <el-input-number
    :model-value="typeof modelValue === 'number' ? modelValue : undefined"
    class="w-40!"
    size="small"
    v-bind="config.componentProps"
    :disabled="disabled"
    @update:model-value="(value: number | undefined) => emit('update:modelValue', value)"
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
