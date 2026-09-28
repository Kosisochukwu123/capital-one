import Link from "next/link";

import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminDashboardData } from "@/server/queries/get-admin-dashboard-data";
import { AdminHeader } from "@/components/admin/admin-header";


export default async function AdminPage() {
    const admin = await requireAdmin();
    const data = await getAdminDashboardData();

    const adminName = admin.profile
        ? `${admin.profile.firstName} ${admin.profile.lastName}`
        : admin.email;

    return (
        <main className="min-h-screen bg-[#eef6fb] px-4 py-8">

            {/* <AdminHeader /> */}

            <div className="mx-auto w-full max-w-[1100px]">
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <p className="text-sm font-semibold text-[#66808a]">Administration</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#173743]">Admin dashboard</h1>
                        <p className="mt-2 text-[#66777e]">Signed in as {adminName}</p>
                    </div>

                    <Link href="/admin/users" className="rounded-full bg-[#003b4d] px-6 py-3 font-semibold text-white">
                        Manage users
                    </Link>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard label="Users" value={data.totalUsers} />
                    <StatCard label="Active users" value={data.activeUsers} />
                    <StatCard label="Suspended" value={data.suspendedUsers} />
                    <StatCard label="Accounts" value={data.totalAccounts} />
                    <StatCard label="Pending transactions" value={data.pendingTransactions} />
                    <StatCard label="Transactions" value={data.totalTransactions} />
                </div>

                <section className="mt-8 overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e4eaed] px-6 py-5">
                        <div>
                            <h2 className="text-xl font-bold text-[#173743]">Recent users</h2>
                            <p className="mt-1 text-sm text-[#718087]">Recently created simulation accounts.</p>
                        </div>

                        <Link href="/admin/users" className="font-semibold text-[#006b7d]">
                            View all
                        </Link>
                    </div>

                    {data.recentUsers.length === 0 ? (
                        <div className="px-6 py-10 text-center text-[#718087]">
                            No regular users have been created yet.
                        </div>
                    ) : (
                        <div>
                            {data.recentUsers.map((user) => (
                                <Link key={user.id} href={`/admin/users/${user.id}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf1f2] px-6 py-5 last:border-b-0">
                                    <div>
                                        <p className="font-bold text-[#173743]">{user.fullName}</p>
                                        <p className="mt-1 text-sm text-[#718087]">{user.email}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold text-[#173743]">{user.status}</p>
                                        <p className="mt-1 text-sm text-[#718087]">{user.customerId ?? "No customer ID"}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

        </main>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-[22px] bg-white p-6">
            <p className="text-sm font-medium text-[#718087]">{label}</p>
            <p className="mt-3 text-3xl font-bold text-[#173743]">{value}</p>
        </div>
    );
}