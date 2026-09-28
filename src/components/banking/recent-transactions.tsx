"use client";

import { ReceiptText } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
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

function formatTransactionDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const { navigateWithLoader } = useAppLoader();

  function handleSeeAll() {
    navigateWithLoader("/transactions");
  }

  return (
    <section className="bank-card overflow-hidden rounded-[24px]">
      <div className="flex items-center justify-between px-5 pb-3 pt-6 sm:px-7">
        <h2 className="text-[25px] font-bold">
          Recent transactions
        </h2>

        <button
          type="button"
          onClick={handleSeeAll}
          className="font-semibold text-[#c94951]"
        >
          See all
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 pb-9 pt-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
            <ReceiptText size={22} />
          </div>

          <p className="mt-4 font-semibold">
            No transactions yet
          </p>

          <p className="mt-1 max-w-[290px] text-sm leading-6 text-[#6d7b81]">
            Your recent account activity will appear here.
          </p>
        </div>
      ) : (
        <div>
          {transactions.map((transaction, index) => {
            const isCredit = transaction.type === "CREDIT";

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
                    {formatTransactionDate(transaction.transactionDate)}
                  </p>
                </div>

                <p className={`whitespace-nowrap text-[18px] font-bold ${isCredit ? "text-[#159873]" : "text-[#243d46]"}`}>
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