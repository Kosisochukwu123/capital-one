import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminSupportUnreadCount } from "@/server/queries/get-support-unread-count";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await requireAdmin();

    const unreadCount =
        await getAdminSupportUnreadCount({
            id: admin.id,
            role: admin.role,
        });

    return (
        <>
            <AdminHeader
                unreadCount={unreadCount}
                role={admin.role}
            />

            {children}
        </>
    );
}