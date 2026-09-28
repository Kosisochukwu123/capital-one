"use client";

import { Home, LogOut, Mail, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { logoutAction } from "@/server/actions/logout";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({
  title = "At a glance",
}: MobileHeaderProps) {
  const pathname = usePathname();

  const {
    showLoader,
    hideLoader,
    navigateWithLoader,
  } = useAppLoader();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function navigate(href: string) {
    if (pathname !== href) {
      navigateWithLoader(href);
    }
  }

  function openLogoutDialog() {
    setShowLogoutDialog(true);
  }

  function closeLogoutDialog() {
    if (loggingOut) return;

    setShowLogoutDialog(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setShowLogoutDialog(false);
    showLoader();

    try {
      const result = await logoutAction();

      if (!result.success) {
        hideLoader();
        setLoggingOut(false);
        return;
      }

      hideLoader();
      navigateWithLoader("/login");
    } catch (error) {
      console.error("Logout error:", error);

      hideLoader();
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/[0.03] bg-[#eef6fb]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] w-full max-w-[760px] items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-11 w-11 items-center justify-start text-[#173743]"
            aria-label="Home"
          >
            <Home size={27} strokeWidth={2.3} />
          </button>

          <p className="text-[18px] font-medium text-[#334c56]">
            {title}
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/help")}
              aria-label="Messages"
              className="text-[#173743]"
            >
              <Mail size={27} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              className="text-[#173743]"
            >
              <UserRound size={26} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={openLogoutDialog}
              disabled={loggingOut}
              aria-label="Log out"
              className="text-[#173743] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LogOut size={27} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-5 backdrop-blur-[2px]">
          <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-[390px] rounded-[26px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-[#003b4d]">
                <LogOut size={22} strokeWidth={2.2} />
              </div>

              <button
                type="button"
                onClick={closeLogoutDialog}
                aria-label="Close logout dialog"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#687a81] transition hover:bg-[#f1f5f6]"
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="logout-title" className="mt-5 text-[22px] font-bold text-[#173743]">
              Are you sure you want to log out?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#66777e]">
              You&apos;ll need to sign in again to access your account.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={closeLogoutDialog}
                className="h-[52px] flex-1 rounded-full border border-[#ccd8dc] bg-white font-bold text-[#173743] transition hover:bg-[#f4f8f9]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-[52px] flex-1 rounded-full bg-[#003b4d] font-bold text-white transition hover:bg-[#002f3d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}