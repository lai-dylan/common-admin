import { computed, useAttrs, type ComputedRef } from "vue";

export function useExcludedAttrs<T extends readonly string[]>(
  excludedAttrs: T,
): ComputedRef<Omit<Record<string, unknown>, T[number]>> {
  const attrs = useAttrs();
  return computed(() => {
    const excludeKeys = new Set(excludedAttrs);
    return Object.fromEntries(
      Object.entries(attrs).filter(([key]) => !excludeKeys.has(key)),
    ) as Omit<Record<string, unknown>, T[number]>;
  });
}
