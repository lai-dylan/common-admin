import { defineStore } from "pinia";
import { ref } from "vue";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemeToDom(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.setAttribute("data-theme", mode);
}

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<ThemeMode>(getInitialTheme());

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, mode);
    applyThemeToDom(mode);
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  function initTheme() {
    applyThemeToDom(theme.value);
  }

  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme,
  };
});
