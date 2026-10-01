"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type AccountDetailsAccount = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
};

interface AccountDetailsProps {
  accounts: AccountDetailsAccount[];
}

export function AccountDetails({
  accounts,
}: AccountDetailsProps) {
  const [visible, setVisible] =
    useState(false);

  const checking = accounts.find(
    (account) =>
      account.type === "CHECKING"
  );

  const savings = accounts.find(
    (account) =>
      account.type === "SAVINGS"
  );

  function maskAccountNumber(
    accountNumber?: string
  ) {
    if (!accountNumber) {
      return "—";
    }

    if (visible) {
      return accountNumber;
    }

    return `••••••${accountNumber.slice(-4)}`;
  }

  return (
    <section className="bank-card rounded-[24px] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="text-[24px] font-bold">
            Account details
          </h2>

          <p className="mt-1 text-sm text-[#68787f]">
            Account numbers for deposits
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setVisible(
              (current) => !current
            )
          }
          aria-expanded={visible}
          className="flex shrink-0 items-center gap-2 font-semibold text-[#c94951] transition hover:opacity-75"
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}

          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {visible && (
        <div className="mt-6 overflow-hidden rounded-[20px] border border-[#dce4e8]">
          {checking && (
            <div className="flex items-center justify-between gap-4 px-5 py-5">
              <div>
                <p className="font-semibold">
                  Checking
                </p>

                <p className="mt-1 text-xs text-[#68787f]">
                  Account number
                </p>
              </div>

              <strong className="font-mono tracking-wide">
                {maskAccountNumber(
                  checking.accountNumber
                )}
              </strong>
            </div>
          )}

          {savings && (
            <div className="flex items-center justify-between gap-4 border-t border-[#e1e7ea] px-5 py-5">
              <div>
                <p className="font-semibold">
                  Savings
                </p>

                <p className="mt-1 text-xs text-[#68787f]">
                  Account number
                </p>
              </div>

              <strong className="font-mono tracking-wide">
                {maskAccountNumber(
                  savings.accountNumber
                )}
              </strong>
            </div>
          )}

          {!checking && !savings && (
            <div className="px-5 py-6 text-center text-sm text-[#68787f]">
              No account details available.
            </div>
          )}
        </div>
      )}
    </section>
  );
}