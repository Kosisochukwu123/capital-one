import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { LoadingProvider } from "@/components/feedback/loading-provider";
import { LanguageProvider } from "@/contexts/language-context";

import type { Language } from "@/contexts/language-context";

export const metadata: Metadata = {
  title: "Northstar Banking",
  description: "Online banking",
};

const LANGUAGE_COOKIE_NAME = "northstar-language";

const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "fr",
  "es",
  "de",
  "pt",
];

function getValidLanguage(value: string | undefined): Language {
  if (
    value &&
    SUPPORTED_LANGUAGES.includes(value as Language)
  ) {
    return value as Language;
  }

  return "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const savedLanguage = cookieStore.get(
    LANGUAGE_COOKIE_NAME
  )?.value;

  const initialLanguage = getValidLanguage(savedLanguage);

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}