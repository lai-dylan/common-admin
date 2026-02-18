<template>
  <el-checkbox
    v-if="config.kind === 'checkbox'"
    :model-value="modelValue as any"
    size="small"
    :disabled="disabled"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    {{ config.placeholder }}
  </el-checkbox>
  <el-checkbox-group
    v-else
    :model-value="(modelValue ?? []) as any"
    class="w-40!"
    size="small"
    :disabled="disabled"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <template v-if="(config.checkboxStyle ?? 'default') === 'button'">
      <el-checkbox-button
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value as any"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-checkbox-button>
    </template>
    <template v-else>
      <el-checkbox
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value as any"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-checkbox>
    </template>
  </el-checkbox-group>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FilterField, SelectOption } from "../types";

defineProps<{
  config: FilterField;
  modelValue: any;
  disabled: boolean;
  options: SelectOption[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
}>();
</script>
