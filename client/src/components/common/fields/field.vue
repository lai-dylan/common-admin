<template>
  <component
    :is="resolvedControl"
    :config="config"
    :model-value="modelValue"
    :disabled="disabled"
    :loading="loading"
    :options="options"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @select-visible-change="(visible: boolean) => emit('select-visible-change', visible)"
  />
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from "vue";
import type { FilterField, SelectOption } from "../types";

import CheckboxField from "./checkbox-field.vue";
import ComponentField from "./component-field.vue";
import DateField from "./date-field.vue";
import InputField from "./input-field.vue";
import NumberField from "./number-field.vue";
import SelectField from "./select-field.vue";

const props = defineProps<{
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

const resolvedControl = computed(() => {
  if (props.config.kind === "component" && props.config.component) {
    return ComponentField;
  }
  if (props.config.kind === "input") {
    return InputField;
  }
  if (props.config.kind === "number") {
    return NumberField;
  }
  if (props.config.kind === "select" || props.config.kind === "multi-select") {
    return SelectField;
  }
  if (props.config.kind === "checkbox" || props.config.kind === "checkbox-group") {
    return CheckboxField;
  }
  return DateField;
});
</script>
