import { pick } from "lodash-es";
import { computed, type ComputedRef, type Ref } from "vue";
import { type LocationQueryRaw, useRoute, useRouter } from "vue-router";
import type { Filters } from "../../types";
import { decode, encode } from "../../utils/queryQ";

export interface UrlSyncOptions {
  /**
   * 需要同步到 URL 的字段 key 列表
   */
  filterKeys: Ref<string[]>;
  /**
   * 是否启用 URL 同步
   */
  enabled?: boolean;
}

export function useUrlSync(options: UrlSyncOptions) {
  const { filterKeys, enabled = true } = options;

  const route = useRoute();
  const router = useRouter();

  /**
   * 从 URL 中解析的筛选条件
   */
  const filtersFromUrl: ComputedRef<Filters> = computed(() => {
    if (!enabled) return {};
    const keys = filterKeys.value;
    return pick(decode(route.query.q), keys) as Filters;
  });

  /**
   * URL 中是否有筛选参数
   */
  const hasUrlFilters: ComputedRef<boolean> = computed(() => {
    return Object.keys(filtersFromUrl.value).length > 0;
  });

  /**
   * 将筛选条件同步到 URL
   */
  function syncToUrl(filters: Filters): void {
    if (!enabled) return;

    const q = encode(filters);
    const prevQ = route.query.q;

    // 避免重复更新
    if ((q || undefined) === prevQ) return;

    const nextQuery = { ...route.query };

    if (!q) {
      delete nextQuery.q;
    } else {
      nextQuery.q = q;
    }

    void router.replace({ query: nextQuery as LocationQueryRaw });
  }

  /**
   * 清除 URL 中的筛选参数
   */
  function clearUrlFilters(): void {
    if (!enabled) return;

    const nextQuery = { ...route.query };
    delete nextQuery.q;

    void router.replace({ query: nextQuery as LocationQueryRaw });
  }

  return {
    // 状态
    filtersFromUrl,
    hasUrlFilters,

    // 方法
    syncToUrl,
    clearUrlFilters,
  };
}

export type UrlSync = ReturnType<typeof useUrlSync>;
