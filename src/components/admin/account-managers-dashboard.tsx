"use client";

import {
    BriefcaseBusiness,
    CheckCircle2,
    Loader2,
    Plus,
    UserCheck,
    UserPlus,
    Users,
    UserX,
    X,
} from "lucide-react";
import {
    useMemo,
    useState,
    useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { assignAccountManager } from "@/server/actions/assign-account-manager";
import { promoteAccountManager } from "@/server/actions/promote-account-manager";

type Manager = {
    id: string;
    email: string;
    status: string;
    createdAt: Date;
    profile: {
        firstName: string;
        lastName: string;
    } | null;
    _count: {
        managedCustomers: number;
    };
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
    }[];
};

type EligibleUser = {
    id: string;
    email: string;
    customerId: string;
    profile: {
        firstName: string;
        lastName: string;
    } | null;
};

interface AccountManagersDashboardProps {
    managers: Manager[];
    unassignedCustomers: Customer[];
    eligibleUsers: EligibleUser[];

    stats: {
        managers: number;
        assignedCustomers: number;
        unassignedCustomers: number;
        totalCustomers: number;
    };
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

export function AccountManagersDashboard({
    managers,
    unassignedCustomers,
    eligibleUsers,
    stats,
}: AccountManagersDashboardProps) {
    const router = useRouter();

    const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);
    const [selectedManagers, setSelectedManagers] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [showPromotion, setShowPromotion] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [promoting, setPromoting] = useState(false);

    const [isPending, startTransition] = useTransition();

    const activeManagers = useMemo(
        () =>
            managers.filter(
                (manager) =>
                    manager.status === "ACTIVE"
            ),
        [managers]
    );

    function handleAssignment(
        customerId: string
    ) {
        const managerId =
            selectedManagers[customerId];

        if (!managerId) {
            setError(
                "Select an account manager first."
            );
            setMessage(null);
            return;
        }

        setError(null);
        setMessage(null);
        setPendingCustomerId(customerId);

        startTransition(async () => {
            const result =
                await assignAccountManager(
                    customerId,
                    managerId
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Unable to assign account manager."
                );
                setPendingCustomerId(null);
                return;
            }

            setMessage(
                "Account manager assigned successfully."
            );

            setPendingCustomerId(null);
            router.refresh();
        });
    }

    function handlePromotion() {
        if (!selectedUserId) {
            setError(
                "Select a user to promote."
            );
            setMessage(null);
            return;
        }

        setError(null);
        setMessage(null);
        setPromoting(true);

        startTransition(async () => {
            const result =
                await promoteAccountManager(
                    selectedUserId
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Unable to promote user."
                );
                setPromoting(false);
                return;
            }

            setSelectedUserId("");
            setShowPromotion(false);
            setPromoting(false);

            setMessage(
                "User promoted to account manager successfully."
            );

            router.refresh();
        });
    }

    return (
        <div className="space-y-8">
            <section>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-950">
                            Account Managers
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage account managers, customer assignments and workloads.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowPromotion(true);
                            setError(null);
                            setMessage(null);
                        }}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add account manager
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Account managers"
                        value={stats.managers}
                        icon={BriefcaseBusiness}
                    />

                    <StatCard
                        title="Assigned customers"
                        value={stats.assignedCustomers}
                        icon={UserCheck}
                    />

                    <StatCard
                        title="Unassigned customers"
                        value={stats.unassignedCustomers}
                        icon={UserX}
                    />

                    <StatCard
                        title="Total customers"
                        value={stats.totalCustomers}
                        icon={Users}
                    />
                </div>
            </section>

            {message && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <h2 className="font-semibold text-slate-950">
                        Account managers
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Administrators who can manage assigned customers.
                    </p>
                </div>

                {managers.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No account managers have been created yet.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {managers.map((manager) => {
                            const name =
                                getName(
                                    manager.profile,
                                    manager.email
                                );

                            return (
                                <div
                                    key={manager.id}
                                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-slate-950">
                                                {name}
                                            </p>

                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${manager.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                                {manager.status}
                                            </span>
                                        </div>

                                        <p className="mt-1 truncate text-sm text-slate-500">
                                            {manager.email}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:text-right">
                                            <p className="text-xl font-bold text-slate-950">
                                                {manager._count.managedCustomers}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {manager._count.managedCustomers === 1
                                                    ? "customer"
                                                    : "customers"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/account-managers/${manager.id}`
                                                )
                                            }
                                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            View customers
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <h2 className="font-semibold text-slate-950">
                        Unassigned customers
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Assign these customers to an active account manager.
                    </p>
                </div>

                {unassignedCustomers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />

                        <p className="mt-3 font-medium text-slate-900">
                            Everyone is assigned
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            There are currently no unassigned customers.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {unassignedCustomers.map(
                            (customer) => {
                                const name =
                                    getName(
                                        customer.profile,
                                        customer.email
                                    );

                                const selectedManager =
                                    selectedManagers[
                                        customer.id
                                    ] ?? "";

                                const assigning =
                                    isPending &&
                                    pendingCustomerId ===
                                        customer.id;

                                return (
                                    <div
                                        key={
                                            customer.id
                                        }
                                        className="px-5 py-5 sm:px-6"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-950">
                                                    {
                                                        name
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {
                                                        customer.email
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Customer ID:{" "}
                                                    {
                                                        customer.customerId
                                                    }
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <select
                                                    value={
                                                        selectedManager
                                                    }
                                                    disabled={
                                                        assigning
                                                    }
                                                    onChange={(
                                                        event
                                                    ) => {
                                                        setSelectedManagers(
                                                            (
                                                                current
                                                            ) => ({
                                                                ...current,
                                                                [customer.id]:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            })
                                                        );

                                                        setError(
                                                            null
                                                        );
                                                    }}
                                                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                                                >
                                                    <option value="">
                                                        Select manager
                                                    </option>

                                                    {activeManagers.map(
                                                        (
                                                            manager
                                                        ) => (
                                                            <option
                                                                key={
                                                                    manager.id
                                                                }
                                                                value={
                                                                    manager.id
                                                                }
                                                            >
                                                                {getName(
                                                                    manager.profile,
                                                                    manager.email
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        assigning ||
                                                        !selectedManager
                                                    }
                                                    onClick={() =>
                                                        handleAssignment(
                                                            customer.id
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {assigning ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Assigning
                                                        </>
                                                    ) : (
                                                        "Assign"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
            </section>

            {showPromotion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <UserPlus className="h-5 w-5" />
                                </div>

                                <h2 className="mt-4 text-xl font-bold text-slate-950">
                                    Add account manager
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Select an active customer to promote to an account manager.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={promoting}
                                onClick={() =>
                                    setShowPromotion(
                                        false
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="manager-user"
                                className="text-sm font-semibold text-slate-700"
                            >
                                User
                            </label>

                            <select
                                id="manager-user"
                                value={selectedUserId}
                                disabled={promoting}
                                onChange={(event) => {
                                    setSelectedUserId(
                                        event.target
                                            .value
                                    );
                                    setError(null);
                                }}
                                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                            >
                                <option value="">
                                    Select a user
                                </option>

                                {eligibleUsers.map(
                                    (user) => (
                                        <option
                                            key={
                                                user.id
                                            }
                                            value={
                                                user.id
                                            }
                                        >
                                            {getName(
                                                user.profile,
                                                user.email
                                            )}{" "}
                                            —{" "}
                                            {
                                                user.email
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {eligibleUsers.length ===
                                0 && (
                                <p className="mt-3 text-sm text-slate-500">
                                    There are no eligible active users available for promotion.
                                </p>
                            )}
                        </div>

                        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                            Promoting this user gives them access to the administration area as an account manager. They will only be able to manage customers assigned to them.
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={promoting}
                                onClick={() =>
                                    setShowPromotion(
                                        false
                                    )
                                }
                                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    promoting ||
                                    !selectedUserId
                                }
                                onClick={
                                    handlePromotion
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {promoting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Promoting
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Promote
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}