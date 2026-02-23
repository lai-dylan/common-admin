<template>
  <button :class="buttonClass" type="button" v-bind="forwardedAttrs" :disabled="disabled">
    <template v-if="loading">
      <slot name="loading-icon">
        <svg
          class="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
          ></circle>
          <path
            class="opacity-45"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </slot>
      <span>
        <slot></slot>
      </span>
    </template>

    <template v-else>
      <slot name="icon-left"></slot>
      <slot></slot>
      <slot name="icon-right"></slot>
    </template>
  </button>
</template>

<script setup lang="ts">
import { useExcludedAttrs } from "@/components/common/ui/hooks/useExcludedAttrs.ts";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { computed, useAttrs } from "vue";

defineOptions({
  name: "UiButton",
  inheritAttrs: false,
});

const attrs = useAttrs();

const EXCLUDED_ATTRS = ["class"] as const;
const forwardedAttrs = useExcludedAttrs(EXCLUDED_ATTRS);

const buttonVariants = cva(
  "inline-flex items-center rounded-md justify-center text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      type: {
        primary: "bg-blue-500 text-white hover:enabled:bg-blue-300",
      },
      size: {
        default: "px-4 py-1 gap-1",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10 p-0", // 只有icon
      },
      loading: {
        true: "opacity-60 pointer-events-none cursor-not-allowed",
      },
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

const props = withDefaults(
  defineProps<{
    type?: ButtonVariantProps["type"];
    size?: ButtonVariantProps["size"];
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "primary",
    size: "default",
  },
);

const buttonClass = computed(() => {
  const baseClass = buttonVariants({
    type: props.type,
    size: props.size,
    loading: props.loading,
  });

  return twMerge(baseClass, attrs.class as string);
});
</script>
