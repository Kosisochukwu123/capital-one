import { db } from "@/lib/db";

export async function getAdminUserDetails(
  userId: string
) {
  const user = await db.user.findFirst({
    where: {
      id: userId,
      role: "USER",
    },

    select: {
      id: true,
      email: true,
      customerId: true,
      status: true,
      onboardingComplete: true,
      requiresPinSetup: true,
      accountManagerId: true,
      createdAt: true,
      updatedAt: true,

      accountManager: {
        select: {
          id: true,
          email: true,

          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },

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
        },
      },

      accounts: {
        orderBy: {
          openedAt: "asc",
        },

        select: {
          id: true,
          type: true,
          accountNumber: true,
          currency: true,
          balance: true,
          status: true,
          transferPermission: true,
          openedAt: true,
        },
      },

      transactions: {
        orderBy: {
          transactionDate: "desc",
        },

        take: 10,

        select: {
          id: true,
          reference: true,
          type: true,
          status: true,
          amount: true,
          title: true,
          description: true,
          category: true,
          memo: true,
          statusReason: true,
          transactionDate: true,
          accountId: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    customerId: user.customerId,
    status: user.status,
    onboardingComplete:
      user.onboardingComplete,
    requiresPinSetup:
      user.requiresPinSetup,

    accountManagerId:
      user.accountManagerId,

    accountManager:
      user.accountManager
        ? {
            id: user.accountManager.id,
            email:
              user.accountManager.email,
            profile:
              user.accountManager.profile
                ? {
                    firstName:
                      user.accountManager
                        .profile.firstName,
                    lastName:
                      user.accountManager
                        .profile.lastName,
                  }
                : null,
          }
        : null,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    profile: user.profile
      ? {
          firstName:
            user.profile.firstName,
          middleName:
            user.profile.middleName,
          lastName:
            user.profile.lastName,
          dateOfBirth:
            user.profile.dateOfBirth,
          phone: user.profile.phone,
          country: user.profile.country,
          state: user.profile.state,
          city: user.profile.city,
          address: user.profile.address,
          postalCode:
            user.profile.postalCode,
        }
      : null,

    accounts: user.accounts.map(
      (account) => ({
        id: account.id,
        type: account.type,
        accountNumber:
          account.accountNumber,
        currency: account.currency,
        balance:
          account.balance.toNumber(),
        status: account.status,
        transferPermission:
          account.transferPermission,
        openedAt: account.openedAt,
      })
    ),

    transactions:
      user.transactions.map(
        (transaction) => ({
          id: transaction.id,
          reference:
            transaction.reference,
          type: transaction.type,
          status: transaction.status,
          amount:
            transaction.amount.toNumber(),
          title: transaction.title,
          description:
            transaction.description,
          category:
            transaction.category,
          memo: transaction.memo,
          statusReason:
            transaction.statusReason,
          transactionDate:
            transaction.transactionDate,
          accountId:
            transaction.accountId,
        })
      ),
  };
}