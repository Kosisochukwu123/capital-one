"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  CalendarDays,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { updateAdminAccountDetailsAction } from "@/server/actions/update-admin-account-details";

interface EditAccountDetailsProps {
  userId: string;
  accountId: string;
  openedAt: Date;
}

function toDateInputValue(
  date: Date
) {
  const value = new Date(date);

  const year =
    value.getFullYear();

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function EditAccountDetails({
  userId,
  accountId,
  openedAt,
}: EditAccountDetailsProps) {
  const router = useRouter();

  const {
    showLoader,
    hideLoader,
  } = useAppLoader();

  const [editing, setEditing] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [openingDate, setOpeningDate] =
    useState(
      toDateInputValue(openedAt)
    );

  function cancelEditing() {
    setOpeningDate(
      toDateInputValue(openedAt)
    );

    setError(null);
    setEditing(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (processing) {
      return;
    }

    if (!openingDate) {
      setError(
        "Select an opening date."
      );
      return;
    }

    setProcessing(true);
    setError(null);
    showLoader();

    try {
      const result =
        await updateAdminAccountDetailsAction({
          userId,
          accountId,
          openedAt: openingDate,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update account."
        );

        setProcessing(false);
        return;
      }

      setProcessing(false);
      setEditing(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Account details update error:",
        error
      );

      hideLoader();
      setProcessing(false);

      setError(
        "Unable to update account."
      );
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() =>
          setEditing(true)
        }
        className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white px-4 text-xs font-bold text-[#173743] transition hover:bg-[#f4f7f8]"
      >
        <Pencil size={14} />
        Edit account
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-[16px] bg-[#f5f8f9] p-4"
    >
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#173743]">
          <CalendarDays size={16} />
          Account opening date
        </span>

        <input
          type="date"
          value={openingDate}
          onChange={(event) =>
            setOpeningDate(
              event.target.value
            )
          }
          disabled={processing}
          className="h-[48px] w-full rounded-[14px] border border-[#d6dfe3] bg-white px-4 text-sm text-[#173743] outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10"
        />
      </label>

      {error && (
        <div className="mt-4 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={processing}
          className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[#003b4d] px-5 text-sm font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={15} />

          {processing
            ? "Saving..."
            : "Save"}
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={cancelEditing}
          className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white px-5 text-sm font-bold text-[#173743] transition hover:bg-[#f4f7f8] disabled:opacity-50"
        >
          <X size={15} />
          Cancel
        </button>
      </div>
    </form>
  );
}