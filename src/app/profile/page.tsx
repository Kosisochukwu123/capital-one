import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { ProfileDetailsView } from "@/components/profile/profile-details-view";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      email: true,
      customerId: true,
      status: true,
      createdAt: true,
      requiresPinSetup: true,

      profile: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          dateOfBirth: true,
          phone: true,
          country: true,
          state: true,
          city: true,
          address: true,
          postalCode: true,
          avatarUrl: true,
        },
      },

      accounts: {
        where: {
          status: {
            not: "CLOSED",
          },
        },

        orderBy: {
          openedAt: "asc",
        },

        select: {
          id: true,
          type: true,
          accountNumber: true,
          status: true,
          transferPermission: true,
          openedAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status === "SUSPENDED") {
    redirect("/login");
  }

  return (
    <BankingPage title="Profile">
      <ProfileDetailsView user={user} />
    </BankingPage>
  );
}