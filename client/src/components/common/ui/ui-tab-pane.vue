<template>
  <ElTabPane
    ref="elRef"
    v-bind="tabPaneAttrs"
    class="ui-tab-pane"
    :class="attrs.class"
    :style="attrs.style"
    data-ui="tab-pane"
  >
    <template v-if="slots.label" #label="slotProps">
      <slot name="label" v-bind="slotProps ?? {}" />
    </template>
    <slot />
  </ElTabPane>
</template>

<script setup lang="ts">
import { ElTabPane } from "element-plus";
import type { TabPaneInstance, TabPaneProps } from "element-plus/es/components/tabs/src/tab-pane";
import { computed, useAttrs, useSlots, useTemplateRef } from "vue";
import { useExcludedAttrs } from "./hooks/useExcludedAttrs.ts";

defineOptions({
  name: "UiTabPane",
  inheritAttrs: false,
});

// https://element-plus.org/zh-CN/component/tabs
const props = withDefaults(defineProps<TabPaneProps>(), {});
const elRef = useTemplateRef<TabPaneInstance>("elRef");
const attrs = useAttrs();
const slots = useSlots();

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const tabPaneAttrs = computed(() => ({
  ...forwardedAttrs.value,
  ...props,
}));

defineExpose({
  elRef,
});
</script>

<style lang="scss" scoped>
.ui-tab-pane {
}
</style>
