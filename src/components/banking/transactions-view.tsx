"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils";

type Account = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
};

type Transaction = {
  id: string;
  accountId: string;
  reference: string;
  type: "CREDIT" | "DEBIT";
  status: string;
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
  memo: string | null;
  transactionDate: Date;
};

interface TransactionsViewProps {
  accounts: Account[];
  transactions: Transaction[];
}

const languageLocales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

const transactionTranslations = {
  en: {
    searchPlaceholder: "Search merchant, category, memo...",
    allAccounts: "All accounts",
    allTypes: "All types",
    credits: "Credits",
    debits: "Debits",
    noTransactionsYet: "No transactions yet",
    noTransactionsFound: "No transactions found",
    emptyDescription: "Your account activity will appear here.",
    noResultsDescription: "Try changing your search or filters.",
    general: "General",
    searchLabel: "Search transactions",
    accountFilterLabel: "Filter by account",
    typeFilterLabel: "Filter by transaction type",
  },
  fr: {
    searchPlaceholder: "Rechercher un commerçant, une catégorie, une note...",
    allAccounts: "Tous les comptes",
    allTypes: "Tous les types",
    credits: "Crédits",
    debits: "Débits",
    noTransactionsYet: "Aucune transaction pour le moment",
    noTransactionsFound: "Aucune transaction trouvée",
    emptyDescription: "L'activité de votre compte apparaîtra ici.",
    noResultsDescription: "Essayez de modifier votre recherche ou vos filtres.",
    general: "Général",
    searchLabel: "Rechercher des transactions",
    accountFilterLabel: "Filtrer par compte",
    typeFilterLabel: "Filtrer par type de transaction",
  },
  es: {
    searchPlaceholder: "Buscar comercio, categoría, nota...",
    allAccounts: "Todas las cuentas",
    allTypes: "Todos los tipos",
    credits: "Créditos",
    debits: "Débitos",
    noTransactionsYet: "Aún no hay transacciones",
    noTransactionsFound: "No se encontraron transacciones",
    emptyDescription: "La actividad de tu cuenta aparecerá aquí.",
    noResultsDescription: "Prueba a cambiar la búsqueda o los filtros.",
    general: "General",
    searchLabel: "Buscar transacciones",
    accountFilterLabel: "Filtrar por cuenta",
    typeFilterLabel: "Filtrar por tipo de transacción",
  },
  de: {
    searchPlaceholder: "Händler, Kategorie oder Notiz suchen...",
    allAccounts: "Alle Konten",
    allTypes: "Alle Arten",
    credits: "Gutschriften",
    debits: "Belastungen",
    noTransactionsYet: "Noch keine Transaktionen",
    noTransactionsFound: "Keine Transaktionen gefunden",
    emptyDescription: "Ihre Kontobewegungen werden hier angezeigt.",
    noResultsDescription: "Ändern Sie Ihre Suche oder die Filter.",
    general: "Allgemein",
    searchLabel: "Transaktionen suchen",
    accountFilterLabel: "Nach Konto filtern",
    typeFilterLabel: "Nach Transaktionstyp filtern",
  },
  pt: {
    searchPlaceholder: "Pesquisar comerciante, categoria, nota...",
    allAccounts: "Todas as contas",
    allTypes: "Todos os tipos",
    credits: "Créditos",
    debits: "Débitos",
    noTransactionsYet: "Ainda não há transações",
    noTransactionsFound: "Nenhuma transação encontrada",
    emptyDescription: "A atividade da sua conta aparecerá aqui.",
    noResultsDescription: "Tente alterar a pesquisa ou os filtros.",
    general: "Geral",
    searchLabel: "Pesquisar transações",
    accountFilterLabel: "Filtrar por conta",
    typeFilterLabel: "Filtrar por tipo de transação",
  },
} satisfies Record<
  Language,
  {
    searchPlaceholder: string;
    allAccounts: string;
    allTypes: string;
    credits: string;
    debits: string;
    noTransactionsYet: string;
    noTransactionsFound: string;
    emptyDescription: string;
    noResultsDescription: string;
    general: string;
    searchLabel: string;
    accountFilterLabel: string;
    typeFilterLabel: string;
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

function accountLabel(
  account: Account,
  language: Language
) {
  const t = translations[language];

  const name =
    account.type === "CHECKING"
      ? t.dashboard.checking
      : t.dashboard.savings;

  return `${name} •••• ${account.accountNumber.slice(-4)}`;
}

export function TransactionsView({
  accounts,
  transactions,
}: TransactionsViewProps) {
  const [search, setSearch] = useState("");
  const [account, setAccount] = useState("all");
  const [type, setType] = useState("all");

  const { navigateWithLoader } = useAppLoader();
  const { language } = useLanguage();

  const tt = transactionTranslations[language];

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        transaction.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        transaction.category
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        transaction.memo
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        transaction.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesAccount =
        account === "all" ||
        transaction.accountId === account;

      const matchesType =
        type === "all" ||
        transaction.type === type;

      return (
        matchesSearch &&
        matchesAccount &&
        matchesType
      );
    });
  }, [transactions, search, account, type]);

  return (
    <div className="space-y-5">
      {/* Search and filters */}
      <section className="bank-card rounded-[24px] p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#d9e1e5] bg-white px-4">
          <Search
            size={22}
            className="shrink-0 text-[#53666e]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label={tt.searchLabel}
            placeholder={tt.searchPlaceholder}
            className="h-[64px] w-full bg-transparent text-[16px] outline-none placeholder:text-[#77858b]"
          />
        </div>

        {/* Account filter */}
        <select
          value={account}
          onChange={(event) =>
            setAccount(event.target.value)
          }
          aria-label={tt.accountFilterLabel}
          className="mt-4 h-[58px] w-full rounded-[16px] border border-[#d9e1e5] bg-[#edf4f7] px-4 text-[16px] outline-none"
        >
          <option value="all">
            {tt.allAccounts}
          </option>

          {accounts.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {accountLabel(item, language)}
            </option>
          ))}
        </select>

        {/* Transaction type filter */}
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          aria-label={tt.typeFilterLabel}
          className="mt-4 h-[58px] w-full rounded-[16px] border border-[#d9e1e5] bg-[#edf4f7] px-4 text-[16px] outline-none"
        >
          <option value="all">
            {tt.allTypes}
          </option>

          <option value="CREDIT">
            {tt.credits}
          </option>

          <option value="DEBIT">
            {tt.debits}
          </option>
        </select>
      </section>

      {/* Transaction results */}
      <section className="bank-card overflow-hidden rounded-[24px]">
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">
              {transactions.length === 0
                ? tt.noTransactionsYet
                : tt.noTransactionsFound}
            </p>

            <p className="mt-2 text-sm text-[#718087]">
              {transactions.length === 0
                ? tt.emptyDescription
                : tt.noResultsDescription}
            </p>
          </div>
        ) : (
          filteredTransactions.map(
            (transaction, index) => {
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
                  className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#f7fafb] ${index !== 0 ? "border-t border-[#e2e8eb]" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold">
                      {transaction.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#edf4f7] px-2 py-0.5 text-xs text-[#53666e]">
                        {transaction.category ??
                          tt.general}
                      </span>

                      <span className="text-sm text-[#6e7c82]">
                        {formatTransactionDate(
                          transaction.transactionDate,
                          language
                        )}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`whitespace-nowrap font-bold ${isCredit ? "text-[#159873]" : "text-[#243d46]"}`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(
                      transaction.amount
                    )}
                  </p>
                </button>
              );
            }
          )
        )}
      </section>
    </div>
  );
}