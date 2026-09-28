import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminSupportUnreadCount } from "@/server/queries/get-support-unread-count";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadCount =
    await getAdminSupportUnreadCount();

  return (
    <>
      <AdminHeader
        unreadCount={unreadCount}
      />

      {children}
    </>
  );
}