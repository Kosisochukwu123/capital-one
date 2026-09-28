"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/utils";

import { useAppLoader } from "@/components/feedback/loading-provider";

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

function formatTransactionDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function accountLabel(account: Account) {
  const name =
    account.type === "CHECKING"
      ? "Checking"
      : "Savings";

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

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

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
      <section className="bank-card rounded-[24px] p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#d9e1e5] bg-white px-4">
          <Search size={22} className="shrink-0 text-[#53666e]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search merchant, category, memo..."
            className="h-[64px] w-full bg-transparent text-[16px] outline-none placeholder:text-[#77858b]"
          />
        </div>

        <select
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          className="mt-4 h-[58px] w-full rounded-[16px] border border-[#d9e1e5] bg-[#edf4f7] px-4 text-[16px] outline-none"
        >
          <option value="all">
            All accounts
          </option>

          {accounts.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {accountLabel(item)}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="mt-4 h-[58px] w-full rounded-[16px] border border-[#d9e1e5] bg-[#edf4f7] px-4 text-[16px] outline-none"
        >
          <option value="all">
            All types
          </option>

          <option value="CREDIT">
            Credits
          </option>

          <option value="DEBIT">
            Debits
          </option>
        </select>
      </section>

      <section className="bank-card overflow-hidden rounded-[24px]">
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold">
              {transactions.length === 0
                ? "No transactions yet"
                : "No transactions found"}
            </p>

            <p className="mt-2 text-sm text-[#718087]">
              {transactions.length === 0
                ? "Your account activity will appear here."
                : "Try changing your search or filters."}
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
                    navigateWithLoader(`/transactions/${transaction.id}`)
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
                          "General"}
                      </span>

                      <span className="text-sm text-[#6e7c82]">
                        {formatTransactionDate(
                          transaction.transactionDate
                        )}
                      </span>
                    </div>
                  </div>

                  <p className={`whitespace-nowrap font-bold ${isCredit ? "text-[#159873]" : "text-[#243d46]"}`}>
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