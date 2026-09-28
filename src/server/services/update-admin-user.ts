import { db } from "@/lib/db";

export type AdminUserStatus =
  | "ACTIVE"
  | "SUSPENDED";

interface UpdateUserStatusInput {
  adminId: string;
  userId: string;
  status: AdminUserStatus;
  reason?: string;
}

export type UpdateAdminUserStatusResult = {
  success: true;
  userId: string;
  status: AdminUserStatus;
};

export async function updateAdminUserStatus({
  adminId,
  userId,
  status,
  reason,
}: UpdateUserStatusInput): Promise<UpdateAdminUserStatusResult> {
  if (adminId === userId) {
    throw new Error("CANNOT_MODIFY_SELF");
  }

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        status: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (user.role === "ADMIN") {
      throw new Error("CANNOT_MODIFY_ADMIN");
    }

    if (user.status === status) {
      return {
        success: true,
        userId: user.id,
        status,
      };
    }

    const beforeData = {
      status: user.status,
    };

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        adminId,
        action:
          status === "SUSPENDED"
            ? "USER_SUSPENDED"
            : "USER_ACTIVATED",
        targetType: "USER",
        targetId: user.id,
        description:
          reason ||
          `User status changed from ${user.status} to ${status}.`,
        beforeData,
        afterData: {
          status,
          reason: reason || null,
        },
      },
    });

    return {
      success: true,
      userId: user.id,
      status,
    };
  });
}