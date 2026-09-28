"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { formatCurrency } from "@/lib/utils";
import { submitTransferAction } from "@/server/actions/submit-transfer";

type PaymentAccount = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  currency: string;
  balance: number;
  status: string;
  transferPermission: string;
};

interface PaymentFormProps {
  accounts: PaymentAccount[];
}

type Step =
  | "details"
  | "fetching"
  | "review"
  | "pin"
  | "sending"
  | "success";

export function PaymentForm({
  accounts,
}: PaymentFormProps) {
  const { navigateWithLoader } =
    useAppLoader();

  const availableAccounts =
    accounts.filter(
      (item) =>
        item.status === "ACTIVE" &&
        item.transferPermission ===
          "ENABLED"
    );

  const [step, setStep] =
    useState<Step>("details");

  const [account, setAccount] =
    useState(
      availableAccounts[0]?.id ?? ""
    );

  const [
    recipientName,
    setRecipientName,
  ] = useState("");

  const [
    recipientBankName,
    setRecipientBankName,
  ] = useState("");

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [memo, setMemo] =
    useState("");

  const [pin, setPin] =
    useState("");

  const [showPin, setShowPin] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    reference,
    setReference,
  ] = useState("");

  const [
    transactionId,
    setTransactionId,
  ] = useState("");

  const selectedAccount =
    availableAccounts.find(
      (item) =>
        item.id === account
    );

  const numericAmount =
    Number(amount);

  async function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!account) {
      setError(
        "Select an account."
      );
      return;
    }

    if (
      recipientName.trim().length <
      2
    ) {
      setError(
        "Enter the recipient name."
      );
      return;
    }

    if (
      recipientBankName.trim()
        .length < 2
    ) {
      setError(
        "Enter the recipient bank name."
      );
      return;
    }

    if (
      !/^\d{6,20}$/.test(
        recipient
      )
    ) {
      setError(
        "Enter a valid recipient account number."
      );
      return;
    }

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Enter a valid transfer amount."
      );
      return;
    }

    if (
      selectedAccount &&
      numericAmount >
        selectedAccount.balance
    ) {
      setError(
        "The selected account does not have enough balance."
      );
      return;
    }

    setStep("fetching");

    /*
     * This is intentionally a UI
     * processing state only.
     *
     * The project is not connected
     * to an external banking API,
     * so we do not claim that the
     * recipient was verified by
     * another bank.
     */
    await new Promise<void>(
      (resolve) => {
        window.setTimeout(
          resolve,
          1400
        );
      }
    );

    setStep("review");
  }

  async function handleTransferSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);

    if (pin.length !== 4) {
      setError(
        "Enter your 4-digit transaction PIN."
      );
      return;
    }

    setSubmitting(true);
    setStep("sending");

    /*
     * Six seconds is the maximum
     * visual target, not an extra
     * six-second delay.
     */
    const startedAt =
      Date.now();

    try {
      const result =
        await submitTransferAction({
          fromAccountId:
            account,

          recipientName:
            recipientName.trim(),

          recipientAccountNumber:
            recipient,

          recipientBankName:
            recipientBankName.trim(),

          amount:
            numericAmount,

          memo:
            memo.trim() ||
            undefined,

          pin,
        });

      /*
       * Keep the sending state
       * visible briefly so the
       * transition does not flash.
       */
      const elapsed =
        Date.now() - startedAt;

      const minimumSendingTime =
        1200;

      if (
        elapsed <
        minimumSendingTime
      ) {
        await new Promise<void>(
          (resolve) => {
            window.setTimeout(
              resolve,
              minimumSendingTime -
                elapsed
            );
          }
        );
      }

      if (!result.success) {
        setError(
          result.error ??
            "Unable to submit transfer."
        );

        setPin("");
        setSubmitting(false);

        /*
         * Important:
         * return to PIN instead of
         * leaving the customer on
         * the Sending screen.
         */
        setStep("pin");

        return;
      }

      setReference(
        result.reference ?? ""
      );

      setTransactionId(
        result.transactionId ?? ""
      );

      setPin("");
      setSubmitting(false);
      setStep("success");
    } catch (error) {
      console.error(
        "Transfer submission error:",
        error
      );

      setError(
        "Unable to submit transfer."
      );

      setPin("");
      setSubmitting(false);
      setStep("pin");
    }
  }

  if (
    availableAccounts.length ===
    0
  ) {
    return (
      <div className="bank-card rounded-[24px] p-6 text-center">
        <p className="font-bold text-[#173743]">
          Transfers unavailable
        </p>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          You do not currently have
          an active account with
          transfers enabled.
        </p>
      </div>
    );
  }

  if (step === "fetching") {
    return (
      <div className="bank-card rounded-[24px] p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
          <Search
            size={27}
            className="animate-pulse"
          />
        </div>

        <div className="mx-auto mt-6 h-11 w-11 animate-spin rounded-full border-4 border-[#d9e5e8] border-t-[#003b4d]" />

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          Fetching information
        </h2>

        <p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-[#718087]">
          Please wait while we
          prepare the transfer
          information for review.
        </p>
      </div>
    );
  }

  if (step === "sending") {
    return (
      <div className="bank-card rounded-[24px] p-8 text-center sm:p-10">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d9e5e8] border-t-[#003b4d]" />

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          Sending...
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          Please wait while we
          process your transfer.
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="bank-card rounded-[24px] p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7f2] text-[#159873]">
            <CheckCircle2
              size={32}
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#173743]">
            Transfer submitted
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#718087]">
            Your transfer has been
            submitted and is
            currently pending.
          </p>

          <p className="mt-6 text-3xl font-bold text-[#173743]">
            {formatCurrency(
              numericAmount
            )}
          </p>
        </div>

        <div className="mt-7 rounded-[18px] bg-[#f3f7f8] p-5">
          <SummaryRow
            label="Recipient"
            value={recipientName}
          />

          <SummaryRow
            label="Bank"
            value={
              recipientBankName
            }
          />

          <SummaryRow
            label="Account"
            value={recipient}
          />

          <SummaryRow
            label="Status"
            value="PENDING"
          />

          <SummaryRow
            label="Reference"
            value={reference}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            navigateWithLoader(
              `/transactions/${transactionId}`
            )
          }
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          View transaction
        </button>

        <button
          type="button"
          onClick={() =>
            navigateWithLoader("/")
          }
          className="mt-3 h-[54px] w-full rounded-full border border-[#d6dfe3] bg-white font-bold text-[#173743]"
        >
          Back to home
        </button>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="bank-card rounded-[24px] p-5 sm:p-7">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("details");
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b7d]"
        >
          <ArrowLeft size={17} />
          Edit transfer
        </button>

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          Review transfer
        </h2>

        <p className="mt-2 text-sm text-[#718087]">
          Confirm the information
          before continuing.
        </p>

        <div className="mt-6 rounded-[18px] bg-[#f3f7f8] p-5">
          <SummaryRow
            label="From"
            value={
              selectedAccount
                ? `${
                    selectedAccount.type ===
                    "CHECKING"
                      ? "Checking"
                      : "Savings"
                  } •••• ${selectedAccount.accountNumber.slice(
                    -4
                  )}`
                : "—"
            }
          />

          <SummaryRow
            label="Recipient"
            value={recipientName}
          />

          <SummaryRow
            label="Bank"
            value={
              recipientBankName
            }
          />

          <SummaryRow
            label="Recipient account"
            value={recipient}
          />

          <SummaryRow
            label="Amount"
            value={formatCurrency(
              numericAmount
            )}
          />

          <SummaryRow
            label="Memo"
            value={memo || "—"}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("pin");
          }}
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <form
        onSubmit={
          handleTransferSubmit
        }
        className="bank-card rounded-[24px] p-5 sm:p-7"
      >
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPin("");
            setStep("review");
          }}
          disabled={submitting}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b7d]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          Transaction PIN
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          Enter your 4-digit
          transaction PIN to
          authorize this transfer.
        </p>

        <div className="mt-7">
          <Field label="Transaction PIN">
            <div className="relative">
              <input
                value={pin}
                onChange={(
                  event
                ) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setPin(
                    value.slice(
                      0,
                      4
                    )
                  );
                }}
                type={
                  showPin
                    ? "text"
                    : "password"
                }
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="••••"
                disabled={
                  submitting
                }
                className={`${inputStyles} pr-14`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPin(
                    (current) =>
                      !current
                  )
                }
                disabled={
                  submitting
                }
                aria-label={
                  showPin
                    ? "Hide PIN"
                    : "Show PIN"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#66777e]"
              >
                {showPin ? (
                  <EyeOff
                    size={20}
                  />
                ) : (
                  <Eye
                    size={20}
                  />
                )}
              </button>
            </div>
          </Field>
        </div>

        {error && (
          <div className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            pin.length !== 4
          }
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : "Authorize transfer"}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={
        handleDetailsSubmit
      }
      className="bank-card rounded-[24px] p-5 sm:p-7"
    >
      <div className="space-y-5">
        <Field label="From account">
          <select
            value={account}
            onChange={(event) =>
              setAccount(
                event.target.value
              )
            }
            className={
              inputStyles
            }
          >
            <option value="">
              Select an account...
            </option>

            {availableAccounts.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.type ===
                  "CHECKING"
                    ? "Checking"
                    : "Savings"}{" "}
                  ••••{" "}
                  {item.accountNumber.slice(
                    -4
                  )}{" "}
                  —{" "}
                  {formatCurrency(
                    item.balance
                  )}
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Recipient name">
          <input
            value={
              recipientName
            }
            onChange={(event) =>
              setRecipientName(
                event.target.value
              )
            }
            placeholder="Recipient full name"
            className={
              inputStyles
            }
          />
        </Field>

        <Field label="Bank name">
          <input
            value={
              recipientBankName
            }
            onChange={(event) =>
              setRecipientBankName(
                event.target.value
              )
            }
            maxLength={100}
            placeholder="Recipient bank name"
            className={
              inputStyles
            }
          />
        </Field>

        <Field label="Recipient account number">
          <input
            value={recipient}
            onChange={(event) => {
              const value =
                event.target.value.replace(
                  /\D/g,
                  ""
                );

              setRecipient(
                value.slice(
                  0,
                  20
                )
              );
            }}
            inputMode="numeric"
            placeholder="Account number"
            className={
              inputStyles
            }
          />
        </Field>

        <Field label="Amount (USD)">
          <input
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className={
              inputStyles
            }
          />
        </Field>

        <Field label="Memo (optional)">
          <input
            value={memo}
            onChange={(event) =>
              setMemo(
                event.target.value
              )
            }
            maxLength={250}
            placeholder="What's this transfer for?"
            className={
              inputStyles
            }
          />
        </Field>

        {error && (
          <div className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          Next
        </button>

        <p className="text-center text-sm text-[#718087]">
          You&apos;ll review the
          transfer before entering
          your transaction PIN.
        </p>
      </div>
    </form>
  );
}

const inputStyles =
  "h-[60px] w-full rounded-[17px] border border-[#d6dfe3] bg-white px-4 text-[16px] outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold">
        {label}
      </span>

      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#dfe7ea] py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-sm text-[#718087]">
        {label}
      </span>

      <strong className="max-w-[65%] break-words text-right text-sm text-[#173743]">
        {value}
      </strong>
    </div>
  );
}