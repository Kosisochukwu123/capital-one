"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  LockKeyhole,
  PiggyBank,
  WalletCards,
} from "lucide-react";

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

interface AccountSummaryProps {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  accounts: DashboardAccount[];
}

export function AccountSummary({
  firstName,
  lastName,
  avatarUrl,
  accounts,
}: AccountSummaryProps) {
  const { navigateWithLoader } = useAppLoader();

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0
  );

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#005f78] via-[#004b61] to-[#003545] text-white shadow-sm">
      <div className="pointer-events-none absolute -right-20 -top-32 h-[330px] w-[330px] rounded-full bg-white/[0.05]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-[280px] w-[420px] rotate-[-18deg] rounded-[50%] border-[48px] border-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[300px] w-[300px] rounded-full border-[45px] border-white/[0.04]" />

      <div className="relative px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white/15 shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {initials || "CU"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[15px] text-white/70">
              Hello,
            </p>

            <h1 className="truncate text-xl font-bold tracking-tight">
              {firstName}!
            </h1>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm font-medium text-white/65">
            Total balance
          </p>

          <h2 className="mt-1 text-[36px] font-bold leading-none tracking-[-0.04em] sm:text-[42px]">
            {formatCurrency(totalBalance)}
          </h2>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold">
              Your accounts
            </p>

            <p className="mt-0.5 text-xs text-white/55">
              {accounts.length === 1
                ? "1 active account"
                : `${accounts.length} active accounts`}
            </p>
          </div>
        </div>

        {accounts.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onOpen={() =>
                  navigateWithLoader(
                    `/accounts/${account.id}`
                  )
                }
                onTransfer={() =>
                  navigateWithLoader("/payments")
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-white/15 bg-white/10 px-5 py-8 text-center backdrop-blur-sm">
            <p className="font-bold">
              No accounts available
            </p>

            <p className="mt-2 text-sm text-white/60">
              You currently have no open accounts.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AccountCard({
  account,
  onOpen,
  onTransfer,
}: {
  account: DashboardAccount;
  onOpen: () => void;
  onTransfer: () => void;
}) {
  const isFrozen =
    account.status === "FROZEN";

  const transfersDisabled =
    account.transferPermission === "DISABLED";

  const underReview =
    account.transferPermission === "REVIEW";

  const canTransfer =
    account.status === "ACTIVE" &&
    account.transferPermission === "ENABLED";

  const accountName =
    account.type === "CHECKING"
      ? "Checking"
      : "Savings";

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-white/[0.12] p-5 shadow-sm backdrop-blur-md">
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full border-[24px] border-white/[0.06]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                {account.type === "CHECKING" ? (
                  <WalletCards size={18} />
                ) : (
                  <PiggyBank size={18} />
                )}
              </div>

              <div>
                <p className="text-sm font-bold">
                  {accountName}
                </p>

                <p className="mt-0.5 text-xs text-white/60">
                  •••• {account.accountNumber.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${accountName} account`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="mt-6 text-2xl font-bold tracking-tight">
          {formatCurrency(account.balance)}
        </p>

        <p className="mt-1 text-xs text-white/55">
          Available balance
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
          <AccountStatus
            isFrozen={isFrozen}
            transfersDisabled={transfersDisabled}
            underReview={underReview}
          />

          <button
            type="button"
            disabled={!canTransfer}
            onClick={onTransfer}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-bold text-[#003b4d] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45"
          >
            Transfer
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountStatus({
  isFrozen,
  transfersDisabled,
  underReview,
}: {
  isFrozen: boolean;
  transfersDisabled: boolean;
  underReview: boolean;
}) {
  if (isFrozen) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-100">
        <AlertTriangle size={14} />
        Frozen
      </div>
    );
  }

  if (transfersDisabled) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100">
        <LockKeyhole size={14} />
        Transfers disabled
      </div>
    );
  }

  if (underReview) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100">
        <AlertTriangle size={14} />
        Under review
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100">
      <span className="h-2 w-2 rounded-full bg-emerald-300" />
      Active
    </span>
  );
}