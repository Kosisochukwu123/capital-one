"use client";

import { ChevronRight } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
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

function formatOpenedDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function BalanceDetails({
  firstName,
  lastName,
  accounts,
}: BalanceDetailsProps) {
  const { navigateWithLoader } = useAppLoader();

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
        Balance details
      </h2>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-[#dce4e8]">
        <div className="flex items-center justify-between px-5 py-5 text-[16px]">
          <span className="text-[#637279]">
            Account holder
          </span>

          <strong>
            {firstName} {lastName}
          </strong>
        </div>

        <button
          type="button"
          onClick={() =>
            openAccount(checking?.id)
          }
          disabled={!checking}
          className="flex w-full items-center justify-between border-t border-[#e1e7ea] px-5 py-5 text-left transition hover:bg-[#f7fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-[#637279]">
            Checking
          </span>

          <span className="flex items-center gap-2 font-bold">
            {formatCurrency(
              checking?.balance ?? 0
            )}
            <ChevronRight size={20} />
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            openAccount(savings?.id)
          }
          disabled={!savings}
          className="flex w-full items-center justify-between border-t border-[#e1e7ea] px-5 py-5 text-left transition hover:bg-[#f7fafb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-[#637279]">
            Savings
          </span>

          <span className="flex items-center gap-2 font-bold">
            {formatCurrency(
              savings?.balance ?? 0
            )}
            <ChevronRight size={20} />
          </span>
        </button>

        <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-5">
          <span className="text-[#637279]">
            Opened
          </span>

          <strong>
            {oldestAccount
              ? formatOpenedDate(
                  oldestAccount.openedAt
                )
              : "—"}
          </strong>
        </div>
      </div>
    </section>
  );
}