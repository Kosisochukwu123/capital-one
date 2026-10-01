import Link from "next/link";
import { ArrowLeft, ChevronRight, Users } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminUsers } from "@/server/queries/get-admin-users";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await getAdminUsers();

  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-8">
      <div className="mx-auto w-full max-w-[1100px]">
        <Link href="/admin" className="inline-flex items-center gap-2 font-semibold text-[#006b7d]">
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#66808a]">Administration</p>
            <h1 className="mt-1 text-3xl font-bold text-[#173743]">Users</h1>
            <p className="mt-2 text-[#66777e]">Manage users and their banking accounts.</p>
          </div>

          <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#173743]">
            {users.length} {users.length === 1 ? "user" : "users"}
          </div>
        </div>

        {users.length === 0 ? (
          <div className="mt-8 rounded-[24px] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
              <Users size={25} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#173743]">No users yet</h2>

            <p className="mt-2 text-[#718087]">
              Registered users will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[24px] bg-white">
            {users.map((user, index) => {
              const checking = user.accounts.find(
                (account) => account.type === "CHECKING"
              );

              const savings = user.accounts.find(
                (account) => account.type === "SAVINGS"
              );

              return (
                <Link key={user.id} href={`/admin/users/${user.id}`} className={`flex items-center justify-between gap-5 px-5 py-6 transition hover:bg-[#f8fbfc] sm:px-7 ${index !== 0 ? "border-t border-[#e5ebed]" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="truncate text-[18px] font-bold text-[#173743]">
                        {user.fullName}
                      </p>

                      <span className="rounded-full bg-[#edf5f7] px-3 py-1 text-xs font-bold text-[#45616b]">
                        {user.status}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-[#718087]">
                      {user.email}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#66777e]">
                      <span>
                        Customer ID:{" "}
                        <strong className="text-[#173743]">
                          {user.customerId ?? "—"}
                        </strong>
                      </span>

                      <span>
                        Checking:{" "}
                        <strong className="text-[#173743]">
                          {checking
                            ? `•••• ${checking.accountNumber.slice(-4)}`
                            : "—"}
                        </strong>
                      </span>

                      <span>
                        Savings:{" "}
                        <strong className="text-[#173743]">
                          {savings
                            ? `•••• ${savings.accountNumber.slice(-4)}`
                            : "—"}
                        </strong>
                      </span>

                      <span>
                        Transactions:{" "}
                        <strong className="text-[#173743]">
                          {user.transactionCount}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-medium text-[#718087]">
                        Total balance
                      </p>

                      <p className="mt-1 text-lg font-bold text-[#173743]">
                        {formatCurrency(user.totalBalance)}
                      </p>
                    </div>

                    <ChevronRight
                      size={22}
                      className="text-[#718087]"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}