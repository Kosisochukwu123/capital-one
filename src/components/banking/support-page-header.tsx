"use client";

import { Headphones } from "lucide-react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

import { SupportCloseButton } from "@/components/banking/support-close-button";

const headerTranslations = {
  en: {
    customerCare: "Customer care",
    supportMessages: "Support messages",
  },
  fr: {
    customerCare: "Service client",
    supportMessages: "Messages d'assistance",
  },
  es: {
    customerCare: "Atención al cliente",
    supportMessages: "Mensajes de soporte",
  },
  de: {
    customerCare: "Kundenservice",
    supportMessages: "Support-Nachrichten",
  },
  pt: {
    customerCare: "Apoio ao cliente",
    supportMessages: "Mensagens de apoio",
  },
} satisfies Record<
  Language,
  {
    customerCare: string;
    supportMessages: string;
  }
>;

export function SupportPageHeader() {
  const { language } = useLanguage();
  const t = headerTranslations[language];

  return (
    <div className="mb-4 flex items-center justify-between rounded-[20px] bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#006b7d]">
          <Headphones size={20} />
        </div>

        <div>
          <p className="font-bold text-[#173743]">
            {t.customerCare}
          </p>

          <p className="text-xs text-[#718087]">
            {t.supportMessages}
          </p>
        </div>
      </div>

      <SupportCloseButton />
    </div>
  );
}