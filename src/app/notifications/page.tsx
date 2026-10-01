import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      status: true,

      notifications: {
        orderBy: {
          createdAt: "desc",
        },

        take: 50,

        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          read: true,
          createdAt: true,
        },
      },
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE"
  ) {
    redirect("/login");
  }

  const notifications =
    user.notifications.map(
      (notification) => ({
        ...notification,
        createdAt:
          notification.createdAt.toISOString(),
      })
    );

  return (
    <BankingPage title="Notifications">
      <NotificationCenter
        notifications={notifications}
      />
    </BankingPage>
  );
}