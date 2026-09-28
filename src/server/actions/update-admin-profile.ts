"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-admin";

interface UpdateAdminProfileInput {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

type UpdateAdminProfileResult =
  | {
      success: true;
      profile: Awaited<
        ReturnType<typeof db.profile.update>
      >;
    }
  | {
      success: false;
      error: string;
    };

export async function updateAdminProfileAction(
  values: UpdateAdminProfileInput
): Promise<UpdateAdminProfileResult> {
  const admin = await requireAdmin();

  try {
    const user = await db.user.findUnique({
      where: {
        id: values.userId,
      },
      select: {
        id: true,
        role: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return {
        success: false,
        error: "Customer profile not found.",
      };
    }

    if (user.role === "ADMIN") {
      return {
        success: false,
        error:
          "Administrator profiles cannot be edited here.",
      };
    }

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const phone = values.phone?.trim() ?? "";
    const state = values.state?.trim() ?? "";
    const country = values.country?.trim() ?? "";

    if (!firstName || !lastName) {
      return {
        success: false,
        error:
          "First and last name are required.",
      };
    }

    if (!phone) {
      return {
        success: false,
        error: "Phone number is required.",
      };
    }

    if (!state) {
      return {
        success: false,
        error:
          "State / Province is required.",
      };
    }

    if (!country) {
      return {
        success: false,
        error: "Country is required.",
      };
    }

    const beforeData = {
      firstName: user.profile.firstName,
      middleName: user.profile.middleName,
      lastName: user.profile.lastName,
      phone: user.profile.phone,
      address: user.profile.address,
      city: user.profile.city,
      state: user.profile.state,
      country: user.profile.country,
      postalCode: user.profile.postalCode,
    };

    const profile = await db.$transaction(
      async (tx) => {
        const updatedProfile =
          await tx.profile.update({
            where: {
              id: user.profile!.id,
            },
            data: {
              firstName,
              middleName:
                values.middleName?.trim() ||
                null,
              lastName,

              // Required Prisma fields
              phone,
              state,
              country,

              // Optional Prisma fields
              address:
                values.address?.trim() ||
                null,
              city:
                values.city?.trim() ||
                null,
              postalCode:
                values.postalCode?.trim() ||
                null,
            },
          });

        await tx.auditLog.create({
          data: {
            adminId: admin.id,
            action:
              "CUSTOMER_PROFILE_UPDATED",
            targetType: "USER",
            targetId: user.id,
            description:
              "Customer profile information was updated.",
            beforeData,
            afterData: {
              firstName:
                updatedProfile.firstName,
              middleName:
                updatedProfile.middleName,
              lastName:
                updatedProfile.lastName,
              phone: updatedProfile.phone,
              address:
                updatedProfile.address,
              city: updatedProfile.city,
              state: updatedProfile.state,
              country:
                updatedProfile.country,
              postalCode:
                updatedProfile.postalCode,
            },
          },
        });

        return updatedProfile;
      }
    );

    revalidatePath("/admin/users");
    revalidatePath(
      `/admin/users/${user.id}`
    );
    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error(
      "Admin profile update error:",
      error
    );

    return {
      success: false,
      error:
        "Unable to update customer information.",
    };
  }
}