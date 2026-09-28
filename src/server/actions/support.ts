"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  sendSupportMessageSchema,
  startSupportConversationSchema,
  type SendSupportMessageInput,
  type StartSupportConversationInput,
} from "@/lib/validations/support";

export async function startSupportConversationAction(
  values: StartSupportConversationInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const parsed =
    startSupportConversationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid conversation information.",
    };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      status: true,
      role: true,
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    user.role !== "USER"
  ) {
    return {
      success: false,
      error: "Customer support is unavailable.",
    };
  }

  const conversation = await db.$transaction(
    async (tx) => {
      const created =
        await tx.supportConversation.create({
          data: {
            userId: user.id,
            subject: parsed.data.subject.trim(),
            status: "OPEN",
          },
          select: {
            id: true,
          },
        });

      await tx.supportMessage.create({
        data: {
          conversationId: created.id,
          senderId: user.id,
          senderRole: "USER",
          body: parsed.data.message.trim(),
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "SUPPORT_CONVERSATION_CREATED",
          description: `Support conversation ${created.id} created.`,
        },
      });

      return created;
    }
  );

  revalidatePath("/messages");

  return {
    success: true,
    conversationId: conversation.id,
  };
}

export async function sendSupportMessageAction(
  values: SendSupportMessageInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const parsed =
    sendSupportMessageSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid message.",
    };
  }

  const conversation =
    await db.supportConversation.findFirst({
      where: {
        id: parsed.data.conversationId,
        userId: session.user.id,
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

  if (conversation.status !== "OPEN") {
    return {
      success: false,
      error:
        "This conversation has been resolved.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        senderRole: "USER",
        body: parsed.data.message.trim(),
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
  });

  revalidatePath("/messages");

  return {
    success: true,
  };
}

export async function markSupportMessagesReadAction(
  conversationId: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
    };
  }

  const conversation =
    await db.supportConversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
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
      conversationId: conversation.id,
      senderRole: "ADMIN",
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/messages");

  return {
    success: true,
  };
}