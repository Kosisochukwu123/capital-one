"use client";

import { useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { createAdminTransactionAction } from "@/server/actions/create-admin-transaction";

type AccountOption = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  balance: number;
};

interface CreateTransactionFormProps {
  userId: string;
  accounts: AccountOption[];
}

function localDateTimeValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

export function CreateTransactionForm({
  userId,
  accounts,
}: CreateTransactionFormProps) {
  const { showLoader, hideLoader } = useAppLoader();

  const [accountId, setAccountId] = useState(
    accounts[0]?.id ?? ""
  );
  const [type, setType] = useState<
    "CREDIT" | "DEBIT"
  >("CREDIT");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memo, setMemo] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [transactionDate, setTransactionDate] =
    useState(localDateTimeValue);
  const [error, setError] = useState<string | null>(
    null
  );
  const [success, setSuccess] = useState<
    string | null
  >(null);
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    showLoader();

    try {
      const result =
        await createAdminTransactionAction({
          userId,
          accountId,
          type,
          amount: Number(amount),
          title,
          description,
          memo,
          adminNote,
          transactionDate,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to create transaction."
        );
        setSubmitting(false);
        return;
      }

      setSuccess(
        `Transaction ${result.reference} created successfully.`
      );

      setAmount("");
      setTitle("");
      setDescription("");
      setMemo("");
      setAdminNote("");
      setTransactionDate(localDateTimeValue());

      setSubmitting(false);

      window.location.reload();
    } catch (error) {
      console.error(
        "Create transaction error:",
        error
      );

      hideLoader();
      setError("Unable to create transaction.");
      setSubmitting(false);
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-[#718087]">
        This user does not have an account available
        for transactions.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="transactionAccount" className="mb-2 block text-sm font-semibold text-[#173743]">
            Account
          </label>

          <select id="transactionAccount" value={accountId} onChange={(event) => setAccountId(event.target.value)} disabled={submitting} className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none">
            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.type === "CHECKING"
                  ? "Checking"
                  : "Savings"}{" "}
                ••••{" "}
                {account.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="transactionType" className="mb-2 block text-sm font-semibold text-[#173743]">
            Transaction type
          </label>

          <select id="transactionType" value={type} onChange={(event) => setType(event.target.value as "CREDIT" | "DEBIT")} disabled={submitting} className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none">
            <option value="CREDIT">
              Credit
            </option>

            <option value="DEBIT">
              Debit
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="transactionAmount" className="mb-2 block text-sm font-semibold text-[#173743]">
            Amount
          </label>

          <input id="transactionAmount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required disabled={submitting} placeholder="0.00" className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none" />
        </div>

        <div>
          <label htmlFor="transactionDate" className="mb-2 block text-sm font-semibold text-[#173743]">
            Transaction date
          </label>

          <input id="transactionDate" type="datetime-local" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} required disabled={submitting} className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none" />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="transactionTitle" className="mb-2 block text-sm font-semibold text-[#173743]">
          Transaction title
        </label>

        <input id="transactionTitle" value={title} onChange={(event) => setTitle(event.target.value)} required disabled={submitting} placeholder="Example: Salary payment" className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none" />
      </div>

      <div className="mt-5">
        <label htmlFor="transactionDescription" className="mb-2 block text-sm font-semibold text-[#173743]">
          Description
        </label>

        <textarea id="transactionDescription" value={description} onChange={(event) => setDescription(event.target.value)} disabled={submitting} rows={3} placeholder="Customer-visible transaction description" className="w-full resize-none rounded-[14px] border border-[#d5dfe3] bg-white px-4 py-3 outline-none" />
      </div>

      <div className="mt-5">
        <label htmlFor="transactionMemo" className="mb-2 block text-sm font-semibold text-[#173743]">
          Memo
        </label>

        <input id="transactionMemo" value={memo} onChange={(event) => setMemo(event.target.value)} disabled={submitting} placeholder="Optional transaction memo" className="h-[54px] w-full rounded-[14px] border border-[#d5dfe3] bg-white px-4 outline-none" />
      </div>

      <div className="mt-5">
        <label htmlFor="adminNote" className="mb-2 block text-sm font-semibold text-[#173743]">
          Admin note
        </label>

        <textarea id="adminNote" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} disabled={submitting} rows={3} placeholder="Internal note — not shown to the user" className="w-full resize-none rounded-[14px] border border-[#d5dfe3] bg-white px-4 py-3 outline-none" />

        <p className="mt-2 text-xs text-[#718087]">
          Admin notes are internal and will not be
          displayed on the customer transaction page.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-[14px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button type="submit" disabled={submitting || !accountId} className="mt-6 h-[54px] rounded-full bg-[#003b4d] px-7 font-bold text-white transition hover:bg-[#002f3d] disabled:cursor-not-allowed disabled:opacity-50">
        {submitting
          ? "Creating..."
          : "Create transaction"}
      </button>
    </form>
  );
}