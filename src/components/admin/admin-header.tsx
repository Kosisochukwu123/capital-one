"use client";

import type { UserRole } from "@prisma/client";
import {
    LayoutDashboard,
    LogOut,
    Menu,
    MessageCircle,
    ReceiptText,
    ShieldCheck,
    UserCog,
    Users,
    X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AdminHeaderProps {
    unreadCount?: number;
    role: UserRole;
}

export function AdminHeader({
    unreadCount = 0,
    role,
}: AdminHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [showLogout, setShowLogout] =
        useState(false);

    const [showMenu, setShowMenu] =
        useState(false);

    const [loggingOut, setLoggingOut] =
        useState(false);

    const isSuperAdmin =
        role === "SUPER_ADMIN";

    const navigation = [
        {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            label: isSuperAdmin
                ? "Customers"
                : "My customers",
            href: "/admin/users",
            icon: Users,
        },
        {
            label: "Transactions",
            href: "/admin/transactions",
            icon: ReceiptText,
        },
        ...(isSuperAdmin
            ? [
                  {
                      label: "Account managers",
                      href: "/admin/account-managers",
                      icon: UserCog,
                  },
              ]
            : []),
    ];

    function navigate(href: string) {
        setShowMenu(false);
        router.push(href);
    }

    function openMessages() {
        setShowMenu(false);
        router.push("/admin/messages");
    }

    function isActive(href: string) {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(href);
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
            <header className="sticky top-0 z-50 border-b border-[#dfe8eb] bg-white">
                <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="flex shrink-0 items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#006b7d]">
                            <ShieldCheck
                                size={20}
                            />
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="font-bold text-[#173743]">
                                Northstar
                            </p>

                            <p className="text-xs text-[#718087]">
                                {isSuperAdmin
                                    ? "Super Administration"
                                    : "Account Manager"}
                            </p>
                        </div>
                    </button>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navigation.map(
                            (item) => {
                                const Icon =
                                    item.icon;

                                const active =
                                    isActive(
                                        item.href
                                    );

                                return (
                                    <button
                                        key={
                                            item.href
                                        }
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                item.href
                                            )
                                        }
                                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${active ? "bg-[#edf5f7] text-[#006b7d]" : "text-[#52676f] hover:bg-[#f4f8f9]"}`}
                                    >
                                        <Icon
                                            size={16}
                                        />

                                        {
                                            item.label
                                        }
                                    </button>
                                );
                            }
                        )}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={
                                openMessages
                            }
                            aria-label={
                                unreadCount > 0
                                    ? `Customer care. ${unreadCount} unread messages.`
                                    : "Customer care messages"
                            }
                            title="Messages"
                            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${pathname.startsWith("/admin/messages") ? "bg-[#dfecef] text-[#006b7d]" : "bg-[#edf5f7] text-[#173743] hover:bg-[#dfecef]"}`}
                        >
                            <MessageCircle
                                size={19}
                            />

                            {unreadCount >
                                0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#e04f5f] px-1 text-[9px] font-bold leading-none text-white">
                                    {unreadCount >
                                    99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowLogout(
                                    true
                                )
                            }
                            className="hidden h-10 items-center gap-2 rounded-full bg-[#edf5f7] px-4 text-sm font-bold text-[#173743] transition hover:bg-[#dfecef] sm:flex"
                        >
                            <LogOut
                                size={17}
                            />

                            Logout
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowMenu(
                                    true
                                )
                            }
                            aria-label="Open admin menu"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743] lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {showMenu && (
                <div className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px] lg:hidden">
                    <div className="ml-auto flex h-full w-full max-w-[330px] flex-col bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-[#173743]">
                                    Northstar
                                </p>

                                <p className="text-xs text-[#718087]">
                                    {isSuperAdmin
                                        ? "Super Administration"
                                        : "Account Manager"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowMenu(
                                        false
                                    )
                                }
                                aria-label="Close menu"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-8 space-y-2">
                            {navigation.map(
                                (item) => {
                                    const Icon =
                                        item.icon;

                                    const active =
                                        isActive(
                                            item.href
                                        );

                                    return (
                                        <button
                                            key={
                                                item.href
                                            }
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    item.href
                                                )
                                            }
                                            className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left text-sm font-bold transition ${active ? "bg-[#edf5f7] text-[#006b7d]" : "text-[#52676f] hover:bg-[#f4f8f9]"}`}
                                        >
                                            <Icon
                                                size={
                                                    18
                                                }
                                            />

                                            {
                                                item.label
                                            }
                                        </button>
                                    );
                                }
                            )}

                            <button
                                type="button"
                                onClick={
                                    openMessages
                                }
                                className={`flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left text-sm font-bold transition ${pathname.startsWith("/admin/messages") ? "bg-[#edf5f7] text-[#006b7d]" : "text-[#52676f] hover:bg-[#f4f8f9]"}`}
                            >
                                <span className="flex items-center gap-3">
                                    <MessageCircle
                                        size={18}
                                    />

                                    Messages
                                </span>

                                {unreadCount >
                                    0 && (
                                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e04f5f] px-2 text-[10px] font-bold text-white">
                                        {unreadCount >
                                        99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="mt-auto border-t border-[#e5edef] pt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMenu(
                                        false
                                    );
                                    setShowLogout(
                                        true
                                    );
                                }}
                                className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                            >
                                <LogOut
                                    size={18}
                                />

                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLogout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-[390px] rounded-[24px] bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#173743]">
                                    Log out?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#718087]">
                                    Are you sure
                                    you want to log
                                    out of the admin
                                    dashboard?
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    loggingOut
                                }
                                onClick={() =>
                                    setShowLogout(
                                        false
                                    )
                                }
                                aria-label="Close"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={
                                    loggingOut
                                }
                                onClick={() =>
                                    setShowLogout(
                                        false
                                    )
                                }
                                className="rounded-[14px] border border-[#dce5e8] px-4 py-3 text-sm font-bold text-[#173743] disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    loggingOut
                                }
                                onClick={
                                    handleLogout
                                }
                                className="flex items-center justify-center gap-2 rounded-[14px] bg-[#003b4d] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                            >
                                <LogOut
                                    size={16}
                                />

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