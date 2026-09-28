import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Landmark,
  ReceiptText,
  XCircle,
} from "lucide-react";

import { BankingPage } from "@/components/banking/banking-page";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getUserTransactionDetails } from "@/server/queries/get-user-transaction-details";

interface TransactionDetailsPageProps {
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

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `••••••${accountNumber.slice(-4)}`;
}

function StatusIcon({
  status,
}: {
  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
}) {
  if (status === "COMPLETED") {
    return <CheckCircle2 size={25} />;
  }

  if (status === "FAILED") {
    return <XCircle size={25} />;
  }

  return <Clock3 size={25} />;
}

export default async function TransactionDetailsPage({
  params,
}: TransactionDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const transaction = await getUserTransactionDetails(
    id,
    session.user.id
  );

  if (!transaction) {
    notFound();
  }

  return (
    <BankingPage title="Transaction details">
      <Link href="/transactions" className="inline-flex items-center gap-2 font-semibold text-[#006b7d]">
        <ArrowLeft size={18} />
        Transactions
      </Link>

      <section className="mt-5 overflow-hidden rounded-[26px] bg-white">
        <div className="px-6 py-7 sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                <ReceiptText size={23} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-[#173743]">
                  {transaction.title}
                </p>

                <p className="mt-1 break-all font-mono text-xs text-[#718087]">
                  {transaction.reference}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className={`text-xl font-bold ${transaction.type === "CREDIT" ? "text-[#159873]" : "text-[#173743]"}`}>
                {transaction.type === "CREDIT" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-[18px] bg-[#f3f7f8] p-4 text-[#173743]">
            <StatusIcon status={transaction.status} />

            <div>
              <p className="font-bold">
                {transaction.status}
              </p>

              <p className="mt-1 text-sm text-[#66777e]">
                {transaction.status === "COMPLETED" && "This transaction has been completed."}
                {transaction.status === "PENDING" && (transaction.statusReason || "This transaction is currently being processed.")}
                {transaction.status === "FAILED" && (transaction.statusReason || "This transaction could not be completed.")}
                {transaction.status === "REVERSED" && (transaction.statusReason || "This transaction has been reversed.")}
              </p>
            </div>
          </div>
        </div>

        {transaction.transfer && (
          <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                <Landmark size={20} />
              </div>

              <div>
                <h2 className="font-bold text-[#173743]">
                  Recipient information
                </h2>

                <p className="mt-0.5 text-xs text-[#718087]">
                  Transfer destination
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Detail
                label="Recipient"
                value={transaction.transfer.recipientName || "—"}
              />

              <Detail
                label="Bank"
                value={transaction.transfer.recipientBankName || "—"}
              />

              <Detail
                label="Account number"
                value={maskAccountNumber(transaction.transfer.recipientAccountNumber)}
              />
            </div>
          </div>
        )}

        <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
          <h2 className="font-bold text-[#173743]">
            Transaction information
          </h2>

          <div className="mt-5 space-y-4">
            <Detail
              label="Reference number"
              value={transaction.reference}
            />

            <Detail
              label="Transaction type"
              value={transaction.type === "CREDIT" ? "Credit" : "Debit"}
            />

            <Detail
              label="Status"
              value={transaction.status}
            />

            <Detail
              label="Amount"
              value={formatCurrency(transaction.amount)}
            />

            <Detail
              label="From account"
              value={`${transaction.account.type === "CHECKING" ? "Checking" : "Savings"} •••• ${transaction.account.accountNumber.slice(-4)}`}
            />

            <Detail
              label="Transaction date"
              value={formatDateTime(transaction.transactionDate)}
            />

            <Detail
              label="Currency"
              value={transaction.account.currency}
            />
          </div>
        </div>

        {(transaction.description || transaction.memo || transaction.category) && (
          <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
            <h2 className="font-bold text-[#173743]">
              Additional information
            </h2>

            <div className="mt-5 space-y-5">
              {transaction.description && (
                <TextDetail
                  label="Description"
                  value={transaction.description}
                />
              )}

              {transaction.memo && (
                <TextDetail
                  label="Memo"
                  value={transaction.memo}
                />
              )}

              {transaction.category && (
                <Detail
                  label="Category"
                  value={transaction.category}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </BankingPage>
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
    <div className="flex items-start justify-between gap-6">
      <span className="text-sm text-[#718087]">
        {label}
      </span>

      <strong className="max-w-[65%] break-words text-right text-sm text-[#173743]">
        {value}
      </strong>
    </div>
  );
}

function TextDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#173743]">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66777e]">
        {value}
      </p>
    </div>
  );
}