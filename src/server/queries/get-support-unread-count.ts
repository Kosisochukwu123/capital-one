import type { UserRole } from "@prisma/client";

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

export async function getAdminSupportUnreadCount(
    admin: {
        id: string;
        role: UserRole;
    }
) {
    return db.supportMessage.count({
        where: {
            senderRole: "USER",
            readAt: null,

            ...(admin.role === "SUPER_ADMIN"
                ? {}
                : {
                      conversation: {
                          user: {
                              accountManagerId:
                                  admin.id,
                          },
                      },
                  }),
        },
    });
}