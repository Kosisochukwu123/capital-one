"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";

type AccountDetailsAccount = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
};

interface AccountDetailsProps {
  accounts: AccountDetailsAccount[];
}

const accountDetailsTranslations = {
  en: {
    description: "Account numbers for deposits",
    show: "Show",
    hide: "Hide",
    noDetails: "No account details available.",
    showNumbers: "Show account numbers",
    hideNumbers: "Hide account numbers",
  },
  fr: {
    description: "Numéros de compte pour les dépôts",
    show: "Afficher",
    hide: "Masquer",
    noDetails: "Aucune information de compte disponible.",
    showNumbers: "Afficher les numéros de compte",
    hideNumbers: "Masquer les numéros de compte",
  },
  es: {
    description: "Números de cuenta para depósitos",
    show: "Mostrar",
    hide: "Ocultar",
    noDetails: "No hay detalles de cuenta disponibles.",
    showNumbers: "Mostrar números de cuenta",
    hideNumbers: "Ocultar números de cuenta",
  },
  de: {
    description: "Kontonummern für Einzahlungen",
    show: "Anzeigen",
    hide: "Verbergen",
    noDetails: "Keine Kontodaten verfügbar.",
    showNumbers: "Kontonummern anzeigen",
    hideNumbers: "Kontonummern verbergen",
  },
  pt: {
    description: "Números de conta para depósitos",
    show: "Mostrar",
    hide: "Ocultar",
    noDetails: "Nenhum detalhe de conta disponível.",
    showNumbers: "Mostrar números de conta",
    hideNumbers: "Ocultar números de conta",
  },
} satisfies Record<
  Language,
  {
    description: string;
    show: string;
    hide: string;
    noDetails: string;
    showNumbers: string;
    hideNumbers: string;
  }
>;

export function AccountDetails({
  accounts,
}: AccountDetailsProps) {
  const [visible, setVisible] = useState(false);

  const { language } = useLanguage();

  const t = translations[language];
  const at = accountDetailsTranslations[language];

  const checking = accounts.find(
    (account) => account.type === "CHECKING"
  );

  const savings = accounts.find(
    (account) => account.type === "SAVINGS"
  );

  function maskAccountNumber(
    accountNumber?: string
  ) {
    if (!accountNumber) {
      return "—";
    }

    if (visible) {
      return accountNumber;
    }

    return `••••••${accountNumber.slice(-4)}`;
  }

  return (
    <section className="bank-card rounded-[24px] p-5 sm:p-7">
      {/* Section heading */}
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <h2 className="text-[24px] font-bold">
            {t.dashboard.accountDetails}
          </h2>

          <p className="mt-1 text-sm text-[#68787f]">
            {at.description}
          </p>
        </div>

        {/* Show / Hide account numbers */}
        <button
          type="button"
          onClick={() =>
            setVisible((current) => !current)
          }
          aria-expanded={visible}
          aria-label={
            visible
              ? at.hideNumbers
              : at.showNumbers
          }
          className="flex shrink-0 items-center gap-2 font-semibold text-[#c94951] transition hover:opacity-75"
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}

          {visible ? at.hide : at.show}
        </button>
      </div>

      {/* Account numbers */}
      {visible && (
        <div className="mt-6 overflow-hidden rounded-[20px] border border-[#dce4e8]">
          {checking && (
            <div className="flex items-center justify-between gap-4 px-5 py-5">
              <div className="min-w-0">
                <p className="font-semibold">
                  {t.dashboard.checking}
                </p>

                <p className="mt-1 text-xs text-[#68787f]">
                  {t.dashboard.accountNumber}
                </p>
              </div>

              <strong className="break-all text-right font-mono tracking-wide">
                {maskAccountNumber(
                  checking.accountNumber
                )}
              </strong>
            </div>
          )}

          {savings && (
            <div className="flex items-center justify-between gap-4 border-t border-[#e1e7ea] px-5 py-5">
              <div className="min-w-0">
                <p className="font-semibold">
                  {t.dashboard.savings}
                </p>

                <p className="mt-1 text-xs text-[#68787f]">
                  {t.dashboard.accountNumber}
                </p>
              </div>

              <strong className="break-all text-right font-mono tracking-wide">
                {maskAccountNumber(
                  savings.accountNumber
                )}
              </strong>
            </div>
          )}

          {!checking && !savings && (
            <div className="px-5 py-6 text-center text-sm text-[#68787f]">
              {at.noDetails}
            </div>
          )}
        </div>
      )}
    </section>
  );
}