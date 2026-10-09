
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { LoadingProvider } from "@/components/feedback/loading-provider";
import { LanguageProvider } from "@/contexts/language-context";

import type { Language } from "@/contexts/language-context";

export const metadata: Metadata = {
  title: {
    default: "NorthstarBank | Online Banking",
    template: "%s | NorthstarBank",
  },

  description:
    "Explore NorthstarBank, a online banking application featuring account management, transfers, transaction history, and secure sign-in.",

  applicationName: "NorthstarBank",

  keywords: [
    "NorthstarBank",
    "Northstar Banking",
    "online banking demo",
    "banking application",
    "digital banking project",
    "account management",
    "money transfer",
  ],

  robots: {
    index: false,
    follow: false,
  },

  icons: {
    icon: [
      {
        url: "/northstar-icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/northstar-icon.png",
    apple: "/northstar-icon.png",
  },

  openGraph: {
    type: "website",
    siteName: "NorthstarBank",
    title: "NorthstarBank | Online Banking",
    description:
      "A digital banking experience featuring account management, transfers, and transaction tracking.",
    images: [
      {
        url: "/northstar-logo.png",
        width: 1728,
        height: 864,
        alt: "NorthstarBank — Your Trust. Our Priority.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "NorthstarBank | Online Banking",
    description:
      "Explore a digital banking application built for secure and fast transactions.",
    images: ["/northstar-logo.png"],
  },
};

const LANGUAGE_COOKIE_NAME = "northstar-language";

const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "fr",
  "es",
  "de",
  "pt",
];

function getValidLanguage(
  value: string | undefined
): Language {
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
