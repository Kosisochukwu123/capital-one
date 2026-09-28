import { db } from "@/lib/db";

export async function getAdminSupport() {
  const conversations =
    await db.supportConversation.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          updatedAt: "desc",
        },
      ],

      select: {
        id: true,
        subject: true,
        status: true,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            email: true,
            customerId: true,

            profile: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },

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

  return conversations.map((conversation) => ({
    ...conversation,

    user: {
      ...conversation.user,

      fullName: conversation.user.profile
        ? [
            conversation.user.profile.firstName,
            conversation.user.profile.middleName,
            conversation.user.profile.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : conversation.user.email,
    },
  }));
}