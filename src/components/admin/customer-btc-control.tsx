"use client";

import {
  Bitcoin,
  CheckCircle2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { updateCustomerBtc } from "@/server/actions/update-customer-btc";

interface CustomerBtcControlProps {
  customerId: string;
  initialBtcBalance: string;
  initialBtcProgressPercent: number;
}

export function CustomerBtcControl({
  customerId,
  initialBtcBalance,
  initialBtcProgressPercent,
}: CustomerBtcControlProps) {
  const router = useRouter();

  const [btcBalance, setBtcBalance] =
    useState(initialBtcBalance);

  const [
    btcProgressPercent,
    setBtcProgressPercent,
  ] = useState(
    initialBtcProgressPercent
  );

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  function handleSave() {
    setError(null);
    setSuccess(null);

    const balance = Number(btcBalance);

    if (
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      setError(
        "Enter a valid BTC balance."
      );
      return;
    }

    if (
      btcProgressPercent < 0 ||
      btcProgressPercent > 100
    ) {
      setError(
        "Percentage must be between 0 and 100."
      );
      return;
    }

    startTransition(async () => {
      const result =
        await updateCustomerBtc({
          customerId,
          btcBalance,
          btcProgressPercent,
        });

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update BTC information."
        );
        return;
      }

      setSuccess(
        "BTC information updated."
      );

      router.refresh();
    });
  }

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#edf5f7] text-[#006b7d]">
          <Bitcoin size={21} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#173743]">
            BTC dashboard display
          </h2>

          <p className="mt-1 max-w-xl text-sm leading-6 text-[#718087]">
            Control the BTC balance and progress shown on this customer's dashboard.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="btc-balance"
            className="text-xs font-bold uppercase tracking-[0.1em] text-[#718087]"
          >
            BTC balance
          </label>

          <div className="relative mt-2">
            <input
              id="btc-balance"
              type="number"
              min="0"
              step="0.00000001"
              value={btcBalance}
              disabled={isPending}
              onChange={(event) => {
                setBtcBalance(
                  event.target.value
                );
                setError(null);
                setSuccess(null);
              }}
              className="min-h-12 w-full rounded-[14px] border border-[#d8e2e6] bg-white px-4 pr-16 font-mono text-sm text-[#173743] outline-none transition focus:border-[#006b7d]"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#718087]">
              BTC
            </span>
          </div>

          <p className="mt-2 text-xs text-[#8a989e]">
            Supports up to 8 decimal places.
          </p>
        </div>

        <div>
          <label
            htmlFor="btc-progress"
            className="text-xs font-bold uppercase tracking-[0.1em] text-[#718087]"
          >
            Progress percentage
          </label>

          <div className="relative mt-2">
            <input
              id="btc-progress"
              type="number"
              min="0"
              max="100"
              step="1"
              value={btcProgressPercent}
              disabled={isPending}
              onChange={(event) => {
                const value =
                  Number(
                    event.target.value
                  );

                setBtcProgressPercent(
                  Number.isFinite(value)
                    ? value
                    : 0
                );

                setError(null);
                setSuccess(null);
              }}
              className="min-h-12 w-full rounded-[14px] border border-[#d8e2e6] bg-white px-4 pr-12 text-sm font-bold text-[#173743] outline-none transition focus:border-[#006b7d]"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#718087]">
              %
            </span>
          </div>

          <p className="mt-2 text-xs text-[#8a989e]">
            Choose a value from 0 to 100.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[18px] bg-[#f4f8f9] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#173743]">
            <TrendingUp
              size={17}
              className="text-[#006b7d]"
            />

            Dashboard preview
          </div>

          <span className="text-sm font-bold text-[#006b7d]">
            {btcProgressPercent}%
          </span>
        </div>

        <p className="mt-4 font-mono text-xl font-bold text-[#173743]">
          {Number(
            btcBalance || 0
          ).toFixed(8)}{" "}
          BTC
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dce8eb]">
          <div
            className="h-full rounded-full bg-[#006b7d] transition-[width] duration-300"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  btcProgressPercent
                )
              )}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#003b4d] px-5 text-sm font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && (
            <Loader2
              size={16}
              className="animate-spin"
            />
          )}

          {isPending
            ? "Saving..."
            : "Save BTC information"}
        </button>
      </div>
    </section>
  );
}