<template>
  <ElTabs
    ref="elRef"
    v-bind="tabsAttrs"
    v-model="modelValue"
    class="ui-tabs"
    :class="attrs.class"
    :style="attrs.style"
    data-ui="tabs"
    @tab-click="handleTabClick"
    @tab-change="handleTabChange"
    @edit="handleEdit"
    @tab-remove="handleTabRemove"
    @tab-add="handleTabAdd"
  >
    <template v-if="slots['add-icon']" #add-icon="slotProps">
      <slot name="add-icon" v-bind="slotProps ?? {}" />
    </template>
    <slot />
  </ElTabs>
</template>

<script setup lang="ts">
import { ElTabs } from "element-plus";
import type { TabPaneName, TabsPaneContext } from "element-plus/es/components/tabs/src/constants";
import type { TabsInstance, TabsPropsPublic } from "element-plus/es/components/tabs/src/tabs";
import { computed, useAttrs, useSlots, useTemplateRef } from "vue";
import { useExcludedAttrs } from "./hooks/useExcludedAttrs.ts";

defineOptions({
  name: "UiTabs",
  inheritAttrs: false,
});

// https://element-plus.org/zh-CN/component/tabs
const props = withDefaults(defineProps<TabsPropsPublic>(), {});
const modelValue = defineModel<string | number>();
const emit = defineEmits<{
  (e: "tabClick", pane: TabsPaneContext, event: Event): void;
  (e: "tabChange", name: TabPaneName): void;
  (e: "edit", paneName: TabPaneName | undefined, action: "remove" | "add"): void;
  (e: "tabRemove", name: TabPaneName): void;
  (e: "tabAdd"): void;
}>();

const elRef = useTemplateRef<TabsInstance>("elRef");
const attrs = useAttrs();
const slots = useSlots();

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const tabsAttrs = computed(() => ({
  ...forwardedAttrs.value,
  ...props,
}));

function handleTabClick(pane: TabsPaneContext, event: Event) {
  emit("tabClick", pane, event);
}

function handleTabChange(name: TabPaneName) {
  emit("tabChange", name);
}

function handleEdit(paneName: TabPaneName | undefined, action: "remove" | "add") {
  emit("edit", paneName, action);
}

function handleTabRemove(name: TabPaneName) {
  emit("tabRemove", name);
}

function handleTabAdd() {
  emit("tabAdd");
}

defineExpose({
  get currentName() {
    return elRef.value?.currentName;
  },
  get tabNavRef() {
    return elRef.value?.tabNavRef;
  },
  elRef,
});
</script>

<style lang="scss" scoped>
.ui-tabs {
}
</style>
