
"use client";

import { useState } from "react";
import { Bitcoin, CheckCircle2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { updateTransactionBtcAction } from "@/server/actions/update-transaction-btc";

interface TransactionBtcSettingsProps {
    transactionId: string;
    initialEnabled: boolean;
    initialAmount: string | null;
    initialProgress: number | null;
}

export function TransactionBtcSettings({
    transactionId,
    initialEnabled,
    initialAmount,
    initialProgress,
}: TransactionBtcSettingsProps) {
    const router = useRouter();
    const { showLoader, hideLoader } = useAppLoader();

    const [enabled, setEnabled] = useState(initialEnabled);
    const [amount, setAmount] = useState(initialAmount ?? "");
    const [progress, setProgress] = useState(initialProgress ?? 0);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);


    const [savedValues, setSavedValues] = useState({
        enabled: initialEnabled,
        amount: initialAmount ?? "",
        progress: initialProgress ?? 0,
    });


    const hasChanges =
        enabled !== savedValues.enabled ||
        (enabled &&
            (amount !== savedValues.amount ||
                progress !== savedValues.progress));

    async function handleSave() {
        if (processing || !hasChanges) return;

        setSavedValues({
            enabled,
            amount: enabled ? amount.trim() : "",
            progress: enabled ? progress : 0,
        });

        if (!enabled) {
            setAmount("");
            setProgress(0);
        }

        setSuccess(true);
        router.refresh();

        if (enabled) {
            const trimmedAmount = amount.trim();

            if (
                !/^\d+(\.\d{1,8})?$/.test(trimmedAmount) ||
                Number(trimmedAmount) <= 0
            ) {
                setError(
                    "Enter a valid BTC amount greater than zero, with up to 8 decimal places."
                );
                return;
            }

            if (
                !Number.isInteger(progress) ||
                progress < 0 ||
                progress > 100
            ) {
                setError("BTC progress must be between 0 and 100.");
                return;
            }
        }

        setProcessing(true);
        showLoader();

        try {
            const result = await updateTransactionBtcAction({
                transactionId,
                btcEnabled: enabled,
                btcAmount: enabled ? amount.trim() : "",
                btcProgressPercent: enabled ? progress : 0,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setSuccess(true);
            router.refresh();
        } catch (saveError) {
            console.error("BTC settings update failed:", saveError);
            setError("Unable to save BTC settings. Please try again.");
        } finally {
            hideLoader();
            setProcessing(false);
        }
    }

    return (
        <section className="rounded-[24px] border border-[#dfe7ea] bg-white p-6">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff4e4] text-[#b97716]">
                    <Bitcoin size={24} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-[#173743]">
                        Transaction BTC Settings
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#718087]">
                        Control simulated BTC information displayed to the customer
                        for this specific transaction.
                    </p>
                </div>
            </div>

            <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-[#e5ebed] bg-[#f8fbfc] p-4">
                <div>
                    <span className="block text-sm font-bold text-[#173743]">
                        Show BTC information
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#718087]">
                        When disabled, BTC details are hidden from the customer.
                    </span>
                </div>

                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => {
                        setEnabled(event.target.checked);
                        setError(null);
                        setSuccess(false);
                    }}
                    disabled={processing}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-[#003b4d]"
                />
            </label>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#173743]">
                        BTC amount
                    </span>

                    <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => {
                            setAmount(event.target.value);
                            setSuccess(false);
                        }}
                        disabled={!enabled || processing}
                        placeholder="0.02500000"
                        className="h-[52px] w-full rounded-[15px] border border-[#d6dfe3] bg-white px-4 text-sm text-[#173743] outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10 disabled:cursor-not-allowed disabled:bg-[#f3f7f8] disabled:text-[#9ba9ae]"
                    />

                    <span className="mt-2 block text-xs text-[#718087]">
                        Maximum 8 decimal places.
                    </span>
                </label>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="transaction-btc-progress"
                            className="text-sm font-semibold text-[#173743]"
                        >
                            BTC progress
                        </label>

                        <span className="text-sm font-bold text-[#173743]">
                            {progress}%
                        </span>
                    </div>

                    <input
                        id="transaction-btc-progress"
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={progress}
                        onChange={(event) => {
                            setProgress(Number(event.target.value));
                            setSuccess(false);
                        }}
                        disabled={!enabled || processing}
                        className="mt-4 w-full cursor-pointer accent-[#003b4d] disabled:cursor-not-allowed"
                    />

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ebed]">
                        <div
                            className="h-full rounded-full bg-[#d99a35] transition-[width] duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-[#718087]">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-[16px] border border-[#f1e0bd] bg-[#fffaf0] px-4 py-3">
                <p className="text-xs leading-5 text-[#8a672d]">
                    These are simulated BTC values for the banking demonstration.
                    They do not represent real cryptocurrency holdings or transfers
                    and do not affect the customer&apos;s account balance.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mt-5 flex items-center gap-2 rounded-[14px] border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                    <CheckCircle2 size={18} />
                    BTC settings saved successfully.
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={processing || !hasChanges}
                    className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#003b4d] px-7 text-sm font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save size={18} />
                    {processing ? "Saving..." : "Save BTC Settings"}
                </button>
            </div>
        </section>
    );
}
