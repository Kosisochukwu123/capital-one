"use client";

import {
    AlertTriangle,
    Loader2,
    Trash2,
    X,
} from "lucide-react";
import {
    useState,
    useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { deleteCustomer } from "@/server/actions/delete-customer";

interface DeleteCustomerControlProps {
    customerId: string;
    customerName: string;
    customerEmail: string;
}

export function DeleteCustomerControl({
    customerId,
    customerName,
    customerEmail,
}: DeleteCustomerControlProps) {
    const router = useRouter();

    const [open, setOpen] =
        useState(false);

    const [confirmation, setConfirmation] =
        useState("");

    const [error, setError] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    function closeDialog() {
        if (isPending) {
            return;
        }

        setOpen(false);
        setConfirmation("");
        setError(null);
    }

    function handleDelete() {
        if (confirmation !== "DELETE") {
            setError(
                "Type DELETE to confirm."
            );
            return;
        }

        setError(null);

        startTransition(async () => {
            const result =
                await deleteCustomer(
                    customerId,
                    confirmation
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Unable to delete customer."
                );
                return;
            }

            router.push("/admin/users");
            router.refresh();
        });
    }

    return (
        <>
            <section className="rounded-[24px] border border-red-200 bg-white p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-red-600">
                            Danger zone
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[#173743]">
                            Delete customer
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718087]">
                            Permanently delete this customer and their associated banking data. This action cannot be undone.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(true)
                        }
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete customer
                    </button>
                </div>
            </section>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>

                            <button
                                type="button"
                                disabled={
                                    isPending
                                }
                                onClick={
                                    closeDialog
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-950">
                            Delete customer?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            You are about to permanently delete{" "}
                            <strong>
                                {customerName}
                            </strong>
                            .
                        </p>

                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">
                                {customerName}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {customerEmail}
                            </p>
                        </div>

                        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
                            This permanently removes the customer's profile, accounts and associated banking data. This action cannot be undone.
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="delete-confirmation"
                                className="text-sm font-semibold text-slate-700"
                            >
                                Type{" "}
                                <span className="font-bold text-red-600">
                                    DELETE
                                </span>{" "}
                                to confirm
                            </label>

                            <input
                                id="delete-confirmation"
                                type="text"
                                autoComplete="off"
                                value={
                                    confirmation
                                }
                                disabled={
                                    isPending
                                }
                                onChange={(
                                    event
                                ) => {
                                    setConfirmation(
                                        event.target
                                            .value
                                    );
                                    setError(null);
                                }}
                                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-red-400"
                                placeholder="DELETE"
                            />
                        </div>

                        {error && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={
                                    isPending
                                }
                                onClick={
                                    closeDialog
                                }
                                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    isPending ||
                                    confirmation !==
                                        "DELETE"
                                }
                                onClick={
                                    handleDelete
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}