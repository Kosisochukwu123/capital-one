"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import {
  sendSupportMessageSchema,
  startSupportConversationSchema,
  type StartSupportConversationInput,
} from "@/lib/validations/support";

type SupportActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

type StartConversationResult =
  | {
      success: true;
      conversationId: string;
    }
  | {
      success: false;
      error: string;
    };

type UploadedSupportImage = {
  secureUrl: string;
  publicId: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function validateImage(
  file: File
): string | null {
  if (file.size === 0) {
    return "Choose an image.";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG and WebP images are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

async function uploadSupportImage(
  file: File
): Promise<UploadedSupportImage> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<UploadedSupportImage>(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "northstar/support-images",
            resource_type: "image",

            transformation: [
              {
                width: 1600,
                height: 1600,
                crop: "limit",
              },
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error ??
                  new Error(
                    "Support image upload failed."
                  )
              );
              return;
            }

            resolve({
              secureUrl:
                result.secure_url,
              publicId:
                result.public_id,
            });
          }
        );

      uploadStream.end(buffer);
    }
  );
}

async function deleteUploadedImage(
  publicId: string
) {
  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );
  } catch (error) {
    console.error(
      "Failed to clean up support image:",
      error
    );
  }
}

export async function startSupportConversationAction(
  values: StartSupportConversationInput
): Promise<StartConversationResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const parsed =
    startSupportConversationSchema.safeParse(
      values
    );

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
      error:
        "Customer support is unavailable.",
    };
  }

  const conversation =
    await db.$transaction(async (tx) => {
      const created =
        await tx.supportConversation.create({
          data: {
            userId: user.id,
            subject:
              parsed.data.subject.trim(),
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
          body:
            parsed.data.message.trim(),
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action:
            "SUPPORT_CONVERSATION_CREATED",
          description: `Support conversation ${created.id} created.`,
        },
      });

      return created;
    });

  revalidatePath("/messages");

  return {
    success: true,
    conversationId: conversation.id,
  };
}

export async function sendSupportMessageAction(
  formData: FormData
): Promise<SupportActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const conversationIdValue =
    formData.get("conversationId");

  const messageValue =
    formData.get("message");

  const imageValue =
    formData.get("image");

  const conversationId =
    typeof conversationIdValue === "string"
      ? conversationIdValue.trim()
      : "";

  const message =
    typeof messageValue === "string"
      ? messageValue.trim()
      : "";

  const image =
    imageValue instanceof File &&
    imageValue.size > 0
      ? imageValue
      : null;

  if (!conversationId) {
    return {
      success: false,
      error:
        "Conversation could not be found.",
    };
  }

  /*
   * Keep using the existing Zod schema for
   * conversation/message validation whenever
   * text has been supplied.
   */
  if (message) {
    const parsed =
      sendSupportMessageSchema.safeParse({
        conversationId,
        message,
      });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Invalid message.",
      };
    }
  }

  if (!message && !image) {
    return {
      success: false,
      error:
        "Write a message or choose an image.",
    };
  }

  if (message.length > 2000) {
    return {
      success: false,
      error:
        "Message must be 2000 characters or less.",
    };
  }

  if (image) {
    const imageError =
      validateImage(image);

    if (imageError) {
      return {
        success: false,
        error: imageError,
      };
    }
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (
    !user ||
    user.role !== "USER" ||
    user.status !== "ACTIVE"
  ) {
    return {
      success: false,
      error:
        "Customer support is unavailable.",
    };
  }

  const conversation =
    await db.supportConversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!conversation) {
    return {
      success: false,
      error:
        "Conversation could not be found.",
    };
  }

  if (conversation.status !== "OPEN") {
    return {
      success: false,
      error:
        "This conversation has been resolved.",
    };
  }

  let uploadedImage:
    | UploadedSupportImage
    | null = null;

  try {
    if (image) {
      uploadedImage =
        await uploadSupportImage(image);
    }

    await db.$transaction(async (tx) => {
      await tx.supportMessage.create({
        data: {
          conversationId:
            conversation.id,
          senderId: user.id,
          senderRole: "USER",

          body:
            message.length > 0
              ? message
              : null,

          imageUrl:
            uploadedImage?.secureUrl ??
            null,

          imagePublicId:
            uploadedImage?.publicId ??
            null,
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
    revalidatePath("/admin/messages");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Send support message error:",
      error
    );

    /*
     * If Cloudinary succeeded but the database
     * operation failed, remove the orphaned
     * Cloudinary image.
     */
    if (uploadedImage) {
      await deleteUploadedImage(
        uploadedImage.publicId
      );
    }

    return {
      success: false,
      error:
        "Unable to send your message.",
    };
  }
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
      conversationId:
        conversation.id,
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