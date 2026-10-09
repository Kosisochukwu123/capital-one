
"use client";

import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import {
  supportedLanguages,
  useLanguage,
  type Language,
} from "@/contexts/language-context";

const registerPageTranslations: Record<
  Language,
  {
    title: string;
    description: string;
    selectLanguage: string;
  }
> = {
  en: {
    title: "Create your account",
    description:
      "Enter your information to create your banking profile.",
    selectLanguage: "Select language",
  },
  fr: {
    title: "Créer votre compte",
    description:
      "Saisissez vos informations pour créer votre profil bancaire.",
    selectLanguage: "Choisir la langue",
  },
  es: {
    title: "Crea tu cuenta",
    description:
      "Introduce tus datos para crear tu perfil bancario.",
    selectLanguage: "Seleccionar idioma",
  },
  de: {
    title: "Konto erstellen",
    description:
      "Geben Sie Ihre Daten ein, um Ihr Bankprofil zu erstellen.",
    selectLanguage: "Sprache auswählen",
  },
  pt: {
    title: "Criar a sua conta",
    description:
      "Introduza os seus dados para criar o seu perfil bancário.",
    selectLanguage: "Selecionar idioma",
  },
};

export default function RegisterPage() {
  const { language, setLanguage, isLanguageReady } =
    useLanguage();

  const [languageOpen, setLanguageOpen] = useState(false);

  const t = registerPageTranslations[language];

  const selectedLanguage =
    supportedLanguages.find(
      (item) => item.code === language
    ) ?? supportedLanguages[0];

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#173743]">
      <header className="border-b border-[#e5eaed] bg-white">
        <div className="mx-auto flex h-[78px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex min-w-0 items-center">
            <Image
              src="/northstar-logo.png"
              alt="NorthstarBank — Your Trust. Our Priority."
              width={210}
              height={105}
              priority
              className="h-auto w-[145px] object-contain sm:w-[185px]"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setLanguageOpen((current) => !current)
              }
              aria-expanded={languageOpen}
              aria-label={t.selectLanguage}
              disabled={!isLanguageReady}
              className="flex items-center gap-2 rounded-xl border border-[#e2e8eb] px-3 py-2.5 text-sm font-semibold text-[#173743] hover:bg-[#f4f8fa] disabled:opacity-60"
            >
              <span className="text-xl">
                {selectedLanguage.flag}
              </span>

              <span>{selectedLanguage.name}</span>

              <ChevronDown size={16} />
            </button>

            {languageOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[205px] overflow-hidden rounded-xl border border-[#e2e8eb] bg-white py-1 shadow-xl">
                {supportedLanguages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setLanguageOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[#f2f7f9]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">
                        {item.flag}
                      </span>

                      {item.name}
                    </span>

                    {language === item.code && (
                      <Check size={16} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[620px] px-4 pb-14 pt-10 sm:pt-14">
        <div className="mb-8 text-center">
          <div className="mx-auto flex max-w-[310px] items-center justify-center">
            <Image
              src="/northstar-logo.png"
              alt="NorthstarBank — Your Trust. Our Priority."
              width={600}
              height={300}
              priority
              className="h-auto w-full object-contain"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#173743]">
            {t.title}
          </h1>

          <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-[#66777e]">
            {t.description}
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
