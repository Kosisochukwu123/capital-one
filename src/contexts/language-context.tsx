"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "fr" | "es" | "de" | "pt";

export const supportedLanguages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
] as const;

export const LANGUAGE_STORAGE_KEY = "northstar-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  isLanguageReady: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function isSupportedLanguage(
  value: unknown
): value is Language {
  return supportedLanguages.some((item) => item.code === value);
}

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: LanguageProviderProps) {
  // The initial value will come from the server-rendered cookie.
  const [language, setLanguageState] =
    useState<Language>(initialLanguage);

  const [isLanguageReady, setIsLanguageReady] = useState(false);

  const setLanguage = useCallback((nextLanguage: Language) => {
    if (!isSupportedLanguage(nextLanguage)) return;

    setLanguageState(nextLanguage);

    document.documentElement.lang = nextLanguage;

    // Persist language for the browser.
    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        nextLanguage
      );
    } catch {
      // Storage may be unavailable.
    }

    // Persist language for Next.js server rendering.
    document.cookie = [
      `${LANGUAGE_STORAGE_KEY}=${encodeURIComponent(nextLanguage)}`,
      "Path=/",
      "Max-Age=31536000",
      "SameSite=Lax",
      ...(window.location.protocol === "https:" ? ["Secure"] : []),
    ].join("; ");
  }, []);

  useEffect(() => {
    // Use the server-selected language as the initial source of truth.
    document.documentElement.lang = initialLanguage;

    // Keep browser storage synchronized with the server preference.
    try {
      window.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        initialLanguage
      );
    } catch {
      // Storage may be unavailable.
    }

    setIsLanguageReady(true);
  }, [initialLanguage]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;

      const nextLanguage = isSupportedLanguage(event.newValue)
        ? event.newValue
        : "en";

      setLanguageState(nextLanguage);
      document.documentElement.lang = nextLanguage;
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isLanguageReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}