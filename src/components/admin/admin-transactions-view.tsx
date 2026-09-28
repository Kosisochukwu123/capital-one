"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";

type AdminTransaction = {
  id: string;
  reference: string;
  type: "CREDIT" | "DEBIT";
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REVERSED";
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
  transactionDate: Date;

  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  account: {
    id: string;
    type: "CHECKING" | "SAVINGS";
    accountNumber: string;
    currency: string;
  };
};

interface AdminTransactionsViewProps {
  transactions: AdminTransaction[];
}

type Filter =
  | "ALL"
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export function AdminTransactionsView({
  transactions,
}: AdminTransactionsViewProps) {
  const { navigateWithLoader } =
    useAppLoader();

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [search, setSearch] =
    useState("");

  const filteredTransactions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return transactions.filter(
        (transaction) => {
          if (
            filter !== "ALL" &&
            transaction.status !== filter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const customerName =
            `${transaction.user.firstName} ${transaction.user.lastName}`.toLowerCase();

          return (
            transaction.reference
              .toLowerCase()
              .includes(query) ||
            transaction.title
              .toLowerCase()
              .includes(query) ||
            transaction.user.email
              .toLowerCase()
              .includes(query) ||
            customerName.includes(query) ||
            transaction.account.accountNumber.includes(
              query
            )
          );
        }
      );
    }, [
      transactions,
      filter,
      search,
    ]);

  return (
    <div>
      <div className="rounded-[22px] border border-[#dfe7ea] bg-white p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718087]" size={19} />

          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, customer or account..." className="h-[52px] w-full rounded-[15px] border border-[#d6dfe3] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10" />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <FilterButton label="All" active={filter === "ALL"} onClick={() => setFilter("ALL")} />

          <FilterButton label="Pending" active={filter === "PENDING"} onClick={() => setFilter("PENDING")} />

          <FilterButton label="Completed" active={filter === "COMPLETED"} onClick={() => setFilter("COMPLETED")} />

          <FilterButton label="Failed" active={filter === "FAILED"} onClick={() => setFilter("FAILED")} />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ea] bg-white">
        {filteredTransactions.length ===
        0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-bold text-[#173743]">
              No transactions found
            </p>

            <p className="mt-2 text-sm text-[#718087]">
              Try another search or filter.
            </p>
          </div>
        ) : (
          filteredTransactions.map(
            (transaction, index) => {
              const fullName =
                `${transaction.user.firstName} ${transaction.user.lastName}`.trim();

              return (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() =>
                    navigateWithLoader(
                      `/admin/transactions/${transaction.id}`
                    )
                  }
                  className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#f7fafb] ${index !== 0 ? "border-t border-[#e2e8eb]" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-[#173743]">
                        {transaction.title}
                      </p>

                      <StatusBadge
                        status={
                          transaction.status
                        }
                      />
                    </div>

                    <p className="mt-1 truncate text-sm text-[#718087]">
                      {fullName ||
                        transaction.user.email}
                    </p>

                    <p className="mt-1 text-xs text-[#8a989e]">
                      {transaction.reference}
                    </p>

                    <p className="mt-1 text-xs text-[#8a989e]">
                      {formatDate(
                        transaction.transactionDate
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={`font-bold ${transaction.type === "CREDIT" ? "text-[#159873]" : "text-[#173743]"}`}>
                      {transaction.type ===
                      "CREDIT"
                        ? "+"
                        : "-"}
                      {formatMoney(
                        transaction.amount,
                        transaction.account.currency
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#718087]">
                      {transaction.account.type ===
                      "CHECKING"
                        ? "Checking"
                        : "Savings"}{" "}
                      ••••{" "}
                      {transaction.account.accountNumber.slice(
                        -4
                      )}
                    </p>
                  </div>
                </button>
              );
            }
          )
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${active ? "bg-[#003b4d] text-white" : "bg-[#f1f5f6] text-[#52656c] hover:bg-[#e7eef0]"}`}>
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "PENDING"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${styles}`}>
      {status}
    </span>
  );
}

function formatMoney(
  amount: number,
  currency: string
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    }
  ).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(date));
}