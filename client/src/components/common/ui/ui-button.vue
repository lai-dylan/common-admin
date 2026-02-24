<template>
  <button :class="buttonClass" type="button" v-bind="forwardedAttrs" :disabled="disabled">
    <template v-if="loading">
      <slot name="loading-icon">
        <svg
          class="h-3.5 w-3.5 animate-spin"
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

// const a11y = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[rgba(176,186,194,0.7)]";
// transition-[color,background-color,border-color,opacity] duration-200 ease-in-out

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none  disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      type: {
        primary: "bg-[var(--ui-button-bg-primary)]",
      },
      size: {
        default: "h-8 px-9 text-xs",
      },
      loading: {
        true: "pointer-events-none",
      },
    },
    defaultVariants: {
      type: "primary",
      size: "default",
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
