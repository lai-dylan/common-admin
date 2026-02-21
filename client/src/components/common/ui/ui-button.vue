<template>
  <ElButton
    ref="elRef"
    v-bind="buttonAttrs"
    class="ui-button"
    :class="attrs.class"
    :style="attrs.style"
    data-ui="button"
  >
    <template v-if="slots.loading" #loading="slotProps">
      <slot name="loading" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="slots.icon" #icon="slotProps">
      <slot name="icon" v-bind="slotProps ?? {}" />
    </template>
    <slot />
  </ElButton>
</template>

<script setup lang="ts">
import { ElButton, type ButtonInstance, type ButtonProps } from "element-plus";
import { computed, useAttrs, useSlots, useTemplateRef } from "vue";
import { useExcludedAttrs } from "./hooks/useExcludedAttrs.ts";

defineOptions({
  name: "UiButton",
  inheritAttrs: false,
});

// https://element-plus.org/zh-CN/component/button
const props = withDefaults(defineProps<ButtonProps>(), {});
const elRef = useTemplateRef<ButtonInstance>("elRef");
const attrs = useAttrs();
const slots = useSlots();

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const buttonAttrs = computed(() => ({
  ...forwardedAttrs.value,
  ...props,
}));

defineExpose({
  get size() {
    return elRef.value?.size;
  },
  get type() {
    return elRef.value?.type;
  },
  get disabled() {
    return elRef.value?.disabled;
  },
  get shouldAddSpace() {
    return elRef.value?.shouldAddSpace;
  },
  elRef,
});
</script>

<style lang="scss" scoped>
.ui-button {
  border-radius: var(--ui-button-radius);
}
</style>
