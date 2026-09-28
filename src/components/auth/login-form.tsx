"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { loginAction } from "@/server/actions/login";

export function LoginForm() {
  const {
    showLoader,
    hideLoader,
    navigateWithLoader,
  } = useAppLoader();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    // Show the existing full-screen app loader.
    showLoader();

    try {
      const result = await loginAction({
        email,
        password,
      });

      if (!result.success) {
        setError(
          result.error ??
            "Incorrect email address or password."
        );

        hideLoader();
        setLoading(false);

        return;
      }

      /*
       * Authentication succeeded.
       *
       * Remove the authentication loader first,
       * then use our existing navigation loader.
       */
      hideLoader();

     navigateWithLoader(result.redirectTo ?? "/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while signing in. Please try again."
      );

      hideLoader();
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bank-card rounded-[26px] p-6 sm:p-8"
    >
      {/* Email */}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          required
          disabled={loading}
          placeholder="Enter your email"
          className="h-[56px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 outline-none transition placeholder:text-[#9aa7ac] focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      {/* Password */}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-semibold"
          >
            Password
          </label>

          <button
            type="button"
            className="text-sm font-semibold text-[#006b7d] transition hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
            disabled={loading}
            placeholder="Enter your password"
            className="h-[56px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 pr-14 outline-none transition placeholder:text-[#9aa7ac] focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10 disabled:cursor-not-allowed disabled:opacity-70"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#66777e] transition hover:bg-[#eef6f8] hover:text-[#003b4d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff
                size={21}
                strokeWidth={2}
              />
            ) : (
              <Eye
                size={21}
                strokeWidth={2}
              />
            )}
          </button>
        </div>
      </div>

      {/* Login error */}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Sign in */}

      <button
        type="submit"
        disabled={loading}
        className="mt-7 flex h-[58px] w-full items-center justify-center rounded-full bg-[#003b4d] font-bold text-white transition hover:bg-[#002f3d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Registration link */}

      <p className="mt-7 text-center text-sm text-[#66777e]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#006b7d] transition hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}