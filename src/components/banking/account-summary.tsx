"use client";

import {
  AlertTriangle,
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
  btcBalance: string;
  btcProgressPercent: number;
  accounts: DashboardAccount[];
}

export function AccountSummary({
  firstName,
  lastName,
  avatarUrl,
  btcBalance,
  btcProgressPercent,
  accounts,
}: AccountSummaryProps) {
  const { navigateWithLoader } = useAppLoader();

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0
  );

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const safeBtcProgress = Math.min(
    100,
    Math.max(0, btcProgressPercent)
  );

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#005f78] via-[#004b61] to-[#003545] text-white shadow-sm">
      <div className="pointer-events-none absolute -right-20 -top-32 h-[330px] w-[330px] rounded-full bg-white/[0.05]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-[280px] w-[420px] rotate-[-18deg] rounded-[50%] border-[48px] border-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[300px] w-[300px] rounded-full border-[45px] border-white/[0.04]" />

      <div className="relative px-4 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-7">
        {/* Customer */}

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white/15 shadow-sm sm:h-12 sm:w-12">
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
            <p className="text-xs text-white/65 sm:text-sm">
              Hello,
            </p>

            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
              {firstName}!
            </h1>
          </div>
        </div>

        {/* Main balance */}

        <div className="mt-5 sm:mt-7">
          <p className="text-xs font-medium text-white/60 sm:text-sm">
            Total balance
          </p>

          <h2 className="mt-1 text-[32px] font-bold leading-none tracking-[-0.04em] sm:text-[42px]">
            {formatCurrency(totalBalance)}
          </h2>
        </div>

        {/* BTC balance */}

        <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm sm:mt-6 sm:p-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/60 sm:text-sm">
                BTC Balance
              </p>

              <p className="mt-1 truncate font-mono text-lg font-bold tracking-tight sm:text-xl">
                {btcBalance} BTC
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/85">
              {safeBtcProgress}%
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500"
              style={{
                width: `${safeBtcProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Accounts heading */}

        <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
          <div>
            <p className="text-base font-bold sm:text-lg">
              Your accounts
            </p>

            <p className="mt-0.5 text-[11px] text-white/50 sm:text-xs">
              {accounts.length === 1
                ? "1 active account"
                : `${accounts.length} active accounts`}
            </p>
          </div>
        </div>

        {/* Accounts */}

        {accounts.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:gap-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onOpen={() =>
                  navigateWithLoader(
                    `/accounts/${account.id}`
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-white/15 bg-white/10 px-5 py-7 text-center backdrop-blur-sm">
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
}: {
  account: DashboardAccount;
  onOpen: () => void;
}) {
  const isFrozen =
    account.status === "FROZEN";

  const transfersDisabled =
    account.transferPermission === "DISABLED";

  const underReview =
    account.transferPermission === "REVIEW";

  const accountName =
    account.type === "CHECKING"
      ? "Checking"
      : "Savings";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative min-w-0 overflow-hidden rounded-[18px] border border-white/15 bg-white/[0.1] p-3 text-left shadow-sm backdrop-blur-md transition hover:bg-white/[0.16] sm:rounded-[22px] sm:p-5"
    >
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full border-[24px] border-white/[0.05]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
              {account.type === "CHECKING" ? (
                <WalletCards size={18} />
              ) : (
                <PiggyBank size={18} />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold sm:text-sm">
                {accountName}
              </p>

              <p className="mt-0.5 text-[10px] text-white/55 sm:text-xs">
                •••• {account.accountNumber.slice(-4)}
              </p>
            </div>
          </div>

          <ChevronRight
            size={16}
            className="shrink-0 text-white/70 sm:h-[18px] sm:w-[18px]"
          />
        </div>

        <p className="mt-4 truncate text-base font-bold tracking-tight sm:mt-6 sm:text-2xl">
          {formatCurrency(account.balance)}
        </p>

        <p className="mt-1 hidden text-xs text-white/50 sm:block">
          Available balance
        </p>

        <div className="mt-3 border-t border-white/10 pt-3 sm:mt-5 sm:pt-4">
          <AccountStatus
            isFrozen={isFrozen}
            transfersDisabled={transfersDisabled}
            underReview={underReview}
          />
        </div>
      </div>
    </button>
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
      <div className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-blue-100 sm:gap-1.5 sm:text-xs">
        <AlertTriangle
          size={13}
          className="shrink-0"
        />

        <span className="truncate">
          Frozen
        </span>
      </div>
    );
  }

  if (transfersDisabled) {
    return (
      <div className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-amber-100 sm:gap-1.5 sm:text-xs">
        <LockKeyhole
          size={13}
          className="shrink-0"
        />

        <span className="truncate">
          Transfers disabled
        </span>
      </div>
    );
  }

  if (underReview) {
    return (
      <div className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-amber-100 sm:gap-1.5 sm:text-xs">
        <AlertTriangle
          size={13}
          className="shrink-0"
        />

        <span className="truncate">
          Under review
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-100 sm:text-xs">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300 sm:h-2 sm:w-2" />
      Active
    </span>
  );
}