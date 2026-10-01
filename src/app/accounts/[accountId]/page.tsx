import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getAccountDetails } from "@/server/queries/get-account-details";

interface AccountDetailsPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function maskAccountNumber(
  accountNumber: string
) {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `•••• ${accountNumber.slice(-4)}`;
}

export default async function AccountDetailsPage({
  params,
}: AccountDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { accountId } = await params;

  const account = await getAccountDetails(
    session.user.id,
    accountId
  );

  if (!account) {
    notFound();
  }

  const accountName =
    account.type === "CHECKING"
      ? "Checking"
      : "Savings";

  return (
    <BankingPage title={`${accountName} account`}>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[26px] bg-[#003b4d] p-6 text-white sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Landmark size={22} />
            </div>

            <div>
              <p className="text-sm text-white/65">
                {accountName} account
              </p>

              <p className="font-semibold">
                {maskAccountNumber(
                  account.accountNumber
                )}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-white/65">
              Available balance
            </p>

            <p className="mt-1 text-[36px] font-bold tracking-tight">
              {formatCurrency(
                account.balance
              )}
            </p>
          </div>

          <div className="mt-6 border-t border-white/15 pt-4">
            <p className="text-xs text-white/60">
              Available across this account
            </p>
          </div>
        </section>

        <section className="bank-card rounded-[24px] p-5 sm:p-7">
          <h2 className="text-xl font-bold">
            Account details
          </h2>

          <div className="mt-5 overflow-hidden rounded-[20px] border border-[#dce4e8]">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-[#637279]">
                Account type
              </span>

              <strong>
                {accountName}
              </strong>
            </div>

            <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-4">
              <span className="text-sm text-[#637279]">
                Account number
              </span>

              <strong>
                {account.accountNumber}
              </strong>
            </div>

            <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-4">
              <span className="text-sm text-[#637279]">
                Status
              </span>

              <strong>
                {account.status === "ACTIVE"
                  ? "Active"
                  : account.status}
              </strong>
            </div>

            <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-4">
              <span className="text-sm text-[#637279]">
                Transfers
              </span>

              <strong>
                {account.transferPermission ===
                "ENABLED"
                  ? "Available"
                  : account.transferPermission ===
                      "REVIEW"
                    ? "Under review"
                    : "Unavailable"}
              </strong>
            </div>

            <div className="flex items-center justify-between border-t border-[#e1e7ea] px-5 py-4">
              <span className="text-sm text-[#637279]">
                Opened
              </span>

              <strong>
                {formatDate(
                  account.openedAt
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="bank-card rounded-[24px] p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-bold">
              Recent transactions
            </h2>

            <p className="mt-1 text-sm text-[#637279]">
              Activity for this account
              only
            </p>
          </div>

          {account.transactions.length ===
          0 ? (
            <div className="py-10 text-center">
              <p className="font-semibold">
                No transactions yet
              </p>

              <p className="mt-1 text-sm text-[#637279]">
                Transactions for this
                account will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-[20px] border border-[#dce4e8]">
              {account.transactions.map(
                (transaction, index) => {
                  const isCredit =
                    transaction.type ===
                    "CREDIT";

                  return (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between gap-4 px-4 py-4 ${index > 0 ? "border-t border-[#e1e7ea]" : ""}`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef6f8] text-[#006b7d]">
                          {isCredit ? (
                            <ArrowDownLeft
                              size={19}
                            />
                          ) : (
                            <ArrowUpRight
                              size={19}
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {
                              transaction.title
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-[#7b898f]">
                            {formatDate(
                              transaction.transactionDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-bold">
                          {isCredit
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </p>

                        <p className="mt-0.5 text-xs capitalize text-[#7b898f]">
                          {transaction.status.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </BankingPage>
  );
}