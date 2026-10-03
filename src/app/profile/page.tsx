import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileImageUpload } from "@/components/profile/profile-image-upload";

function formatDate(
  date: Date | null | undefined
) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}

function getInitials(
  firstName: string,
  lastName: string
) {
  const first =
    firstName.trim().charAt(0);

  const last =
    lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase();
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user =
    await db.user.findUnique({
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

  const firstName =
    user.profile?.firstName ??
    "Customer";

  const middleName =
    user.profile?.middleName ??
    null;

  const lastName =
    user.profile?.lastName ?? "";

  const fullName = [
    firstName,
    middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = getInitials(
    firstName,
    lastName
  );

  const hasRestrictedAccount =
    user.accounts.some(
      (account) =>
        account.status !== "ACTIVE" ||
        account.transferPermission !==
        "ENABLED"
    );

  const allTransfersEnabled =
    user.accounts.length > 0 &&
    user.accounts.every(
      (account) =>
        account.status === "ACTIVE" &&
        account.transferPermission ===
        "ENABLED"
    );

  const accountOpeningDate =
    user.accounts.length > 0
      ? user.accounts[0].openedAt
      : user.createdAt;

  const fields = [
    [
      "SURNAME",
      lastName || "—",
    ],
    [
      "MIDDLE NAME",
      middleName || "—",
    ],
    [
      "FIRST NAME",
      firstName || "—",
    ],
    [
      "CUSTOMER ID",
      user.customerId || "—",
    ],
    [
      "EMAIL",
      user.email,
    ],
    [
      "DATE OF BIRTH",
      formatDate(
        user.profile?.dateOfBirth
      ),
    ],
    [
      "PHONE",
      user.profile?.phone || "—",
    ],
    [
      "COUNTRY",
      user.profile?.country || "—",
    ],
    [
      "STATE / PROVINCE",
      user.profile?.state || "—",
    ],
    [
      "CITY",
      user.profile?.city || "—",
    ],
    [
      "ADDRESS",
      user.profile?.address || "—",
    ],
    [
      "POSTAL CODE",
      user.profile?.postalCode || "—",
    ],
    [
      "ACCOUNT OPENED",
      formatDate(accountOpeningDate),
    ],
  ];

  return (
    <BankingPage title="Profile">
      <div className="space-y-5">
        {/* Profile heading */}

        <section className="bank-card flex items-center gap-4 rounded-[24px] p-5">
          <ProfileImageUpload
            initialImageUrl={
              user.profile?.avatarUrl ?? null
            }
            initials={initials}
          />

          <div className="min-w-0">
            <h1 className="truncate text-[25px] font-bold text-[#173743]">
              {fullName}
            </h1>

            <p className="mt-1 text-sm text-[#66767d]">
              Customer ID:{" "}
              {user.customerId ||
                "Not assigned"}
            </p>

            <p className="mt-1 truncate text-[#52666e] underline">
              {user.email}
            </p>
          </div>
        </section>

        {/* Transfer/access status */}

        {allTransfersEnabled ? (
          <div className="flex items-center gap-3 rounded-[20px] bg-[#d8f0e9] px-5 py-5 font-bold text-[#168565]">
            <ShieldCheck size={25} />

            <div>
              <p>
                Transfer status: Active
              </p>

              <p className="mt-1 text-xs font-medium opacity-80">
                Your accounts are
                available for transfers.
              </p>
            </div>
          </div>
        ) : hasRestrictedAccount ? (
          <div className="flex items-start gap-3 rounded-[20px] border border-amber-100 bg-amber-50 px-5 py-5 text-amber-800">
            <AlertTriangle
              size={24}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Account restrictions
                active
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                One or more accounts
                currently have restricted
                transfer access.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[20px] bg-[#f3f7f8] px-5 py-5 font-bold text-[#52666e]">
            <ShieldCheck size={25} />
            No transfer accounts
            available.
          </div>
        )}

        {/* Account status */}

        <section className="bank-card rounded-[24px] p-6">
          <h2 className="text-[23px] font-bold text-[#173743]">
            Account access
          </h2>

          <p className="mt-2 text-sm text-[#718087]">
            Current status of your
            banking accounts.
          </p>

          <div className="mt-6 space-y-3">
            {user.accounts.map(
              (account) => {
                const available =
                  account.status ===
                  "ACTIVE" &&
                  account.transferPermission ===
                  "ENABLED";

                return (
                  <div
                    key={account.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#dfe7ea] p-4"
                  >
                    <div>
                      <p className="font-bold text-[#173743]">
                        {account.type ===
                          "CHECKING"
                          ? "Checking"
                          : "Savings"}
                      </p>

                      <p className="mt-1 text-sm text-[#718087]">
                        ••••{" "}
                        {account.accountNumber.slice(
                          -4
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                          }`}
                      >
                        {available && (
                          <CheckCircle2
                            size={14}
                          />
                        )}

                        {account.status !==
                          "ACTIVE"
                          ? account.status
                          : account.transferPermission ===
                            "ENABLED"
                            ? "ACTIVE"
                            : "TRANSFERS DISABLED"}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* Personal information */}

        <section className="bank-card rounded-[24px] p-6">
          <h2 className="text-[23px] font-bold text-[#173743]">
            Personal information
          </h2>

          <p className="mt-2 text-sm text-[#718087]">
            Your registered customer
            information.
          </p>

          <div className="mt-8 space-y-7">
            {fields.map(
              ([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#77848a]">
                    {label}
                  </p>

                  <p className="mt-2 break-words text-[18px] text-[#173743]">
                    {value}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Security */}

        <section className="bank-card rounded-[24px] p-6">
          <h2 className="text-[23px] font-bold text-[#173743]">
            Security
          </h2>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#173743]">
                Transaction PIN
              </p>

              <p className="mt-1 text-sm text-[#718087]">
                Used to authorize
                transfers.
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${user.requiresPinSetup
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
                }`}
            >
              {user.requiresPinSetup
                ? "SETUP REQUIRED"
                : "CONFIGURED"}
            </span>
          </div>
        </section>
      </div>
    </BankingPage>
  );
}