"use client";

import { useState } from "react";
import {
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { resetUserPinAction } from "@/server/actions/reset-user-pin";

interface PinResetControlProps {
  userId: string;
  requiresPinSetup: boolean;
}

export function PinResetControl({
  userId,
  requiresPinSetup,
}: PinResetControlProps) {
  const router = useRouter();

  const {
    showLoader,
    hideLoader,
  } = useAppLoader();

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  async function handleReset() {
    if (processing) return;

    const confirmed = window.confirm(
      "Require this customer to create a new transaction PIN? Their existing PIN will stop working."
    );

    if (!confirmed) return;

    setProcessing(true);
    setError(null);
    showLoader();

    try {
      const result =
        await resetUserPinAction(
          userId
        );

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to reset PIN."
        );

        setProcessing(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "PIN reset error:",
        error
      );

      hideLoader();
      setProcessing(false);

      setError(
        "Unable to reset PIN."
      );
    }
  }

  if (requiresPinSetup) {
    return (
      <div className="rounded-[18px] border border-amber-100 bg-amber-50 p-4">
        <div className="flex gap-3">
          <KeyRound
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <p className="font-bold text-amber-800">
              New PIN required
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              This customer must create a
              new transaction PIN before
              making another transfer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-[#dfe7ea] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#173743]">
            Transaction PIN
          </p>

          <p className="mt-1 text-sm text-[#718087]">
            Require the customer to create
            a new transaction PIN.
          </p>
        </div>

        <button
          type="button"
          disabled={processing}
          onClick={handleReset}
          className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white px-5 text-sm font-bold text-[#173743] transition hover:bg-[#f4f7f8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={17} />

          {processing
            ? "Resetting..."
            : "Require new PIN"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}