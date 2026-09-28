"use client";

import {
  LogOut,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminHeaderProps {
  unreadCount?: number;
}

export function AdminHeader({
  unreadCount = 0,
}: AdminHeaderProps) {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function openMessages() {
    router.push("/admin/messages");
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    await signOut({
      redirect: false,
    });

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="border-b border-[#dfe8eb] bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#006b7d]">
              <ShieldCheck size={20} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="font-bold text-[#173743]">
                Northstar
              </p>

              <p className="text-xs text-[#718087]">
                Administration
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openMessages}
              aria-label={
                unreadCount > 0
                  ? `Customer care. ${unreadCount} unread messages.`
                  : "Customer care messages"
              }
              title="Messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743] transition hover:bg-[#dfecef]"
            >
              <MessageCircle size={19} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#e04f5f] px-1 text-[9px] font-bold leading-none text-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="flex h-10 items-center gap-2 rounded-full bg-[#edf5f7] px-3 text-sm font-bold text-[#173743] transition hover:bg-[#dfecef] sm:px-4"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {showLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[390px] rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#173743]">
                  Log out?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#718087]">
                  Are you sure you want to log out of the admin dashboard?
                </p>
              </div>

              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogout(false)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogout(false)}
                className="rounded-[14px] border border-[#dce5e8] px-4 py-3 text-sm font-bold text-[#173743] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-[14px] bg-[#003b4d] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                <LogOut size={16} />

                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}