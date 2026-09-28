"use client";

import {
  Headphones,
  MessageCircle,
} from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

interface SupportFloatingButtonProps {
  unreadCount?: number;
}

export function SupportFloatingButton({
  unreadCount = 0,
}: SupportFloatingButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/messages")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/messages")}
      aria-label={
        unreadCount > 0
          ? `Open customer care. ${unreadCount} unread messages.`
          : "Open customer care"
      }
      title="Customer care"
      className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#006b7d] text-white shadow-[0_10px_30px_rgba(0,59,77,0.25)] transition duration-200 hover:-translate-y-1 hover:bg-[#00596a] active:translate-y-0 sm:bottom-24 sm:right-7"
    >
      <MessageCircle size={25} />

      {unreadCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#e04f5f] px-1.5 text-[10px] font-bold text-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      ) : (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#ffb84d]">
          <Headphones
            size={10}
            className="text-[#173743]"
          />
        </span>
      )}
    </button>
  );
}