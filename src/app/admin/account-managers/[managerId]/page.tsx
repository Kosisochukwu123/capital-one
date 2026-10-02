import { AccountManagerDetails } from "@/components/admin/account-manager-details";
import { requireSuperAdmin } from "@/server/auth/require-super-admin";
import { getAccountManagerDetails } from "@/server/queries/get-account-manager-details";

interface AccountManagerPageProps {
    params: Promise<{
        managerId: string;
    }>;
}

export default async function AccountManagerPage({
    params,
}: AccountManagerPageProps) {
    await requireSuperAdmin();

    const { managerId } = await params;

    const data =
        await getAccountManagerDetails(
            managerId
        );

    return (
        <main className="min-h-screen bg-[#eef6fb]">
            <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
                <AccountManagerDetails
                    manager={data.manager}
                    otherManagers={
                        data.otherManagers
                    }
                />
            </div>
        </main>
    );
}