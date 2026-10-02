"use client";

import { useState, useTransition } from "react";
import { UserCog } from "lucide-react";
import { useRouter } from "next/navigation";

import { assignAccountManager } from "@/server/actions/assign-account-manager";

type Manager = {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  } | null;
};

interface AccountManagerAssignmentProps {
  customerId: string;
  currentManagerId: string | null;
  managers: Manager[];
}

export function AccountManagerAssignment({
  customerId,
  currentManagerId,
  managers,
}: AccountManagerAssignmentProps) {
  const router = useRouter();

  const [managerId, setManagerId] = useState(
    currentManagerId ?? ""
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] =
    useTransition();

  function handleSave() {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result =
        await assignAccountManager(
          customerId,
          managerId || null
        );

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update account manager."
        );
        return;
      }

      setSuccess(
        managerId
          ? "Account manager assigned."
          : "Account manager removed."
      );

      router.refresh();
    });
  }

  return (
    <section className="rounded-[24px] bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
          <UserCog size={21} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#173743]">
            Account manager
          </h2>

          <p className="mt-1 text-sm text-[#6b7b82]">
            Assign this customer to an account manager.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-[#52676f]">
          Assigned manager
        </label>

        <select
          value={managerId}
          onChange={(event) =>
            setManagerId(event.target.value)
          }
          disabled={isPending}
          className="mt-2 w-full rounded-[14px] border border-[#d8e2e6] bg-white px-4 py-3 outline-none focus:border-[#006b7d]"
        >
          <option value="">
            No account manager
          </option>

          {managers.map((manager) => {
            const name = manager.profile
              ? `${manager.profile.firstName} ${manager.profile.lastName}`
              : manager.email;

            return (
              <option
                key={manager.id}
                value={manager.id}
              >
                {name}
              </option>
            );
          })}
        </select>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-3 text-sm font-medium text-emerald-700">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="mt-5 rounded-[14px] bg-[#003b4d] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : "Save assignment"}
        </button>
      </div>
    </section>
  );
}