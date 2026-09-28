"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  LockKeyhole,
  Snowflake,
  Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { updateAdminAccountAction } from "@/server/actions/update-admin-account";
import { updateAdminUserStatusAction } from "@/server/actions/update-admin-user";

type Account = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  status: string;
  transferPermission: string;
};

interface UserAccountControlsProps {
  userId: string;
  userStatus: string;
  accounts: Account[];
}

export function UserAccountControls({
  userId,
  userStatus,
  accounts,
}: UserAccountControlsProps) {
  const router = useRouter();
  const { showLoader, hideLoader } =
    useAppLoader();

  const [processing, setProcessing] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  async function changeUserStatus() {
    if (processing) return;

    const nextStatus =
      userStatus === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    const confirmed = window.confirm(
      nextStatus === "SUSPENDED"
        ? "Suspend this user? They will no longer be able to sign in."
        : "Reactivate this user?"
    );

    if (!confirmed) return;

    setProcessing("user");
    setError(null);
    showLoader();

    try {
      const result =
        await updateAdminUserStatusAction({
          userId,
          status: nextStatus,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update user."
        );
        setProcessing(null);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "User status update error:",
        error
      );

      hideLoader();
      setProcessing(null);
      setError(
        "Unable to update user."
      );
    }
  }

  async function changeAccountStatus(
    account: Account
  ) {
    if (processing) return;

    const nextStatus =
      account.status === "ACTIVE"
        ? "FROZEN"
        : "ACTIVE";

    const confirmed = window.confirm(
      nextStatus === "FROZEN"
        ? `Freeze this ${account.type.toLowerCase()} account?`
        : `Unfreeze this ${account.type.toLowerCase()} account?`
    );

    if (!confirmed) return;

    setProcessing(
      `status-${account.id}`
    );

    setError(null);
    showLoader();

    try {
      const result =
        await updateAdminAccountAction({
          accountId: account.id,
          userId,
          status: nextStatus,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update account."
        );
        setProcessing(null);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Account status update error:",
        error
      );

      hideLoader();
      setProcessing(null);
      setError(
        "Unable to update account."
      );
    }
  }

  async function changeTransferPermission(
    account: Account
  ) {
    if (processing) return;

    const nextPermission =
      account.transferPermission ===
      "ENABLED"
        ? "DISABLED"
        : "ENABLED";

    const confirmed = window.confirm(
      nextPermission === "DISABLED"
        ? "Disable outgoing transfers for this account?"
        : "Enable outgoing transfers for this account?"
    );

    if (!confirmed) return;

    setProcessing(
      `transfer-${account.id}`
    );

    setError(null);
    showLoader();

    try {
      const result =
        await updateAdminAccountAction({
          accountId: account.id,
          userId,
          transferPermission:
            nextPermission,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update transfers."
        );
        setProcessing(null);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Transfer permission update error:",
        error
      );

      hideLoader();
      setProcessing(null);
      setError(
        "Unable to update transfers."
      );
    }
  }

  return (
    <section className="rounded-[22px] border border-[#dfe7ea] bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-[#173743]">
          User & account controls
        </h2>

        <p className="mt-1 text-sm text-[#718087]">
          Manage account access and transfer permissions.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-[18px] bg-[#f5f8f9] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#173743]">
              Customer access
            </p>

            <p className="mt-1 text-sm text-[#718087]">
              Current status:{" "}
              <strong>
                {userStatus}
              </strong>
            </p>
          </div>

          <button type="button" disabled={processing !== null} onClick={changeUserStatus} className={`inline-flex h-[44px] items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${userStatus === "ACTIVE" ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "bg-[#003b4d] text-white hover:bg-[#002f3e]"}`}>
            {userStatus ===
            "ACTIVE" ? (
              <>
                <Ban size={17} />
                Suspend user
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                />
                Activate user
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {accounts.map((account) => {
          const isFrozen =
            account.status === "FROZEN";

          const transfersEnabled =
            account.transferPermission ===
            "ENABLED";

          return (
            <div key={account.id} className="rounded-[18px] border border-[#dfe7ea] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[#173743]">
                      {account.type ===
                      "CHECKING"
                        ? "Checking"
                        : "Savings"}
                    </p>

                    <StatusBadge
                      value={
                        account.status
                      }
                    />
                  </div>

                  <p className="mt-2 text-sm text-[#718087]">
                    ••••{" "}
                    {account.accountNumber.slice(
                      -4
                    )}
                  </p>

                  <p className="mt-1 text-xs text-[#8a989e]">
                    Transfers:{" "}
                    {
                      account.transferPermission
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" disabled={processing !== null} onClick={() => changeAccountStatus(account)} className="flex h-[46px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white text-sm font-bold text-[#173743] transition hover:bg-[#f4f7f8] disabled:cursor-not-allowed disabled:opacity-50">
                  {isFrozen ? (
                    <>
                      <Unlock
                        size={17}
                      />
                      Unfreeze account
                    </>
                  ) : (
                    <>
                      <Snowflake
                        size={17}
                      />
                      Freeze account
                    </>
                  )}
                </button>

                <button type="button" disabled={processing !== null} onClick={() => changeTransferPermission(account)} className={`flex h-[46px] items-center justify-center gap-2 rounded-full text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${transfersEnabled ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "bg-[#003b4d] text-white hover:bg-[#002f3e]"}`}>
                  <LockKeyhole
                    size={17}
                  />

                  {transfersEnabled
                    ? "Disable transfers"
                    : "Enable transfers"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  const style =
    value === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : value === "FROZEN"
        ? "bg-blue-50 text-blue-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style}`}>
      {value}
    </span>
  );
}