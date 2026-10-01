"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";

type UpdateProfileImageResult =
  | {
      success: true;
      imageUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function updateProfileImageAction(
  formData: FormData
): Promise<UpdateProfileImageResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  const file = formData.get("image");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "Choose an image.",
    };
  }

  if (file.size === 0) {
    return {
      success: false,
      error: "Choose an image.",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error:
        "Only JPG, PNG and WebP images are allowed.",
    };
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      success: false,
      error:
        "Profile image must be 5MB or smaller.",
    };
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        status: true,
        profile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.profile
    ) {
      return {
        success: false,
        error: "Profile is not available.",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult =
      await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "northstar/profile-images",
              resource_type: "image",
              transformation: [
                {
                  width: 500,
                  height: 500,
                  crop: "fill",
                  gravity: "face",
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
                      "Upload failed"
                    )
                );
                return;
              }

              resolve({
                secure_url:
                  result.secure_url,
              });
            }
          );

        uploadStream.end(buffer);
      });

    await db.profile.update({
      where: {
        id: user.profile.id,
      },
      data: {
        avatarUrl:
          uploadResult.secure_url,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
      imageUrl:
        uploadResult.secure_url,
    };
  } catch (error) {
    console.error(
      "Profile image upload error:",
      error
    );

    return {
      success: false,
      error:
        "Unable to update your profile image.",
    };
  }
}