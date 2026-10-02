import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Landmark,
  UserRound,
} from "lucide-react";

import { TransactionStatusControls } from "@/components/admin/transaction-status-controls";
import { formatCurrency } from "@/lib/utils";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminTransactionDetails } from "@/server/queries/get-admin-transaction-details";

interface AdminTransactionPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminTransactionPage({
  params,
}: AdminTransactionPageProps) {
  const admin = await requireAdmin();

  const { id } = await params;

  const transaction =
    await getAdminTransactionDetails(
      id,
      admin
    );

  if (!transaction) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-8">
      <div className="mx-auto w-full max-w-[900px]">
        <Link href={`/admin/users/${transaction.user.id}`} className="inline-flex items-center gap-2 font-semibold text-[#006b7d]">
          <ArrowLeft size={18} />
          Customer
        </Link>

        <div className="mt-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-[#66808a]">
              Transaction
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#173743]">
              {transaction.title}
            </h1>

            <p className="mt-2 font-mono text-sm text-[#66777e]">
              {transaction.reference}
            </p>
          </div>

          <span className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#173743]">
            {transaction.status}
          </span>
        </div>

        <section className="mt-8 rounded-[24px] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
              <Banknote size={23} />
            </div>

            <div>
              <p className="text-sm text-[#718087]">
                Transaction amount
              </p>

              <p className={`mt-1 text-3xl font-bold ${transaction.type === "CREDIT" ? "text-[#159873]" : "text-[#173743]"}`}>
                {transaction.type === "CREDIT" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-[#e5ebed] pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Detail
                label="Reference"
                value={transaction.reference}
              />

              <Detail
                label="Type"
                value={transaction.type}
              />

              <Detail
                label="Status"
                value={transaction.status}
              />

              <Detail
                label="Transaction date"
                value={formatDateTime(transaction.transactionDate)}
              />

              <Detail
                label="Created"
                value={formatDateTime(transaction.createdAt)}
              />

              <Detail
                label="Last updated"
                value={formatDateTime(transaction.updatedAt)}
              />

              <Detail
                label="Completed"
                value={formatDateTime(transaction.completedAt)}
              />

              <Detail
                label="Failed"
                value={formatDateTime(transaction.failedAt)}
              />

              <Detail
                label="Category"
                value={transaction.category ?? "—"}
              />

              <Detail
                label="Currency"
                value={transaction.account.currency}
              />
            </div>
          </div>
        </section>

        {transaction.transfer && (
          <section className="mt-5 rounded-[24px] bg-white p-6">
            <div className="flex items-center gap-3">
              <Landmark
                size={21}
                className="text-[#003b4d]"
              />

              <div>
                <h2 className="text-lg font-bold text-[#173743]">
                  Transfer destination
                </h2>

                <p className="mt-1 text-sm text-[#718087]">
                  Recipient information attached to this transfer.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail
                label="Recipient name"
                value={transaction.transfer.recipientName || "—"}
              />

              <Detail
                label="Bank name"
                value={transaction.transfer.recipientBankName || "—"}
              />

              <Detail
                label="Recipient account number"
                value={transaction.transfer.recipientAccountNumber}
              />

              <Detail
                label="Transfer state"
                value={transaction.transfer.status}
              />

              <Detail
                label="Transfer amount"
                value={formatCurrency(transaction.transfer.amount)}
              />

              <Detail
                label="Currency"
                value={transaction.transfer.currency}
              />

              <Detail
                label="Verification required"
                value={transaction.transfer.requiresVerification ? "Yes" : "No"}
              />

              <Detail
                label="Transfer created"
                value={formatDateTime(transaction.transfer.createdAt)}
              />

              <Detail
                label="Transfer completed"
                value={formatDateTime(transaction.transfer.completedAt)}
              />
            </div>

            {transaction.transfer.failureReason && (
              <div className="mt-6 rounded-[16px] border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-600">
                  Transfer failure reason
                </p>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  {transaction.transfer.failureReason}
                </p>
              </div>
            )}
          </section>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <section className="rounded-[24px] bg-white p-6">
            <div className="flex items-center gap-3">
              <UserRound
                size={20}
                className="text-[#003b4d]"
              />

              <h2 className="text-lg font-bold text-[#173743]">
                Customer
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <Detail
                label="Name"
                value={transaction.user.fullName}
              />

              <Detail
                label="Email"
                value={transaction.user.email}
              />

              <Detail
                label="Customer ID"
                value={transaction.user.customerId ?? "—"}
              />
            </div>

            <Link href={`/admin/users/${transaction.user.id}`} className="mt-6 inline-flex font-semibold text-[#006b7d]">
              Open customer
            </Link>
          </section>

          <section className="rounded-[24px] bg-white p-6">
            <h2 className="text-lg font-bold text-[#173743]">
              Source account
            </h2>

            <div className="mt-5 space-y-4">
              <Detail
                label="Type"
                value={transaction.account.type}
              />

              <Detail
                label="Account number"
                value={transaction.account.accountNumber}
              />

              <Detail
                label="Status"
                value={transaction.account.status}
              />

              <Detail
                label="Current balance"
                value={formatCurrency(transaction.account.balance)}
              />

              <Detail
                label="Opened"
                value={formatDateTime(transaction.account.openedAt)}
              />
            </div>
          </section>
        </div>

        <TransactionStatusControls
          transactionId={transaction.id}
          status={transaction.status}
          currentStatusReason={transaction.statusReason}
          currentAdminNote={transaction.adminNote}
        />

        <section className="mt-5 rounded-[24px] bg-white p-6">
          <h2 className="text-lg font-bold text-[#173743]">
            Transaction information
          </h2>

          <div className="mt-6 space-y-5">
            <TextDetail
              label="Description"
              value={transaction.description}
            />

            <TextDetail
              label="Memo"
              value={transaction.memo}
            />

            <TextDetail
              label="Status reason"
              value={transaction.statusReason}
            />
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-[#dce5e8] bg-[#f8fbfc] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#718087]">
            Internal administration
          </p>

          <h2 className="mt-2 text-lg font-bold text-[#173743]">
            Admin note
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#596c73]">
            {transaction.adminNote || "No internal admin note."}
          </p>

          <p className="mt-5 text-xs text-[#718087]">
            This information is internal and will not appear on the customer&apos;s transaction page.
          </p>
        </section>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#718087]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#173743]">
        {value}
      </p>
    </div>
  );
}

function TextDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#173743]">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66777e]">
        {value || "—"}
      </p>
    </div>
  );
}