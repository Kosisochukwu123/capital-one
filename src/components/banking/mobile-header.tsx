"use client";

import {
  Bell,
  Check,
  ChevronDown,
  Globe2,
  Home,
  LogOut,
  UserRound,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import {
  supportedLanguages,
  useLanguage,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { logoutAction } from "@/server/actions/logout";

interface MobileHeaderProps {
  title?: string;
  notificationUnreadCount?: number;
}

const headerTranslations = {
  en: {
    atAGlance: "At a glance",
    logoutTitle: "Are you sure you want to log out?",
    logoutDescription:
      "You'll need to sign in again to access your account.",
    loggingOut: "Logging out...",
    unread: "unread",
    selectLanguage: "Select language",
    closeLogout: "Close logout dialog",
  },
  fr: {
    atAGlance: "Vue d'ensemble",
    logoutTitle: "Voulez-vous vraiment vous déconnecter ?",
    logoutDescription:
      "Vous devrez vous reconnecter pour accéder à votre compte.",
    loggingOut: "Déconnexion...",
    unread: "non lues",
    selectLanguage: "Choisir la langue",
    closeLogout: "Fermer la fenêtre de déconnexion",
  },
  es: {
    atAGlance: "Vista general",
    logoutTitle: "¿Seguro que quieres cerrar sesión?",
    logoutDescription:
      "Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.",
    loggingOut: "Cerrando sesión...",
    unread: "sin leer",
    selectLanguage: "Seleccionar idioma",
    closeLogout: "Cerrar ventana de cierre de sesión",
  },
  de: {
    atAGlance: "Übersicht",
    logoutTitle: "Möchten Sie sich wirklich abmelden?",
    logoutDescription:
      "Sie müssen sich erneut anmelden, um auf Ihr Konto zuzugreifen.",
    loggingOut: "Abmeldung...",
    unread: "ungelesen",
    selectLanguage: "Sprache auswählen",
    closeLogout: "Abmeldedialog schließen",
  },
  pt: {
    atAGlance: "Visão geral",
    logoutTitle: "Tem certeza de que deseja sair?",
    logoutDescription:
      "Você precisará entrar novamente para acessar sua conta.",
    loggingOut: "Saindo...",
    unread: "não lidas",
    selectLanguage: "Selecionar idioma",
    closeLogout: "Fechar janela de saída",
  },
} as const;

export function MobileHeader({
  title = "At a glance",
  notificationUnreadCount = 0,
}: MobileHeaderProps) {
  const pathname = usePathname();

  const {
    showLoader,
    hideLoader,
    navigateWithLoader,
  } = useAppLoader();

  const { language, setLanguage } = useLanguage();

  const t = translations[language];
  const ht = headerTranslations[language];

  const [showLogoutDialog, setShowLogoutDialog] =
    useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);

  const languageMenuRef = useRef<HTMLDivElement>(null);

  const selectedLanguage =
    supportedLanguages.find((item) => item.code === language) ??
    supportedLanguages[0];

  // Translate the existing default title while preserving
  // custom titles passed by other pages.
  const displayTitle =
    title === "At a glance"
      ? ht.atAGlance
      : title === "Transactions"
        ? t.navigation.transactions
        : title === "Payments"
          ? t.navigation.payments
          : title === "My card" || title === "Cards"
            ? t.navigation.cards
            : title === "Help" || title === "Help & Support"
              ? t.navigation.help
              : title === "Profile"
                ? t.navigation.profile
                : title === "Notifications"
                  ? t.navigation.notifications
                  : title === "Messages"
                    ? t.navigation.messages
                    : title;

  useEffect(() => {
    if (!languageOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLanguageOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, [languageOpen]);

  function navigate(href: string) {
    if (pathname !== href) {
      navigateWithLoader(href);
    }
  }

  function openLogoutDialog() {
    setLanguageOpen(false);
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
        <div className="mx-auto flex h-[74px] w-full max-w-[760px] items-center justify-between gap-1 px-3 sm:gap-3 sm:px-5">
          {/* Home */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-10 w-9 shrink-0 items-center justify-center text-[#173743] sm:h-11 sm:w-11 sm:justify-start"
            aria-label={t.navigation.home}
          >
            <Home size={26} strokeWidth={2.3} />
          </button>

          {/* Page title */}
          <p className="min-w-0 flex-1 truncate px-1 text-center text-[15px] font-medium text-[#334c56] sm:px-3 sm:text-[18px]">
            {displayTitle}
          </p>

          {/* Header actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {/* Language selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                onClick={() =>
                  setLanguageOpen((current) => !current)
                }
                aria-label={ht.selectLanguage}
                aria-expanded={languageOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center justify-center gap-1 rounded-xl px-1 text-[#173743] transition hover:bg-white/70 sm:px-2"
              >
                <span className="text-[19px] leading-none">
                  {selectedLanguage.flag}
                </span>

                <ChevronDown
                  size={13}
                  className="hidden sm:block"
                />
              </button>

              {languageOpen && (
                <div
                  role="menu"
                  aria-label={ht.selectLanguage}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-[205px] overflow-hidden rounded-xl border border-[#dce4e8] bg-white py-1 shadow-xl"
                >
                  <div className="flex items-center gap-2 border-b border-[#edf1f3] px-4 py-3 text-xs font-semibold text-[#687a81]">
                    <Globe2 size={15} />
                    {ht.selectLanguage}
                  </div>

                  {supportedLanguages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={language === item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setLanguageOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#173743] transition hover:bg-[#f2f7f9]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">
                          {item.flag}
                        </span>
                        {item.name}
                      </span>

                      {language === item.code && (
                        <Check
                          size={16}
                          className="text-[#00799a]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              aria-label={
                notificationUnreadCount > 0
                  ? `${t.navigation.notifications}, ${notificationUnreadCount} ${ht.unread}`
                  : t.navigation.notifications
              }
              className="relative flex h-10 w-9 items-center justify-center text-[#173743] sm:w-10"
            >
              <Bell size={24} strokeWidth={2.2} />

              {notificationUnreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#eef6fb]">
                  {notificationUnreadCount > 9
                    ? "9+"
                    : notificationUnreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label={t.navigation.profile}
              className="flex h-10 w-9 items-center justify-center text-[#173743] sm:w-10"
            >
              <UserRound size={24} strokeWidth={2.2} />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={openLogoutDialog}
              disabled={loggingOut}
              aria-label={t.navigation.logout}
              className="flex h-10 w-9 items-center justify-center text-[#173743] transition disabled:cursor-not-allowed disabled:opacity-40 sm:w-10"
            >
              <LogOut size={24} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-5 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-[390px] rounded-[26px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-[#003b4d]">
                <LogOut size={22} strokeWidth={2.2} />
              </div>

              <button
                type="button"
                onClick={closeLogoutDialog}
                aria-label={ht.closeLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#687a81] transition hover:bg-[#f1f5f6]"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="logout-title"
              className="mt-5 text-[22px] font-bold text-[#173743]"
            >
              {ht.logoutTitle}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#66777e]">
              {ht.logoutDescription}
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={closeLogoutDialog}
                className="h-[52px] flex-1 rounded-full border border-[#ccd8dc] bg-white font-bold text-[#173743] transition hover:bg-[#f4f8f9]"
              >
                {t.common.cancel}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-[52px] flex-1 rounded-full bg-[#003b4d] font-bold text-white transition hover:bg-[#002f3d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut
                  ? ht.loggingOut
                  : t.navigation.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}