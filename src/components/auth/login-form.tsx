"use client";

import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { loginAction } from "@/server/actions/login";
import {
  loginTranslations,
  type LoginLanguage,
} from "@/app/(auth)/login/page";

interface LoginFormProps {
  language?: LoginLanguage;
}

export function LoginForm({ language = "en" }: LoginFormProps) {
  const { showLoader, hideLoader, navigateWithLoader } = useAppLoader();

  const t = loginTranslations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);
    showLoader();

    try {
      const result = await loginAction({
        email,
        password,
      });

      if (!result.success) {
        setError(result.error ?? t.error);
        hideLoader();
        setLoading(false);
        return;
      }

      // Keep the overlay visible until navigation finishes.
      navigateWithLoader(result.redirectTo ?? "/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong while signing in. Please try again.");
      hideLoader();
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-[15px] font-bold text-[#17242b]">
          {t.email}
        </label>
        <div className="relative">
          <UserRound size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#28363e]" />
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            placeholder={t.emailPlaceholder}
            className="h-[60px] w-full rounded-[12px] border border-[#cbd3d7] bg-white pl-13 pr-4 text-[15px] outline-none transition placeholder:text-[#a2acb0] focus:border-[#00799a] focus:ring-2 focus:ring-[#00799a]/10 disabled:opacity-60"
            style={{ paddingLeft: "52px" }}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-[15px] font-bold text-[#17242b]">
            {t.password}
          </label>
          <span className="text-xs font-semibold text-[#00799a]">
            {t.forgotPassword}
          </span>
        </div>

        <div className="relative">
          <LockKeyhole size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#28363e]" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
            placeholder={t.passwordPlaceholder}
            className="h-[60px] w-full rounded-[12px] border border-[#cbd3d7] bg-white pr-14 text-[15px] outline-none transition placeholder:text-[#a2acb0] focus:border-[#00799a] focus:ring-2 focus:ring-[#00799a]/10 disabled:opacity-60"
            style={{ paddingLeft: "52px" }}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#273740] hover:bg-[#f0f5f7]"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          disabled={loading}
          className="h-5 w-5 accent-[#00799a]"
        />
        <span className="text-[15px] font-medium text-[#263a44]">
          {t.rememberMe}
        </span>
      </label>

      {error && (
        <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-[60px] w-full items-center justify-center rounded-[12px] bg-[#0079a7] text-[17px] font-bold text-white transition hover:bg-[#00648b] disabled:opacity-60"
      >
        {loading ? t.signingIn : t.signIn}
      </button>

      <p className="text-center text-sm text-[#66777e]">
        {t.noAccount}{" "}
        <Link href="/register" className="font-bold text-[#00799a] hover:underline">
          {t.createAccount}
        </Link>
      </p>
    </form>
  );
}