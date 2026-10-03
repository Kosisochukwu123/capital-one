import {
    ArrowLeft,
    ChevronRight,
    CreditCard,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountManagerAssignment } from "@/components/admin/account-manager-assignment";
import { CreateTransactionForm } from "@/components/admin/create-transaction-form";
import { EditAccountDetails } from "@/components/admin/edit-account-details";
import { EditCustomerProfile } from "@/components/admin/edit-customer-profile";
import { PinResetControl } from "@/components/admin/pin-reset-control";
import { UserAccountControls } from "@/components/admin/user-account-controls";
import { formatCurrency } from "@/lib/utils";
import { requireCustomerAccess } from "@/server/auth/require-customer-access";
// import { requireAdmin } from "@/server/auth/require-admin";
import { getAccountManagers } from "@/server/queries/get-account-managers";
import { getAdminUserDetails } from "@/server/queries/get-admin-user-details";

import { DeleteCustomerControl } from "@/components/admin/delete-customer-control";

import { CustomerBtcControl } from "@/components/admin/customer-btc-control";

interface AdminUserPageProps {
    params: Promise<{
        id: string;
    }>;
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export default async function AdminUserPage({
    params,
}: AdminUserPageProps) {
    const { id } = await params;

    const { admin } = await requireCustomerAccess(id);

    const user = await getAdminUserDetails(id);

    if (!user) {
        notFound();
    }

    const managers =
        admin.role === "SUPER_ADMIN"
            ? await getAccountManagers()
            : [];

    const fullName = user.profile
        ? `${user.profile.firstName} ${user.profile.middleName
            ? `${user.profile.middleName} `
            : ""
        }${user.profile.lastName}`
        : user.email;

    return (
        <main className="min-h-screen bg-[#eef6fb] px-4 py-8">
            <div className="mx-auto w-full max-w-[1100px]">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 font-semibold text-[#006b7d]"
                >
                    <ArrowLeft size={18} />
                    Users
                </Link>

                {/* Customer heading */}

                <div className="mt-7 flex flex-wrap items-start justify-between gap-5">
                    <div>
                        <p className="text-sm font-semibold text-[#66808a]">
                            Customer
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-[#173743]">
                            {fullName}
                        </h1>

                        <p className="mt-2 text-[#66777e]">
                            {user.email}
                        </p>
                    </div>

                    <div className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#173743]">
                        {user.status}
                    </div>
                </div>

                {/* Account manager assignment - Super Admin only */}

                {admin.role === "SUPER_ADMIN" && (
                    <div className="mt-8">
                        <AccountManagerAssignment
                            customerId={user.id}
                            currentManagerId={user.accountManagerId}
                            managers={managers}
                        />
                    </div>
                )}

                {/* Personal information + security */}

                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    <section className="rounded-[24px] bg-white p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                                <UserRound size={21} />
                            </div>

                            <h2 className="text-xl font-bold text-[#173743]">
                                Personal information
                            </h2>
                        </div>

                        <div className="mt-6 space-y-4">
                            <Detail
                                label="Customer ID"
                                value={user.customerId ?? "—"}
                            />

                            <Detail
                                label="Phone"
                                value={user.profile?.phone ?? "—"}
                            />

                            <Detail
                                label="Date of birth"
                                value={
                                    user.profile?.dateOfBirth
                                        ? formatDate(
                                            user.profile.dateOfBirth
                                        )
                                        : "—"
                                }
                            />

                            <Detail
                                label="Address"
                                value={user.profile?.address ?? "—"}
                            />

                            <Detail
                                label="City"
                                value={user.profile?.city ?? "—"}
                            />

                            <Detail
                                label="State / Province"
                                value={user.profile?.state ?? "—"}
                            />

                            <Detail
                                label="Country"
                                value={user.profile?.country ?? "—"}
                            />

                            <Detail
                                label="Postal code"
                                value={
                                    user.profile?.postalCode ?? "—"
                                }
                            />

                            <Detail
                                label="Registered"
                                value={formatDate(user.createdAt)}
                            />

                            {user.profile && (
                                <div className="mt-6 border-t border-[#e5ebed] pt-5">
                                    <EditCustomerProfile
                                        userId={user.id}
                                        profile={user.profile}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-[24px] bg-white p-6">
                        <h2 className="text-xl font-bold text-[#173743]">
                            Security & access
                        </h2>

                        <div className="mt-6 space-y-4">
                            <Detail
                                label="User status"
                                value={user.status}
                            />

                            <Detail
                                label="Onboarding"
                                value={
                                    user.onboardingComplete
                                        ? "Completed"
                                        : "Not completed"
                                }
                            />

                            <Detail
                                label="Transaction PIN"
                                value={
                                    user.requiresPinSetup
                                        ? "Setup required"
                                        : "Configured"
                                }
                            />
                        </div>

                        <p className="mt-6 rounded-[18px] bg-[#f3f7f8] p-4 text-sm leading-6 text-[#66777e]">
                            Passwords and transaction PINs are never
                            displayed to administrators. Reset controls
                            only require the customer to create new
                            credentials.
                        </p>

                        <div className="mt-5">
                            <PinResetControl
                                userId={user.id}
                                requiresPinSetup={
                                    user.requiresPinSetup
                                }
                            />
                        </div>
                    </section>
                </div>

                {/* Accounts */}

                <section className="mt-5 rounded-[24px] bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                            <CreditCard size={21} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#173743]">
                                Accounts
                            </h2>

                            <p className="mt-1 text-sm text-[#718087]">
                                Checking and savings accounts belonging
                                to this user.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {user.accounts.map((account) => (
                            <div
                                key={account.id}
                                className="rounded-[20px] border border-[#dfe7ea] p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
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

                                    <span className="rounded-full bg-[#edf5f7] px-3 py-1 text-xs font-bold text-[#45616b]">
                                        {account.status}
                                    </span>
                                </div>

                                <p className="mt-6 text-sm text-[#718087]">
                                    Balance
                                </p>

                                <p className="mt-1 text-2xl font-bold text-[#173743]">
                                    {formatCurrency(
                                        account.balance
                                    )}
                                </p>

                                <div className="mt-5 space-y-3 border-t border-[#e5ebed] pt-4">
                                    <Detail
                                        label="Account number"
                                        value={
                                            account.accountNumber
                                        }
                                    />

                                    <Detail
                                        label="Opened"
                                        value={formatDate(
                                            account.openedAt
                                        )}
                                    />

                                    <Detail
                                        label="Transfers"
                                        value={
                                            account.transferPermission
                                        }
                                    />

                                    <div className="pt-2">
                                        <EditAccountDetails
                                            userId={user.id}
                                            accountId={
                                                account.id
                                            }
                                            openedAt={
                                                account.openedAt
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* User and account controls */}

                <div className="mt-5">
                    <UserAccountControls
                        userId={user.id}
                        userStatus={user.status}
                        accounts={user.accounts}
                    />
                </div>

                <div className="mt-5">
                    <CustomerBtcControl
                        customerId={user.id}
                        initialBtcBalance={user.btcBalance}
                        initialBtcProgressPercent={user.btcProgressPercent}
                    />
                </div>

                {/* Manual account adjustment */}

                <section className="mt-5 rounded-[24px] bg-white p-6">
                    <div>
                        <p className="text-sm font-semibold text-[#66808a]">
                            Account adjustment
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[#173743]">
                            Add transaction
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#718087]">
                            Create a credit or debit. The selected
                            account balance and transaction history
                            will be updated together.
                        </p>
                    </div>

                    <div className="mt-7">
                        <CreateTransactionForm
                            userId={user.id}
                            accounts={user.accounts.map(
                                (account) => ({
                                    id: account.id,
                                    type: account.type,
                                    accountNumber:
                                        account.accountNumber,
                                    balance: account.balance,
                                })
                            )}
                        />
                    </div>
                </section>

                {/* Transactions */}

                <section className="mt-5 overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between gap-4 border-b border-[#e5ebed] px-6 py-5">
                        <div>
                            <h2 className="text-xl font-bold text-[#173743]">
                                Transactions
                            </h2>

                            <p className="mt-1 text-sm text-[#718087]">
                                Latest activity for this customer.
                            </p>
                        </div>
                    </div>

                    {user.transactions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-[#718087]">
                            This user has no transactions yet.
                        </div>
                    ) : (
                        <div>
                            {user.transactions.map(
                                (transaction) => (
                                    <Link
                                        key={transaction.id}
                                        href={`/admin/transactions/${transaction.id}`}
                                        className="flex items-center justify-between gap-5 border-b border-[#edf1f2] px-6 py-5 transition hover:bg-[#f7fafb] last:border-b-0"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-bold text-[#173743]">
                                                    {
                                                        transaction.title
                                                    }
                                                </p>

                                                <TransactionStatusBadge
                                                    status={
                                                        transaction.status
                                                    }
                                                />
                                            </div>

                                            <p className="mt-1 text-sm text-[#718087]">
                                                {
                                                    transaction.reference
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-[#718087]">
                                                {formatDate(
                                                    transaction.transactionDate
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-4">
                                            <p
                                                className={`font-bold ${transaction.type ===
                                                    "CREDIT"
                                                    ? "text-[#159873]"
                                                    : "text-[#173743]"
                                                    }`}
                                            >
                                                {transaction.type ===
                                                    "CREDIT"
                                                    ? "+"
                                                    : "-"}
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </p>

                                            <ChevronRight
                                                size={20}
                                                className="text-[#718087]"
                                            />
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </section>


                {admin.role === "SUPER_ADMIN" && (
                    <div className="mt-5">
                        <DeleteCustomerControl
                            customerId={user.id}
                            customerName={fullName}
                            customerEmail={user.email}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-5">
            <span className="text-sm text-[#718087]">
                {label}
            </span>

            <strong className="max-w-[65%] break-words text-right text-sm text-[#173743]">
                {value}
            </strong>
        </div>
    );
}

function TransactionStatusBadge({
    status,
}: {
    status: string;
}) {
    const styles =
        status === "COMPLETED"
            ? "bg-emerald-50 text-emerald-700"
            : status === "FAILED"
                ? "bg-red-50 text-red-700"
                : status === "PENDING"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-700";

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles}`}
        >
            {status}
        </span>
    );
}