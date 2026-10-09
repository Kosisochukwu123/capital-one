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
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const navItems = [
  {
    key: "home",
    href: "/",
    icon: Gauge,
  },
  {
    key: "transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    key: "payments",
    href: "/payments",
    icon: SendHorizontal,
  },
  {
    key: "cards",
    href: "/cards",
    icon: CreditCard,
  },
  {
    key: "help",
    href: "/help",
    icon: CircleHelp,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { navigateWithLoader } = useAppLoader();

  // Read the globally selected language.
  const { language } = useLanguage();

  // Get the correct translations.
  const t = translations[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 safe-bottom">
      <nav className="mx-auto flex w-full max-w-[720px] items-center justify-between rounded-[30px] border border-[#dce4e8] bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(18,45,55,0.13)] backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const label =
            item.key === "home"
              ? t.navigation.home
              : item.key === "transactions"
                ? t.navigation.transactions
                : item.key === "payments"
                  ? t.navigation.payments
                  : item.key === "cards"
                    ? t.navigation.cards
                    : t.navigation.help;

          return (
            <button
              key={item.href}
              type="button"
              aria-label={label}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (!active) {
                  navigateWithLoader(item.href);
                }
              }}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[24px] px-1 py-2 text-[#3d535c] transition-colors",
                active && "bg-[#e7f0f4] text-[#123743]"
              )}
            >
              <Icon size={22} strokeWidth={2} />

              <span
                className={cn(
                  "whitespace-nowrap text-[10px] sm:text-xs",
                  active && "font-bold"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}