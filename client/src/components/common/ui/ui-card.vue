<template>
  <ElCard
    ref="elRef"
    v-bind="cardAttrs"
    class="ui-card"
    :class="attrs.class"
    :style="attrs.style"
    data-ui="card"
  >
    <template v-if="slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps ?? {}" />
    </template>
    <slot />
    <template v-if="slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps ?? {}" />
    </template>
  </ElCard>
</template>
<script setup lang="ts">
import { type CardInstance, ElCard } from "element-plus";
import type { CardPropsPublic } from "element-plus/es/components/card/src/card";
import { computed, useAttrs, useSlots, useTemplateRef, withDefaults } from "vue";
import { useExcludedAttrs } from "./hooks/useExcludedAttrs.ts";

defineOptions({
  name: "UiCard",
  inheritAttrs: false,
});

// https://element-plus.org/zh-CN/component/card
const props = withDefaults(defineProps<CardPropsPublic>(), {});
const elRef = useTemplateRef<CardInstance>("elRef");
const attrs = useAttrs();
const slots = useSlots();

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const cardAttrs = computed(() => ({
  ...forwardedAttrs.value,
  ...props,
}));

defineExpose({
  elRef,
});
</script>

<style lang="scss" scoped>
.ui-card {
  border-radius: var(--ui-card-radius);
}
</style>
