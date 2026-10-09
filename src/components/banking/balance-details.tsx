"use client";

import { ChevronRight } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils";

type DashboardAccount = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  currency: string;
  balance: number;
  status: string;
  transferPermission: string;
  openedAt: Date;
};

interface BalanceDetailsProps {
  firstName: string;
  lastName: string;
  accounts: DashboardAccount[];
}

// Locale mapping for proper date formatting.
const languageLocales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

// Translations specific to the balance details component.
const balanceTranslations = {
  en: {
    title: "Balance details",
    opened: "Opened",
  },
  fr: {
    title: "Détails du solde",
    opened: "Date d'ouverture",
  },
  es: {
    title: "Detalles del saldo",
    opened: "Fecha de apertura",
  },
  de: {
    title: "Kontostanddetails",
    opened: "Eröffnet am",
  },
  pt: {
    title: "Detalhes do saldo",
    opened: "Data de abertura",
  },
} satisfies Record<
  Language,
  {
    title: string;
    opened: string;
  }
>;

function formatOpenedDate(
  date: Date,
  language: Language
) {
  return new Intl.DateTimeFormat(
    languageLocales[language],
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(new Date(date));
}

export function BalanceDetails({
  firstName,
  lastName,
  accounts,
}: BalanceDetailsProps) {
  const { navigateWithLoader } = useAppLoader();
  const { language } = useLanguage();

  const t = translations[language];
  const bt = balanceTranslations[language];

  const checking = accounts.find(
    (account) => account.type === "CHECKING"
  );

  const savings = accounts.find(
    (account) => account.type === "SAVINGS"
  );

  const oldestAccount = accounts[0];

  function openAccount(accountId?: string) {
    if (!accountId) {
      return;
    }

    navigateWithLoader(`/accounts/${accountId}`);
  }

  return (
    <section className="bank-card rounded-[24px] p-5 sm:p-7">
      <h2 className="text-[25px] font-bold">
        {bt.title}
      </h2>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-[#dce4e8]">
        {/* Account holder */}
        <div className="flex items-center justify-between px-5 py-5 text-[16px]">
          <span className="text-[#637279]">
            {t.dashboard.accountHolder}
          </span>

          <strong>
            {firstName} {lastName}
          </strong>
        </div>

        {/* Checking account */}
        <button
          type="button"
          onClick={() => openAccount(checking?.id)}
          disabled={!checking}
          className="flex w-full items-center justify-between border-t border-[#e1e7ea] px-5 py-5 text-left transition hover:bg-[#f7fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-[#637279]">
            {t.dashboard.checking}
          </span>

          <span className="flex items-center gap-2 font-bold">
            {formatCurrency(checking?.balance ?? 0)}
            <ChevronRight size={20} />
          </span>
        </button>

        {/* Savings account */}
        <button
          type="button"
          onClick={() => openAccount(savings?.id)}
          disabled={!savings}
          className="flex w-full items-center justify-between border-t border-[#e1e7ea] px-5 py-5 text-left transition hover:bg-[#f7fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-[#637279]">
            {t.dashboard.savings}
          </span>

          <span className="flex items-center gap-2 font-bold">
            {formatCurrency(savings?.balance ?? 0)}
            <ChevronRight size={20} />
          </span>
        </button>

        {/* Account opening date */}
        <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-5">
          <span className="text-[#637279]">
            {bt.opened}
          </span>

          <strong>
            {oldestAccount
              ? formatOpenedDate(
                  oldestAccount.openedAt,
                  language
                )
              : "—"}
          </strong>
        </div>
      </div>
    </section>
  );
}