"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { registerAction } from "@/server/actions/register";

export function RegisterForm() {
  const router = useRouter();

  const [serverError, setServerError] =
    useState<string | null>(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      country: "",
      state: "",
      city: "",
      address: "",
      postalCode: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  async function onSubmit(
    values: RegisterInput
  ) {
    setServerError(null);

    const result =
      await registerAction(values);

    if (!result.success) {
      setServerError(
        result.error ??
          "Unable to create account."
      );
      return;
    }

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bank-card rounded-[26px] p-5 sm:p-8"
    >
      <SectionTitle>
        Personal information
      </SectionTitle>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input
          label="First name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          label="Middle name"
          error={errors.middleName?.message}
          {...register("middleName")}
        />

        <Input
          label="Last name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <Input
          label="Date of birth"
          type="date"
          error={
            errors.dateOfBirth?.message
          }
          {...register("dateOfBirth")}
        />

        <Input
          label="Phone number"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Country"
          error={errors.country?.message}
          {...register("country")}
        />

        <Input
          label="State / Province"
          error={errors.state?.message}
          {...register("state")}
        />

        <Input
          label="City"
          error={errors.city?.message}
          {...register("city")}
        />

        <div className="sm:col-span-2">
          <Input
            label="Address"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Input
          label="Postal code"
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>

      <div className="my-8 h-px bg-[#e2e8eb]" />

      <SectionTitle>
        Login information
      </SectionTitle>

      <div className="mt-5 space-y-5">
        <Input
          label="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          label="Password"
          visible={showPassword}
          onToggle={() =>
            setShowPassword(
              (current) => !current
            )
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm password"
          visible={showConfirmPassword}
          onToggle={() =>
            setShowConfirmPassword(
              (current) => !current
            )
          }
          error={
            errors.confirmPassword?.message
          }
          {...register(
            "confirmPassword"
          )}
        />
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          {...register("acceptedTerms")}
          className="mt-1 h-4 w-4"
        />

        <span className="text-sm leading-6 text-[#5f7077]">
          I agree to the terms and condition and privacy policy.
        </span>
      </label>

      {errors.acceptedTerms && (
        <p className="mt-2 text-sm text-red-600">
          {errors.acceptedTerms.message}
        </p>
      )}

      {serverError && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 h-[58px] w-full rounded-full bg-[#003b4d] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Creating account..."
          : "Create account"}
      </button>

      <p className="mt-7 text-center text-sm text-[#66777e]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#006b7d]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-xl font-bold">
      {children}
    </h2>
  );
}

type InputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  };

function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        {...props}
        className="h-[54px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}

type PasswordInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    visible: boolean;
    onToggle: () => void;
  };

function PasswordInput({
  label,
  error,
  visible,
  onToggle,
  ...props
}: PasswordInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <div className="relative">
        <input
          {...props}
          type={
            visible ? "text" : "password"
          }
          className="h-[54px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 pr-12 outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#66777e]"
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}