"use client";

import {
    ArrowLeft,
    ExternalLink,
    Loader2,
    Mail,
    RefreshCw,
    UserMinus,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    useState,
    useTransition,
} from "react";

import { assignAccountManager } from "@/server/actions/assign-account-manager";

type OtherManager = {
    id: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
    } | null;
};

type Customer = {
    id: string;
    email: string;
    customerId: string;
    status: string;
    createdAt: Date;

    profile: {
        firstName: string;
        lastName: string;
    } | null;

    accounts: {
        id: string;
        type: string;
        accountNumber: string;
        status: string;
    }[];
};

type Manager = {
    id: string;
    email: string;
    status: string;
    createdAt: Date;

    profile: {
        firstName: string;
        lastName: string;
        phone: string;
    } | null;

    managedCustomers: Customer[];
};

interface AccountManagerDetailsProps {
    manager: Manager;
    otherManagers: OtherManager[];
}

function getName(
    profile: {
        firstName: string;
        lastName: string;
    } | null,
    fallback: string
) {
    if (!profile) {
        return fallback;
    }

    return `${profile.firstName} ${profile.lastName}`.trim();
}

export function AccountManagerDetails({
    manager,
    otherManagers,
}: AccountManagerDetailsProps) {
    const router = useRouter();

    const [selectedManagers, setSelectedManagers] =
        useState<Record<string, string>>({});

    const [pendingCustomerId, setPendingCustomerId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    const managerName = getName(
        manager.profile,
        manager.email
    );

    function reassignCustomer(
        customerId: string
    ) {
        const newManagerId =
            selectedManagers[customerId];

        if (!newManagerId) {
            setError(
                "Select another account manager first."
            );
            setSuccess(null);
            return;
        }

        setPendingCustomerId(customerId);
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result =
                await assignAccountManager(
                    customerId,
                    newManagerId
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Unable to reassign customer."
                );

                setPendingCustomerId(null);
                return;
            }

            setSuccess(
                "Customer reassigned successfully."
            );

            setPendingCustomerId(null);
            router.refresh();
        });
    }

    function removeCustomer(
        customerId: string
    ) {
        const confirmed = window.confirm(
            "Remove this customer's account manager? The customer will become unassigned."
        );

        if (!confirmed) {
            return;
        }

        setPendingCustomerId(customerId);
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result =
                await assignAccountManager(
                    customerId,
                    null
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Unable to remove account manager."
                );

                setPendingCustomerId(null);
                return;
            }

            setSuccess(
                "Customer is now unassigned."
            );

            setPendingCustomerId(null);
            router.refresh();
        });
    }

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() =>
                    router.push(
                        "/admin/account-managers"
                    )
                }
                className="inline-flex items-center gap-2 text-sm font-bold text-[#006b7d] transition hover:opacity-70"
            >
                <ArrowLeft size={17} />
                Account managers
            </button>

            <section className="rounded-[24px] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-[#173743]">
                                {managerName}
                            </h1>

                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${manager.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                {manager.status}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-[#718087]">
                            <Mail size={15} />
                            {manager.email}
                        </div>

                        {manager.profile?.phone && (
                            <p className="mt-2 text-sm text-[#718087]">
                                {manager.profile.phone}
                            </p>
                        )}
                    </div>

                    <div className="flex min-w-[150px] items-center gap-3 rounded-[18px] bg-[#edf5f7] px-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#006b7d]">
                            <Users size={19} />
                        </div>

                        <div>
                            <p className="text-xl font-bold text-[#173743]">
                                {manager.managedCustomers.length}
                            </p>

                            <p className="text-xs text-[#718087]">
                                {manager.managedCustomers.length === 1
                                    ? "Assigned customer"
                                    : "Assigned customers"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {error && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {success}
                </div>
            )}

            <section className="overflow-hidden rounded-[24px] bg-white shadow-sm">
                <div className="border-b border-[#e5edef] px-6 py-5">
                    <h2 className="text-xl font-bold text-[#173743]">
                        Assigned customers
                    </h2>

                    <p className="mt-1 text-sm text-[#718087]">
                        Customers currently managed by {managerName}.
                    </p>
                </div>

                {manager.managedCustomers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Users className="mx-auto h-9 w-9 text-[#9aabb1]" />

                        <p className="mt-4 font-bold text-[#173743]">
                            No assigned customers
                        </p>

                        <p className="mt-1 text-sm text-[#718087]">
                            This account manager does not currently manage any customers.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#e5edef]">
                        {manager.managedCustomers.map(
                            (customer) => {
                                const customerName =
                                    getName(
                                        customer.profile,
                                        customer.email
                                    );

                                const selectedManager =
                                    selectedManagers[
                                        customer.id
                                    ] ?? "";

                                const working =
                                    isPending &&
                                    pendingCustomerId ===
                                        customer.id;

                                return (
                                    <div
                                        key={customer.id}
                                        className="p-6"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-bold text-[#173743]">
                                                        {customerName}
                                                    </p>

                                                    <span className="rounded-full bg-[#edf5f7] px-2.5 py-1 text-[11px] font-bold text-[#52676f]">
                                                        {customer.status}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-[#718087]">
                                                    {customer.email}
                                                </p>

                                                <p className="mt-1 text-xs text-[#8a989e]">
                                                    Customer ID: {customer.customerId}
                                                </p>

                                                {customer.accounts.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {customer.accounts.map(
                                                            (account) => (
                                                                <span
                                                                    key={account.id}
                                                                    className="rounded-full bg-[#f3f7f8] px-3 py-1 text-xs font-medium text-[#52676f]"
                                                                >
                                                                    {account.type} •••• {account.accountNumber.slice(-4)}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/users/${customer.id}`
                                                    )
                                                }
                                                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#d8e2e6] px-4 text-sm font-bold text-[#173743] transition hover:bg-[#f4f8f9]"
                                            >
                                                View customer
                                                <ExternalLink size={15} />
                                            </button>
                                        </div>

                                        <div className="mt-5 flex flex-col gap-3 border-t border-[#edf1f2] pt-5 md:flex-row md:items-end">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold uppercase tracking-wide text-[#718087]">
                                                    Reassign customer
                                                </label>

                                                <select
                                                    value={selectedManager}
                                                    disabled={working}
                                                    onChange={(event) => {
                                                        setSelectedManagers(
                                                            (current) => ({
                                                                ...current,
                                                                [customer.id]:
                                                                    event.target.value,
                                                            })
                                                        );

                                                        setError(null);
                                                        setSuccess(null);
                                                    }}
                                                    className="mt-2 min-h-11 w-full rounded-[14px] border border-[#d8e2e6] bg-white px-4 text-sm text-[#173743] outline-none focus:border-[#006b7d]"
                                                >
                                                    <option value="">
                                                        Select another manager
                                                    </option>

                                                    {otherManagers.map(
                                                        (otherManager) => (
                                                            <option
                                                                key={otherManager.id}
                                                                value={otherManager.id}
                                                            >
                                                                {getName(
                                                                    otherManager.profile,
                                                                    otherManager.email
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={
                                                    working ||
                                                    !selectedManager
                                                }
                                                onClick={() =>
                                                    reassignCustomer(
                                                        customer.id
                                                    )
                                                }
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#006b7d] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {working ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <RefreshCw size={16} />
                                                )}

                                                Reassign
                                            </button>

                                            <button
                                                type="button"
                                                disabled={working}
                                                onClick={() =>
                                                    removeCustomer(
                                                        customer.id
                                                    )
                                                }
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <UserMinus size={16} />
                                                Unassign
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}