/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, type ComputedRef, reactive } from "vue";
import type { FilterField, SelectOption } from "../types";

type Filters = Record<string, any>;

export function useFilterOptions(visibleConfigs: ComputedRef<FilterField<Filters>[]>) {
  const optionsMap = reactive<Record<string, SelectOption[]>>({});
  const optionsLoadingMap = reactive<Record<string, boolean>>({});
  const optionsErrorMap = reactive<Record<string, string | null>>({});
  const requestSequenceMap = reactive<Record<string, number>>({});

  const panelLoading = computed(() => Object.values(optionsLoadingMap).some(Boolean));

  function getFieldOptions(field: FilterField<Filters>) {
    return optionsMap[field.key] || field.options || [];
  }

  function isFieldLoading(key: keyof Filters) {
    return optionsLoadingMap[key] || false;
  }

  async function fetchFieldOptions(field: FilterField<Filters>) {
    if (!field.loadOptions) return;
    const key = String(field.key);
    const nextSequence = (requestSequenceMap[key] ?? 0) + 1;
    requestSequenceMap[key] = nextSequence;
    optionsLoadingMap[key] = true;
    optionsErrorMap[key] = null;

    try {
      const options = await field.loadOptions();
      if (requestSequenceMap[key] !== nextSequence) return;
      optionsMap[key] = options;
    } catch (error) {
      if (requestSequenceMap[key] !== nextSequence) return;
      optionsErrorMap[key] = (error as Error)?.message || "加载失败";
    } finally {
      if (requestSequenceMap[key] === nextSequence) {
        optionsLoadingMap[key] = false;
      }
    }
  }

  async function fetchFilterOptions() {
    const tasks = visibleConfigs.value.map((config) => fetchFieldOptions(config));
    await Promise.allSettled(tasks);
  }

  async function refetchFieldOptions(field: FilterField<Filters>) {
    await fetchFieldOptions(field);
  }

  function handleSelectVisible(field: FilterField<Filters>, visible: boolean) {
    if (!visible) return;
    const key = field.key;
    if (optionsMap[key]?.length || !field.loadOptions || optionsLoadingMap[key]) return;
    void fetchFieldOptions(field);
  }

  return {
    optionsMap,
    optionsErrorMap,
    panelLoading,
    getFieldOptions,
    isFieldLoading,
    fetchFieldOptions,
    fetchFilterOptions,
    refetchFieldOptions,
    handleSelectVisible,
  };
}
