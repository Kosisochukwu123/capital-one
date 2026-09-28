"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

export async function sendAdminSupportMessageAction(
  conversationId: string,
  message: string
) {
  const admin = await requireAdmin();

  const body = message.trim();

  if (!body) {
    return {
      success: false,
      error: "Enter a message.",
    };
  }

  if (body.length > 2000) {
    return {
      success: false,
      error: "Message is too long.",
    };
  }

  const conversation =
    await db.supportConversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

  if (!conversation) {
    return {
      success: false,
      error: "Conversation could not be found.",
    };
  }

  if (conversation.status !== "OPEN") {
    return {
      success: false,
      error:
        "Reopen this conversation before replying.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
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
        action: "SUPPORT_REPLY_SENT",
        targetType: "SupportConversation",
        targetId: conversation.id,
        description: `Admin replied to support conversation ${conversation.id}.`,
      },
    });
  });

  revalidatePath("/admin/messages");
  revalidatePath("/messages");

  return {
    success: true,
  };
}

export async function resolveSupportConversationAction(
  conversationId: string
) {
  const admin = await requireAdmin();

  const conversation =
    await db.supportConversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!conversation) {
    return {
      success: false,
      error: "Conversation could not be found.",
    };
  }

  if (conversation.status === "RESOLVED") {
    return {
      success: true,
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
        action: "SUPPORT_CONVERSATION_RESOLVED",
        targetType: "SupportConversation",
        targetId: conversation.id,
        description: `Support conversation ${conversation.id} resolved.`,
      },
    });
  });

  revalidatePath("/admin/messages");
  revalidatePath("/messages");

  return {
    success: true,
  };
}

export async function reopenSupportConversationAction(
  conversationId: string
) {
  const admin = await requireAdmin();

  const conversation =
    await db.supportConversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!conversation) {
    return {
      success: false,
      error: "Conversation could not be found.",
    };
  }

  if (conversation.status === "OPEN") {
    return {
      success: true,
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
        action: "SUPPORT_CONVERSATION_REOPENED",
        targetType: "SupportConversation",
        targetId: conversation.id,
        description: `Support conversation ${conversation.id} reopened.`,
      },
    });
  });

  revalidatePath("/admin/messages");
  revalidatePath("/messages");

  return {
    success: true,
  };
}

export async function markCustomerSupportMessagesReadAction(
  conversationId: string
) {
  await requireAdmin();

  const conversation =
    await db.supportConversation.findUnique({
      where: {
        id: conversationId,
      },

      select: {
        id: true,
      },
    });

  if (!conversation) {
    return {
      success: false,
    };
  }

  await db.supportMessage.updateMany({
    where: {
      conversationId,
      senderRole: "USER",
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/admin/messages");

  return {
    success: true,
  };
}