import { computed, useAttrs, type ComputedRef } from "vue";

/**
 * 过滤 attrs 的通用函数
 * @param excludedAttrs 要排除的属性名数组
 * @returns 过滤后的 attrs 对象
 */
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
