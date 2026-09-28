"use client";

import {
  CircleHelp,
  CreditCard,
  Gauge,
  ReceiptText,
  SendHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { useAppLoader } from "@/components/feedback/loading-provider";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "At a glance",
    href: "/",
    icon: Gauge,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: SendHorizontal,
  },
  {
    label: "My card",
    href: "/cards",
    icon: CreditCard,
  },
  {
    label: "Help",
    href: "/help",
    icon: CircleHelp,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { navigateWithLoader } = useAppLoader();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 safe-bottom">
      <nav
        className="
          mx-auto flex
          w-full max-w-[720px]
          items-center justify-between
          rounded-[30px]
          border border-[#dce4e8]
          bg-white/95
          p-1.5
          shadow-[0_8px_30px_rgba(18,45,55,0.13)]
          backdrop-blur-xl
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                if (!active) {
                  navigateWithLoader(item.href);
                }
              }}
              className={cn(
                `
                  flex min-w-0 flex-1
                  flex-col items-center
                  justify-center gap-1
                  rounded-[24px]
                  px-1 py-2
                  text-[#3d535c]
                  transition-colors
                `,
                active &&
                  "bg-[#e7f0f4] text-[#123743]"
              )}
            >
              <Icon size={22} strokeWidth={2} />

              <span
                className={cn(
                  "whitespace-nowrap text-[10px] sm:text-xs",
                  active && "font-bold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}