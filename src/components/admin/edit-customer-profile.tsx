"use client";

import { FormEvent, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { updateAdminProfileAction } from "@/server/actions/update-admin-profile";

interface EditCustomerProfileProps {
  userId: string;

  profile: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
  };
}

export function EditCustomerProfile({
  userId,
  profile,
}: EditCustomerProfileProps) {
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

  const [form, setForm] = useState({
    firstName: profile.firstName,
    middleName:
      profile.middleName ?? "",
    lastName: profile.lastName,
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",
    postalCode:
      profile.postalCode ?? "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function cancelEditing() {
    setForm({
      firstName: profile.firstName,
      middleName:
        profile.middleName ?? "",
      lastName: profile.lastName,
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      country: profile.country ?? "",
      postalCode:
        profile.postalCode ?? "",
    });

    setError(null);
    setEditing(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (processing) return;

    if (
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      setError(
        "First and last name are required."
      );
      return;
    }

    setProcessing(true);
    setError(null);
    showLoader();

    try {
      const result =
        await updateAdminProfileAction({
          userId,
          ...form,
        });

      hideLoader();

      if (!result.success) {
        setError(
          result.error ??
            "Unable to update profile."
        );

        setProcessing(false);
        return;
      }

      setEditing(false);
      setProcessing(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      hideLoader();
      setProcessing(false);

      setError(
        "Unable to update profile."
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
        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white px-5 text-sm font-bold text-[#173743] transition hover:bg-[#f4f7f8]"
      >
        <Pencil size={16} />
        Edit information
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-[20px] border border-[#dfe7ea] bg-[#f8fafb] p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(value) =>
            updateField(
              "firstName",
              value
            )
          }
        />

        <Field
          label="Middle name"
          value={form.middleName}
          onChange={(value) =>
            updateField(
              "middleName",
              value
            )
          }
        />

        <Field
          label="Last name"
          value={form.lastName}
          onChange={(value) =>
            updateField(
              "lastName",
              value
            )
          }
        />

        <Field
          label="Phone"
          value={form.phone}
          onChange={(value) =>
            updateField("phone", value)
          }
        />

        <Field
          label="Address"
          value={form.address}
          onChange={(value) =>
            updateField(
              "address",
              value
            )
          }
        />

        <Field
          label="City"
          value={form.city}
          onChange={(value) =>
            updateField("city", value)
          }
        />

        <Field
          label="State / Province"
          value={form.state}
          onChange={(value) =>
            updateField("state", value)
          }
        />

        <Field
          label="Country"
          value={form.country}
          onChange={(value) =>
            updateField(
              "country",
              value
            )
          }
        />

        <Field
          label="Postal code"
          value={form.postalCode}
          onChange={(value) =>
            updateField(
              "postalCode",
              value
            )
          }
        />
      </div>

      {error && (
        <div className="mt-4 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={processing}
          className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full bg-[#003b4d] px-6 text-sm font-bold text-white transition hover:bg-[#002f3e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />

          {processing
            ? "Saving..."
            : "Save changes"}
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={cancelEditing}
          className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border border-[#d6dfe3] bg-white px-6 text-sm font-bold text-[#173743] transition hover:bg-[#f4f7f8] disabled:opacity-50"
        >
          <X size={17} />
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#173743]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[48px] w-full rounded-[15px] border border-[#d6dfe3] bg-white px-4 text-sm text-[#173743] outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10"
      />
    </label>
  );
}