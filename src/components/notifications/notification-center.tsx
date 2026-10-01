"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleCheck,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notification-actions";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "SECURITY";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

function getNotificationIcon(
  type: NotificationType
) {
  switch (type) {
    case "SUCCESS":
      return (
        <CircleCheck
          size={22}
          className="text-emerald-700"
        />
      );

    case "WARNING":
      return (
        <AlertTriangle
          size={22}
          className="text-amber-700"
        />
      );

    case "SECURITY":
      return (
        <ShieldCheck
          size={22}
          className="text-[#003b4d]"
        />
      );

    default:
      return (
        <Info
          size={22}
          className="text-[#52666e]"
        />
      );
  }
}

function getIconBackground(
  type: NotificationType
) {
  switch (type) {
    case "SUCCESS":
      return "bg-emerald-50";

    case "WARNING":
      return "bg-amber-50";

    case "SECURITY":
      return "bg-[#dce9ee]";

    default:
      return "bg-[#edf3f5]";
  }
}

function formatNotificationDate(
  value: string
) {
  const date = new Date(value);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

export function NotificationCenter({
  notifications,
}: NotificationCenterProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  async function handleMarkRead(
    notificationId: string
  ) {
    setLoadingId(notificationId);

    const result =
      await markNotificationRead(
        notificationId
      );

    setLoadingId(null);

    if (result.success) {
      router.refresh();
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    setMarkingAll(true);

    const result =
      await markAllNotificationsRead();

    setMarkingAll(false);

    if (result.success) {
      router.refresh();
    }
  }

  if (notifications.length === 0) {
    return (
      <section className="bank-card mt-6 flex min-h-[250px] flex-col items-center justify-center rounded-[24px] px-5 text-center">
        <Bell
          size={38}
          strokeWidth={1.6}
          className="text-[#8b989d]"
        />

        <p className="mt-5 text-[18px] font-semibold text-[#52666e]">
          You&apos;re all caught up.
        </p>

        <p className="mt-2 max-w-[300px] text-sm leading-6 text-[#819096]">
          Important account and security
          updates will appear here.
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#173743]">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-[#718087]">
            {unreadCount > 0
              ? `${unreadCount} unread ${
                  unreadCount === 1
                    ? "notification"
                    : "notifications"
                }`
              : "You're all caught up."}
          </p>
        </div>

        <button
          type="button"
          disabled={
            markingAll ||
            unreadCount === 0
          }
          onClick={handleMarkAllRead}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[#d5dfe3] bg-white px-4 py-3 text-sm font-semibold text-[#173743] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <CheckCheck size={18} />
          )}

          <span className="hidden sm:inline">
            Mark all read
          </span>
        </button>
      </div>

      <section className="bank-card mt-6 overflow-hidden rounded-[24px]">
        {notifications.map(
          (notification, index) => (
            <article
              key={notification.id}
              className={`relative flex gap-4 p-5 ${
                index !==
                notifications.length - 1
                  ? "border-b border-[#e3e9eb]"
                  : ""
              } ${
                notification.read
                  ? "bg-white"
                  : "bg-[#f5fafb]"
              }`}
            >
              {!notification.read && (
                <span className="absolute left-0 top-0 h-full w-1 bg-[#003b4d]" />
              )}

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconBackground(
                  notification.type
                )}`}
              >
                {getNotificationIcon(
                  notification.type
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[16px] text-[#173743] ${notification.read ? "font-semibold" : "font-bold"}`}>
                      {notification.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#65777e]">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.read && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#003b4d]" />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-[#8a979c]">
                    {formatNotificationDate(
                      notification.createdAt
                    )}
                  </span>

                  {!notification.read && (
                    <button
                      type="button"
                      disabled={
                        loadingId ===
                        notification.id
                      }
                      onClick={() =>
                        handleMarkRead(
                          notification.id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-[#00627a] disabled:opacity-50"
                    >
                      {loadingId ===
                      notification.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Check size={14} />
                      )}

                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        )}
      </section>
    </>
  );
}