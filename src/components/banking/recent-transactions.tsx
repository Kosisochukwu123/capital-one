"use client";

import { ReceiptText } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils";

type DashboardTransaction = {
  id: string;
  reference: string;
  type: "CREDIT" | "DEBIT";
  status: string;
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
  transactionDate: Date;
  accountId: string;
};

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
}

const languageLocales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

const recentTransactionTranslations = {
  en: {
    emptyTitle: "No transactions yet",
    emptyDescription:
      "Your recent account activity will appear here.",
  },
  fr: {
    emptyTitle: "Aucune transaction pour le moment",
    emptyDescription:
      "Vos opérations récentes apparaîtront ici.",
  },
  es: {
    emptyTitle: "Aún no hay transacciones",
    emptyDescription:
      "La actividad reciente de tu cuenta aparecerá aquí.",
  },
  de: {
    emptyTitle: "Noch keine Transaktionen",
    emptyDescription:
      "Ihre letzten Kontobewegungen werden hier angezeigt.",
  },
  pt: {
    emptyTitle: "Ainda não há transações",
    emptyDescription:
      "As atividades recentes da sua conta aparecerão aqui.",
  },
} satisfies Record<
  Language,
  {
    emptyTitle: string;
    emptyDescription: string;
  }
>;

function formatTransactionDate(
  date: Date,
  language: Language
) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    languageLocales[language],
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(parsedDate);
}

export function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const { navigateWithLoader } = useAppLoader();
  const { language } = useLanguage();

  const t = translations[language];
  const rt = recentTransactionTranslations[language];

  function handleSeeAll() {
    navigateWithLoader("/transactions");
  }

  return (
    <section className="bank-card overflow-hidden rounded-[24px]">
      {/* Section heading */}
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-6 sm:px-7">
        <h2 className="min-w-0 text-[22px] font-bold sm:text-[25px]">
          {t.dashboard.recentTransactions}
        </h2>

        <button
          type="button"
          onClick={handleSeeAll}
          className="shrink-0 font-semibold text-[#c94951]"
        >
          {t.common.seeAll}
        </button>
      </div>

      {/* Empty state */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 pb-9 pt-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
            <ReceiptText size={22} />
          </div>

          <p className="mt-4 font-semibold">
            {rt.emptyTitle}
          </p>

          <p className="mt-1 max-w-[290px] text-sm leading-6 text-[#6d7b81]">
            {rt.emptyDescription}
          </p>
        </div>
      ) : (
        <div>
          {transactions.map((transaction, index) => {
            const isCredit =
              transaction.type === "CREDIT";

            return (
              <button
                key={transaction.id}
                type="button"
                onClick={() =>
                  navigateWithLoader(
                    `/transactions/${transaction.id}`
                  )
                }
                className={`flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 ${index !== 0 ? "border-t border-[#e4eaed]" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-semibold">
                    {transaction.title}
                  </p>

                  <p className="mt-1 text-sm text-[#6d7b81]">
                    {formatTransactionDate(
                      transaction.transactionDate,
                      language
                    )}
                  </p>
                </div>

                <p
                  className={`whitespace-nowrap text-[18px] font-bold ${isCredit ? "text-[#159873]" : "text-[#243d46]"}`}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}