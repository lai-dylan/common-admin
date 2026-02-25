<template>
  <el-dialog
    ref="elRef"
    v-model="modelValue"
    class="ui-dialog"
    :class="attrs.class"
    :style="attrs.style"
    :modal-class="computedModalClass"
    custom-class="ui-dialog"
    align-center
    show-close
    append-to-body
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
        <div class="ui-dialog__footer-actions">
          <ui-button type="secondary" @click="handleCancel">{{ cancelText }}</ui-button>
          <ui-button type="primary" :loading="confirmLoading" @click="handleConfirm">{{
            confirmText
          }}</ui-button>
        </div>
      </slot>
    </template>
  </el-dialog>
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

//.ui-dialog {
//  border: 1px solid var(--ui-dialog-border-color);
//  border-radius: var(--ui-dialog-radius);
//  background: var(--ui-dialog-bg);
//  overflow: hidden;
//  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
//}

//.ui-dialog .el-dialog__header {
//  margin-right: 0;
//  padding: 13px 20px;
//  background: var(--ui-dialog-header-bg);
//  border-bottom: 1px solid var(--ui-dialog-divider-color);
//}

//.ui-dialog .el-dialog__title {
//  color: var(--ui-dialog-title-color);
//  font-size: 16px;
//  font-weight: 600;
//  line-height: 1;
//}

//.ui-dialog .el-dialog__headerbtn {
//  top: 13px;
//  right: 16px;
//}

//.ui-dialog .el-dialog__headerbtn .el-dialog__close {
//  color: rgba(255, 255, 255, 0.88);
//  font-size: 20px;
//}

//.ui-dialog .el-dialog__body {
//  padding: 14px 20px 20px;
//  color: var(--ui-dialog-content-color);
//}

//.ui-dialog .el-dialog__footer {
//  padding: 0 20px 20px;
//}
//
//.ui-dialog__footer-actions {
//  display: flex;
//  justify-content: flex-end;
//  gap: 8px;
//}
</style>
