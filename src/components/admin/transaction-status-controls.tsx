"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { updateTransactionStatusAction } from "@/server/actions/update-transaction-status";

interface TransactionStatusControlsProps {
  transactionId: string;
  status: string;
  currentStatusReason: string | null;
  currentAdminNote: string | null;
}

export function TransactionStatusControls({
  transactionId,
  status,
  currentStatusReason,
  currentAdminNote,
}: TransactionStatusControlsProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useAppLoader();

  const [statusReason, setStatusReason] = useState(
    currentStatusReason ?? ""
  );

  const [adminNote, setAdminNote] = useState(
    currentAdminNote ?? ""
  );

  const [error, setError] = useState<string | null>(
    null
  );

  const [processing, setProcessing] =
    useState(false);

  async function handleDecision(
    decision: "COMPLETED" | "FAILED"
  ) {
    if (processing) return;

    if (
      decision === "FAILED" &&
      !statusReason.trim()
    ) {
      setError(
        "Enter a customer-visible reason before failing the transfer."
      );
      return;
    }

    const confirmed = window.confirm(
      decision === "COMPLETED"
        ? "Complete this transfer? The debit will remain on the customer's account."
        : "Fail this transfer? The amount will be refunded to the customer's account."
    );

    if (!confirmed) return;

    setError(null);
    setProcessing(true);
    showLoader();

    try {
      const result =
        await updateTransactionStatusAction({
          transactionId,
          decision,
          statusReason:
            statusReason.trim() || undefined,
          adminNote:
            adminNote.trim() || undefined,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update transaction."
        );

        setProcessing(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Transaction decision error:",
        error
      );

      hideLoader();

      setError(
        "Unable to update transaction."
      );

      setProcessing(false);
    }
  }

  if (status !== "PENDING") {
    return (
      <div className="rounded-[22px] border border-[#dfe7ea] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#173743]">
          Transaction decision
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          This transaction has already been processed and can no longer be completed or failed.
        </p>

        <div className="mt-5 rounded-[16px] bg-[#f3f7f8] px-4 py-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#718087]">
            Current status
          </span>

          <p className="mt-1 font-bold text-[#173743]">
            {status}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-[#dfe7ea] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[#173743]">
        Process transfer
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#718087]">
        Complete the transfer or fail it and return the amount to the customer.
      </p>

      <div className="mt-6">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#173743]">
            Customer-visible status reason
          </span>

          <textarea
            value={statusReason}
            onChange={(event) =>
              setStatusReason(event.target.value)
            }
            disabled={processing}
            rows={3}
            placeholder="Example: Your transfer has been completed."
            className="w-full resize-none rounded-[16px] border border-[#d6dfe3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10"
          />
        </label>
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#173743]">
            Internal admin note
          </span>

          <textarea
            value={adminNote}
            onChange={(event) =>
              setAdminNote(event.target.value)
            }
            disabled={processing}
            rows={3}
            placeholder="Only administrators can see this note."
            className="w-full resize-none rounded-[16px] border border-[#d6dfe3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10"
          />
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={processing}
          onClick={() =>
            handleDecision("COMPLETED")
          }
          className="flex h-[54px] items-center justify-center gap-2 rounded-full bg-[#003b4d] font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={19} />

          {processing
            ? "Processing..."
            : "Complete transfer"}
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={() =>
            handleDecision("FAILED")
          }
          className="flex h-[54px] items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle size={19} />

          Fail transfer
        </button>
      </div>
    </div>
  );
}