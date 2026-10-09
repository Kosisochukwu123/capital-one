"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

const closeTranslations = {
  en: {
    closeCustomerCare: "Close customer care",
    close: "Close",
  },
  fr: {
    closeCustomerCare: "Fermer le service client",
    close: "Fermer",
  },
  es: {
    closeCustomerCare: "Cerrar atención al cliente",
    close: "Cerrar",
  },
  de: {
    closeCustomerCare: "Kundenservice schließen",
    close: "Schließen",
  },
  pt: {
    closeCustomerCare: "Fechar o apoio ao cliente",
    close: "Fechar",
  },
} satisfies Record<
  Language,
  {
    closeCustomerCare: string;
    close: string;
  }
>;

export function SupportCloseButton() {
  const router = useRouter();
  const { language } = useLanguage();

  const t = closeTranslations[language];

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label={t.closeCustomerCare}
      title={t.close}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743] transition hover:bg-[#dfecef] active:scale-95"
    >
      <X size={20} />
    </button>
  );
}