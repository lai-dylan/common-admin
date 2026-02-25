<template>
  <ElDialog
    ref="elRef"
    v-model="modelValue"
    :class="attrs.class"
    :style="attrs.style"
    :modal-class="computedModalClass"
    custom-class="ui-dialog"
    v-bind="dialogProps"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <template v-if="slots.header" #header>
      <slot name="header" />
    </template>

    <slot />

    <template v-if="showFooter" #footer>
      <slot name="footer">
        <div class="footer-actions">
          <ui-button type="secondary" @click="handleCancel">{{ cancelText }}</ui-button>
          <ui-button type="primary" :loading="confirmLoading" @click="handleConfirm">{{
            confirmText
          }}</ui-button>
        </div>
      </slot>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { type DialogInstance, DialogProps, ElDialog } from "element-plus";
import { computed, useAttrs, useSlots, useTemplateRef, withDefaults } from "vue";
import { useExcludedAttrs } from "./hooks/useExcludedAttrs.ts";
import UiButton from "./ui-button.vue";

defineOptions({
  name: "UiDialog",
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    DialogProps & {
      showFooter?: boolean;
      confirmText?: string;
      cancelText?: string;
      confirmLoading?: boolean;
      modalClass?: string;
    }
  >(),
  {
    showFooter: true,
    confirmText: "确认",
    cancelText: "取消",
    confirmLoading: false,
    modalClass: "",
    alignCenter: true,
    showClose: true,
    closeOnClickModal: false,
    appendToBody: true,
  },
);

const modelValue = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "open"): void;
  (e: "opened"): void;
  (e: "close"): void;
  (e: "closed"): void;
}>();

const attrs = useAttrs();
const slots = useSlots();
const elRef = useTemplateRef<DialogInstance>("elRef");

const EXCLUDED_ATTRS = ["class", "style"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const dialogProps = computed(() => {
  const excludeProps = [
    "showFooter",
    "confirmText",
    "cancelText",
    "confirmLoading",
    "modalClass",
  ] as const;

  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !excludeProps.includes(key as (typeof excludeProps)[number]),
    ),
  ) as Omit<typeof props, (typeof excludeProps)[number]>;

  return {
    ...filteredProps,
    ...(forwardedAttrs.value ?? {}),
  } as DialogProps;
});

const computedModalClass = computed(() => {
  return ["ui-dialog-mask", props.modalClass].filter(Boolean).join(" ");
});

function handleCancel() {
  emit("cancel");
}

function handleConfirm() {
  emit("confirm");
}

defineExpose({
  elRef,
});
</script>

<style lang="scss">
.ui-dialog-mask {
  background: var(--ui-dialog-overlay);
}

.el-dialog[custom-class="ui-dialog"] {
  max-height: 90vh;
  border: 1px solid var(--ui-dialog-border-color);
  border-radius: var(--ui-dialog-radius);
  background: var(--ui-dialog-bg);
  overflow-y: auto;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
  padding: 0;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__header {
  background: var(--ui-dialog-header-bg);
  padding: 14px 20px;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__title {
  color: var(--ui-dialog-title-color);
  font-size: 16px;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__headerbtn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__close {
  color: #fff;
  font-size: 20px;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__body {
  padding: 14px 20px;
}

.el-dialog[custom-class="ui-dialog"] .el-dialog__footer {
  padding: 20px;
}

.el-dialog[custom-class="ui-dialog"] .footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
