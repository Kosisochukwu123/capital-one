import { AccountManagersDashboard } from "@/components/admin/account-managers-dashboard";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";
import { getAccountManagerDashboard } from "@/server/queries/get-account-manager-dashboard";

export default async function AccountManagersPage() {
    await requireSuperAdmin();

    const data =
        await getAccountManagerDashboard();

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <AccountManagersDashboard
                    managers={data.managers}
                    unassignedCustomers={
                        data.unassignedCustomers
                    }
                    stats={data.stats}
                />
            </div>
        </main>
    );
}