<!--https://element-plus.org/zh-CN/component/button.html-->
<template>
  <ElButton
    ref="elRef"
    v-bind="buttonAttrs"
    class="ui-button"
    :class="attrs.class"
    :style="attrs.style"
    data-ui="button"
  >
    <slot />
    <template v-for="name in slotNames" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
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

const props = defineProps<ButtonProps>();

const elRef = useTemplateRef<ButtonInstance>("elRef");
const attrs = useAttrs();
const slots = useSlots();

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const buttonAttrs = computed(() => ({
  ...forwardedAttrs.value,
  ...props,
}));

const slotNames = computed(() => {
  if (!slots) return [];
  return Object.keys(slots)
    .filter((name) => name !== "default")
    .filter((name) => typeof slots[name] === "function");
});

defineExpose<{
  buttonInstance: typeof elRef;
}>({
  buttonInstance: elRef,
});
</script>

<style lang="scss" scoped>
.ui-button {
  --ui-button-radius: 10px;
  --ui-button-font-weight: 600;

  border-radius: var(--ui-button-radius);
  font-weight: var(--ui-button-font-weight);
}

::v-deep(.el-button--primary) {
  background-color: var(--el-color-primary);
}
</style>
