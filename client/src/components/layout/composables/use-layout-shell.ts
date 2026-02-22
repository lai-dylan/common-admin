import { useWindowSize } from "@vueuse/core";
import { computed, provide, ref, type ComputedRef, type InjectionKey, inject, type Ref } from "vue";

type LayoutShellContext = {
  isCollapsed: Ref<boolean>;
  isMobile: ComputedRef<boolean>;
  toggleCollapse: () => void;
  collapse: () => void;
  collapseOnMobile: () => void;
};

const layoutShellKey: InjectionKey<LayoutShellContext> = Symbol("layout-shell");

export function provideLayoutShell(): LayoutShellContext {
  const { width } = useWindowSize();
  const isMobile = computed(() => width.value < 768);
  const isCollapsed = ref(false);

  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value;
  }

  function collapse() {
    isCollapsed.value = true;
  }

  function collapseOnMobile() {
    if (isMobile.value) {
      collapse();
    }
  }

  const shell: LayoutShellContext = {
    isCollapsed,
    isMobile,
    toggleCollapse,
    collapse,
    collapseOnMobile,
  };

  provide(layoutShellKey, shell);
  return shell;
}

export function useLayoutShell(): LayoutShellContext {
  const shell = inject(layoutShellKey);
  if (!shell) {
    throw new Error("useLayoutShell must be used within layout provider");
  }
  return shell;
}
