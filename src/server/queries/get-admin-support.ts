import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";

type AdminUser = {
  id: string;
  role: UserRole;
};

export async function getAdminSupport(
  admin: AdminUser
) {
  const conversations =
    await db.supportConversation.findMany({
      where: {
        ...(admin.role === "ADMIN"
          ? {
              user: {
                accountManagerId: admin.id,
              },
            }
          : {}),
      },

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

            // Image attachment
            imageUrl: true,
            imagePublicId: true,

            readAt: true,
            createdAt: true,
          },
        },
      },
    });

  return conversations.map(
    (conversation) => ({
      ...conversation,

      user: {
        ...conversation.user,

        fullName:
          conversation.user.profile
            ? [
                conversation.user.profile
                  .firstName,

                conversation.user.profile
                  .middleName,

                conversation.user.profile
                  .lastName,
              ]
                .filter(Boolean)
                .join(" ")
            : conversation.user.email,
      },
    })
  );
}