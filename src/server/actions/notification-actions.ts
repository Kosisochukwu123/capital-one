"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type NotificationActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  try {
    const notification =
      await db.notification.findFirst({
        where: {
          id: notificationId,
          userId: session.user.id,
        },

        select: {
          id: true,
        },
      });

    if (!notification) {
      return {
        success: false,
        error: "Notification not found.",
      };
    }

    await db.notification.update({
      where: {
        id: notification.id,
      },

      data: {
        read: true,
      },
    });

    revalidatePath("/help");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );

    return {
      success: false,
      error:
        "Unable to update notification.",
    };
  }
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  try {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },

      data: {
        read: true,
      },
    });

    revalidatePath("/help");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to mark notifications as read:",
      error
    );

    return {
      success: false,
      error:
        "Unable to update notifications.",
    };
  }
}