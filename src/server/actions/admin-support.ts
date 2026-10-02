"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

type AdminIdentity = {
    id: string;
    role: UserRole;
};

async function getAuthorizedConversation(
    conversationId: string,
    admin: AdminIdentity
) {
    const conversation =
        await db.supportConversation.findUnique({
            where: {
                id: conversationId,
            },

            select: {
                id: true,
                userId: true,
                status: true,

                user: {
                    select: {
                        accountManagerId: true,
                    },
                },
            },
        });

    if (!conversation) {
        return {
            success: false as const,
            error:
                "Conversation could not be found.",
        };
    }

    if (
        admin.role !== "SUPER_ADMIN" &&
        conversation.user
            .accountManagerId !== admin.id
    ) {
        return {
            success: false as const,
            error:
                "You do not have permission to manage this conversation.",
        };
    }

    return {
        success: true as const,
        conversation,
    };
}

export async function sendAdminSupportMessageAction(
    conversationId: string,
    message: string
) {
    const admin = await requireAdmin();

    const body = message.trim();

    if (!body) {
        return {
            success: false as const,
            error: "Enter a message.",
        };
    }

    if (body.length > 2000) {
        return {
            success: false as const,
            error: "Message is too long.",
        };
    }

    const access =
        await getAuthorizedConversation(
            conversationId,
            admin
        );

    if (!access.success) {
        return access;
    }

    const conversation =
        access.conversation;

    if (
        conversation.status !== "OPEN"
    ) {
        return {
            success: false as const,
            error:
                "Reopen this conversation before replying.",
        };
    }

    await db.$transaction(async (tx) => {
        await tx.supportMessage.create({
            data: {
                conversationId:
                    conversation.id,
                senderId: admin.id,
                senderRole: "ADMIN",
                body,
            },
        });

        await tx.supportConversation.update({
            where: {
                id: conversation.id,
            },

            data: {
                updatedAt: new Date(),
            },
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                action:
                    "SUPPORT_REPLY_SENT",
                targetType:
                    "SupportConversation",
                targetId:
                    conversation.id,
                description:
                    `Admin replied to support conversation ${conversation.id}.`,
            },
        });
    });

    revalidatePath(
        "/admin/messages"
    );
    revalidatePath("/messages");

    return {
        success: true as const,
    };
}

export async function resolveSupportConversationAction(
    conversationId: string
) {
    const admin = await requireAdmin();

    const access =
        await getAuthorizedConversation(
            conversationId,
            admin
        );

    if (!access.success) {
        return access;
    }

    const conversation =
        access.conversation;

    if (
        conversation.status === "RESOLVED"
    ) {
        return {
            success: true as const,
        };
    }

    await db.$transaction(async (tx) => {
        await tx.supportConversation.update({
            where: {
                id: conversation.id,
            },

            data: {
                status: "RESOLVED",
                resolvedAt: new Date(),
            },
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                action:
                    "SUPPORT_CONVERSATION_RESOLVED",
                targetType:
                    "SupportConversation",
                targetId:
                    conversation.id,
                description:
                    `Support conversation ${conversation.id} resolved.`,
            },
        });
    });

    revalidatePath(
        "/admin/messages"
    );
    revalidatePath("/messages");

    return {
        success: true as const,
    };
}

export async function reopenSupportConversationAction(
    conversationId: string
) {
    const admin = await requireAdmin();

    const access =
        await getAuthorizedConversation(
            conversationId,
            admin
        );

    if (!access.success) {
        return access;
    }

    const conversation =
        access.conversation;

    if (
        conversation.status === "OPEN"
    ) {
        return {
            success: true as const,
        };
    }

    await db.$transaction(async (tx) => {
        await tx.supportConversation.update({
            where: {
                id: conversation.id,
            },

            data: {
                status: "OPEN",
                resolvedAt: null,
            },
        });

        await tx.auditLog.create({
            data: {
                adminId: admin.id,
                action:
                    "SUPPORT_CONVERSATION_REOPENED",
                targetType:
                    "SupportConversation",
                targetId:
                    conversation.id,
                description:
                    `Support conversation ${conversation.id} reopened.`,
            },
        });
    });

    revalidatePath(
        "/admin/messages"
    );
    revalidatePath("/messages");

    return {
        success: true as const,
    };
}

export async function markCustomerSupportMessagesReadAction(
    conversationId: string
) {
    const admin = await requireAdmin();

    const access =
        await getAuthorizedConversation(
            conversationId,
            admin
        );

    if (!access.success) {
        return {
            success: false as const,
        };
    }

    await db.supportMessage.updateMany({
        where: {
            conversationId:
                access.conversation.id,
            senderRole: "USER",
            readAt: null,
        },

        data: {
            readAt: new Date(),
        },
    });

    revalidatePath(
        "/admin/messages"
    );

    return {
        success: true as const,
    };
}