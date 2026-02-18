import type { Component } from "vue";
import type { Filters, MaybeRef } from "./core.ts";

export interface SelectOption<Value = unknown> {
  label: string;
  value: Value;
  disabled?: boolean;
}

export type FilterFieldKind =
  | "input"
  | "number"
  | "select"
  | "multi-select"
  | "checkbox"
  | "checkbox-group"
  | "date"
  | "daterange"
  | "component";

export interface FilterField {
  key: string;
  label: string;
  kind: FilterFieldKind;
  hidden?: boolean | (() => boolean);
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  options?: SelectOption[];
  loadOptions?: () => Promise<SelectOption[]>;
  /** 当选项加载完成后，自动选择第一项（仅 select/multi-select 有效） */
  selectFirstByDefault?: boolean;
  component?: Component;
  componentProps?: Record<string, unknown>;
  checkboxStyle?: "default" | "button";
  isEmpty?: (value: unknown) => boolean;
  normalize?: (draftValue: unknown) => unknown;
}

export interface FilterPanelProps {
  initialFilters: Partial<Filters> | (() => Partial<Filters>);
  filterConfigs: MaybeRef<Array<FilterField>>;
  disabled?: boolean;
}

export interface FilterPanelExpose {
  reset: () => void;
  appendFilters: (filters: Partial<Filters>) => void;
  replaceFilters: (filters?: Partial<Filters>) => void;
  getFilters: () => Partial<Filters>;
  /** 等待初始化完成 */
  ready: () => Promise<void>;
}

export interface FilterPanelEmits {
  (event: "update:loading", loading: boolean): void;
  (event: "update:initialized", initialized: boolean): void;
  (event: "submit", filters: Partial<Filters>): void;
  (event: "reset"): void;
}
