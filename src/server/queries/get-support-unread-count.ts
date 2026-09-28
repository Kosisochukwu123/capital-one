import { db } from "@/lib/db";

export async function getCustomerSupportUnreadCount(
  userId: string
) {
  return db.supportMessage.count({
    where: {
      senderRole: "ADMIN",
      readAt: null,

      conversation: {
        userId,
      },
    },
  });
}

export async function getAdminSupportUnreadCount() {
  return db.supportMessage.count({
    where: {
      senderRole: "USER",
      readAt: null,
    },
  });
}