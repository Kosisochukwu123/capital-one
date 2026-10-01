"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { setTransactionPinAction } from "@/server/actions/set-transaction-pin";

export function TransactionPinForm() {
  const {
    showLoader,
    hideLoader,
    navigateWithLoader,
  } = useAppLoader();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handlePinChange(
    value: string,
    setter: (value: string) => void
  ) {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 4);

    setter(numbersOnly);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError(null);

    if (pin.length !== 4) {
      setError("Enter a 4-digit transaction PIN.");
      return;
    }

    if (pin !== confirmPin) {
      setError("Your PINs do not match.");
      return;
    }

    setLoading(true);
    showLoader();

    try {
      const result = await setTransactionPinAction({
        pin,
        confirmPin,
      });

      if (!result.success) {
        setError(result.error ?? "Unable to create PIN.");
        hideLoader();
        setLoading(false);
        return;
      }

      hideLoader();
      navigateWithLoader("/");
    } catch (error) {
      console.error("PIN setup error:", error);

      setError("Unable to create your transaction PIN.");
      hideLoader();
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bank-card rounded-[26px] p-6 sm:p-8"
    >
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f1f4] text-[#003b4d]">
        <LockKeyhole size={23} />
      </div>

      <div>
        <label
          htmlFor="pin"
          className="mb-2 block text-sm font-semibold"
        >
          Create transaction PIN
        </label>

        <div className="relative">
          <input
            id="pin"
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            disabled={loading}
            onChange={(event) =>
              handlePinChange(event.target.value, setPin)
            }
            placeholder="••••"
            className="h-[58px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 pr-14 text-xl tracking-[0.35em] outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
          />

          <button
            type="button"
            onClick={() => setShowPin((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#66777e]"
            aria-label={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff size={21} /> : <Eye size={21} />}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="confirmPin"
          className="mb-2 block text-sm font-semibold"
        >
          Confirm transaction PIN
        </label>

        <div className="relative">
          <input
            id="confirmPin"
            type={showConfirmPin ? "text" : "password"}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={confirmPin}
            disabled={loading}
            onChange={(event) =>
              handlePinChange(
                event.target.value,
                setConfirmPin
              )
            }
            placeholder="••••"
            className="h-[58px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 pr-14 text-xl tracking-[0.35em] outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPin((current) => !current)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#66777e]"
            aria-label={
              showConfirmPin
                ? "Hide confirmation PIN"
                : "Show confirmation PIN"
            }
          >
            {showConfirmPin ? (
              <EyeOff size={21} />
            ) : (
              <Eye size={21} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-[#66777e]">
        Your transaction PIN is separate from your login password
        and will be required when confirming transactions.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
        className="mt-7 h-[58px] w-full rounded-full bg-[#003b4d] font-bold text-white transition hover:bg-[#002f3d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating PIN..." : "Create PIN"}
      </button>
    </form>
  );
}