import { db } from "@/lib/db";

export async function getUserSupport(userId: string) {
  const conversations = await db.supportConversation.findMany({
    where: {
      userId,
    },

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      subject: true,
      status: true,
      resolvedAt: true,
      createdAt: true,
      updatedAt: true,

      messages: {
        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          senderId: true,
          senderRole: true,
          body: true,
          readAt: true,
          createdAt: true,
        },
      },
    },
  });

  return conversations;
}