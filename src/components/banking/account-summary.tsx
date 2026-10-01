"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  LockKeyhole,
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
  accounts: DashboardAccount[];
}

export function AccountSummary({
  accounts,
}: AccountSummaryProps) {
  const { navigateWithLoader } =
    useAppLoader();

  const checkingAccount =
    accounts.find(
      (account) =>
        account.type === "CHECKING"
    );

  const savingsAccount =
    accounts.find(
      (account) =>
        account.type === "SAVINGS"
    );

  const totalBalance =
    accounts.reduce(
      (total, account) =>
        total + account.balance,
      0
    );

  return (
    <section className="overflow-hidden rounded-[26px] bg-[#003b4d] text-white shadow-sm">
      <div className="relative overflow-hidden px-5 pb-6 pt-6 sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full border-[34px] border-white/5" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full border-[40px] border-white/5" />

        <div className="relative">
          <p className="text-sm font-medium text-white/70">
            Total balance
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {formatCurrency(totalBalance)}
          </h2>

          <p className="mt-2 text-xs text-white/60">
            Across your available accounts
          </p>

          <div className="mt-6 border-t border-white/15 pt-3">
            <p className="text-xs text-white/60">
              Available across your active accounts
            </p>
          </div>
        </div>
      </div>

      <div className="relative bg-white p-4 text-[#173743] sm:p-5">
        <div className="space-y-3">
          {checkingAccount && (
            <AccountRow
              account={checkingAccount}
              onOpen={() =>
                navigateWithLoader(
                  `/payments`
                )
              }
            />
          )}

          {savingsAccount && (
            <AccountRow
              account={savingsAccount}
              onOpen={() =>
                navigateWithLoader(
                  `/payments`
                )
              }
            />
          )}

          {!checkingAccount &&
            !savingsAccount && (
              <div className="rounded-[18px] bg-[#f5f8f9] px-5 py-8 text-center">
                <p className="font-bold text-[#173743]">
                  No accounts available
                </p>

                <p className="mt-2 text-sm text-[#718087]">
                  You currently have no
                  open accounts.
                </p>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

function AccountRow({
  account,
  onOpen,
}: {
  account: DashboardAccount;
  onOpen: () => void;
}) {
  const isFrozen =
    account.status === "FROZEN";

  const transfersDisabled =
    account.transferPermission ===
    "DISABLED";

  const underReview =
    account.transferPermission ===
    "REVIEW";

  const canTransfer =
    account.status === "ACTIVE" &&
    account.transferPermission ===
    "ENABLED";

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#dfe7ea] bg-white">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-[#173743]">
                {account.type ===
                  "CHECKING"
                  ? "Checking"
                  : "Savings"}
              </p>

              {isFrozen && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  FROZEN
                </span>
              )}

              {!isFrozen &&
                transfersDisabled && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    TRANSFERS DISABLED
                  </span>
                )}

              {!isFrozen &&
                underReview && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    REVIEW
                  </span>
                )}
            </div>

            <p className="mt-1 text-sm text-[#718087]">
              ••••{" "}
              {account.accountNumber.slice(
                -4
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-[#173743]">
              {formatCurrency(
                account.balance
              )}
            </p>

            <p className="mt-1 text-xs text-[#718087]">
              Available balance
            </p>
          </div>
        </div>

        {isFrozen && (
          <div className="mt-4 flex gap-3 rounded-[16px] border border-blue-100 bg-blue-50 px-4 py-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-blue-700"
            />

            <div>
              <p className="text-sm font-bold text-blue-800">
                Account temporarily
                unavailable
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                This account is currently
                frozen. Its balance remains
                visible, but transfers are
                unavailable.
              </p>
            </div>
          </div>
        )}

        {!isFrozen &&
          transfersDisabled && (
            <div className="mt-4 flex gap-3 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3">
              <LockKeyhole
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-sm font-bold text-amber-800">
                  Transfers disabled
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Outgoing transfers are
                  currently unavailable for
                  this account.
                </p>
              </div>
            </div>
          )}

        {!isFrozen &&
          underReview && (
            <div className="mt-4 flex gap-3 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-sm font-bold text-amber-800">
                  Transfers under review
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Transfer access for this
                  account is currently
                  under review.
                </p>
              </div>
            </div>
          )}

        <div className="mt-4 flex items-center justify-between border-t border-[#edf1f2] pt-4">
          <div>
            <p className="text-xs text-[#718087]">
              Account status
            </p>

            <p
              className={`mt-1 text-sm font-bold ${isFrozen
                  ? "text-blue-700"
                  : "text-emerald-700"
                }`}
            >
              {account.status}
            </p>
          </div>

          <button
            type="button"
            disabled={!canTransfer}
            onClick={onOpen}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#003b4d] px-5 text-sm font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:bg-[#dbe3e6] disabled:text-[#839197]"
          >
            Transfer
            <ArrowUpRight
              size={16}
            />
          </button>
        </div>
      </div>
    </div>
  );
}