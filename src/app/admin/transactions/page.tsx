import { AdminTransactionsView } from "@/components/admin/admin-transactions-view";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminTransactions } from "@/server/queries/get-admin-transactions";

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const transactions =
    await getAdminTransactions();

  const pendingCount =
    transactions.filter(
      (transaction) =>
        transaction.status === "PENDING"
    ).length;

  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6d8087]">
            Administration
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#173743]">
                Transactions
              </h1>

              <p className="mt-2 text-sm text-[#718087]">
                Review and manage customer transaction activity.
              </p>
            </div>

            {pendingCount > 0 && (
              <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
                {pendingCount} pending
              </div>
            )}
          </div>
        </div>

        <AdminTransactionsView
          transactions={transactions}
        />
      </div>
    </main>
  );
}