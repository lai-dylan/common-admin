<template>
  <component
    :is="config.component"
    :model-value="modelValue"
    size="small"
    v-bind="config.componentProps"
    :disabled="disabled"
    @update:model-value="(value: any) => emit('update:modelValue', value)"
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
