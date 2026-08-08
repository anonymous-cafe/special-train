"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DEFAULT_THEME,
  STORAGE_KEY,
  isThemeId,
  type ThemeId,
} from "@/lib/themes";

/**
 * ThemeProvider — wraps the whole app and exposes the active color theme.
 *
 * The boot script in `src/app/layout.tsx` may intentionally change the
 * `<html data-theme>` attribute before React hydrates so a saved theme can be
 * painted without a violet flash. Because localStorage does not exist on the
 * server, React's server snapshot must stay deterministic during hydration.
 * `useSyncExternalStore` gives us exactly that: the server/hydration snapshot
 * is always DEFAULT_THEME, then React switches to the browser snapshot after
 * hydration without producing a second tree mismatch.
 */

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (next: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_CHANGE_EVENT = "wacrm:theme-change";

function readBrowserTheme(): ThemeId {
  if (typeof document === "undefined") return DEFAULT_THEME;

  const fromAttr = document.documentElement.dataset.theme;
  if (isThemeId(fromAttr)) return fromAttr;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // localStorage can throw in private-browsing / sandboxed contexts.
  }

  return DEFAULT_THEME;
}

function getServerThemeSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

function subscribeToTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onThemeChange = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readBrowserTheme,
    getServerThemeSnapshot,
  );

  const setTheme = useCallback((next: ThemeId) => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = next;
    }

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The current tab still receives the DOM update above.
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: DEFAULT_THEME,
      setTheme: () => {},
    };
  }
  return ctx;
}
