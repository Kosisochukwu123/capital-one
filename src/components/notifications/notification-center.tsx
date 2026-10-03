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
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deleteNotification,
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

const MAX_SWIPE = 104;
const DELETE_THRESHOLD = 78;
const DIRECTION_LOCK_DISTANCE = 8;

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

type SwipeDirection =
  | "horizontal"
  | "vertical"
  | null;

interface SwipeableNotificationProps {
  notification: NotificationItem;
  isLast: boolean;
  loadingId: string | null;
  deletingId: string | null;
  onMarkRead: (
    notificationId: string
  ) => Promise<void>;
  onDelete: (
    notificationId: string
  ) => Promise<boolean>;
}

function SwipeableNotification({
  notification,
  isLast,
  loadingId,
  deletingId,
  onMarkRead,
  onDelete,
}: SwipeableNotificationProps) {
  const [offsetX, setOffsetX] =
    useState(0);

  const [dragging, setDragging] =
    useState(false);

  const [removing, setRemoving] =
    useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const startOffsetRef =
    useRef(0);

  const directionRef =
    useRef<SwipeDirection>(null);

  const pointerIdRef =
    useRef<number | null>(null);

  const isDeleting =
    deletingId === notification.id;

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      isDeleting ||
      loadingId === notification.id
    ) {
      return;
    }

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    startXRef.current =
      event.clientX;

    startYRef.current =
      event.clientY;

    startOffsetRef.current =
      offsetX;

    directionRef.current = null;

    pointerIdRef.current =
      event.pointerId;

    setDragging(true);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      !dragging ||
      pointerIdRef.current !==
        event.pointerId
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      startXRef.current;

    const deltaY =
      event.clientY -
      startYRef.current;

    if (!directionRef.current) {
      if (
        Math.abs(deltaX) <
          DIRECTION_LOCK_DISTANCE &&
        Math.abs(deltaY) <
          DIRECTION_LOCK_DISTANCE
      ) {
        return;
      }

      if (
        Math.abs(deltaY) >
        Math.abs(deltaX)
      ) {
        directionRef.current =
          "vertical";

        setDragging(false);
        setOffsetX(0);

        return;
      }

      directionRef.current =
        "horizontal";
    }

    if (
      directionRef.current !==
      "horizontal"
    ) {
      return;
    }

    /*
     * Prevent the browser from treating
     * a horizontal drag as another gesture.
     */
    event.preventDefault();

    const nextOffset =
      startOffsetRef.current +
      deltaX;

    /*
     * We only allow swiping left.
     */
    const clampedOffset =
      Math.max(
        -MAX_SWIPE,
        Math.min(0, nextOffset)
      );

    setOffsetX(clampedOffset);
  }

  async function finishSwipe(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      pointerIdRef.current !==
      event.pointerId
    ) {
      return;
    }

    pointerIdRef.current = null;

    const wasHorizontal =
      directionRef.current ===
      "horizontal";

    directionRef.current = null;
    setDragging(false);

    if (!wasHorizontal) {
      setOffsetX(0);
      return;
    }

    if (
      Math.abs(offsetX) <
      DELETE_THRESHOLD
    ) {
      setOffsetX(0);
      return;
    }

    /*
     * Move the notification fully away
     * before deleting it from the server.
     */
    setRemoving(true);
    setOffsetX(-500);

    const success =
      await onDelete(
        notification.id
      );

    if (!success) {
      setRemoving(false);
      setOffsetX(0);
    }
  }

  function handlePointerCancel() {
    pointerIdRef.current = null;
    directionRef.current = null;

    setDragging(false);
    setOffsetX(0);
  }

  async function handleDeleteButton() {
    if (isDeleting) {
      return;
    }

    setRemoving(true);
    setOffsetX(-500);

    const success =
      await onDelete(
        notification.id
      );

    if (!success) {
      setRemoving(false);
      setOffsetX(0);
    }
  }

  return (
    <div
      className={`relative overflow-hidden bg-red-600 ${
        !isLast
          ? "border-b border-[#e3e9eb]"
          : ""
      }`}
    >
      <div className="absolute inset-y-0 right-0 flex w-[104px] items-center justify-center bg-red-600">
        <button
          type="button"
          disabled={isDeleting}
          onClick={
            handleDeleteButton
          }
          aria-label="Delete notification"
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2
              size={22}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={22} />
          )}

          <span className="text-xs font-bold">
            Delete
          </span>
        </button>
      </div>

      <article
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={finishSwipe}
        onPointerCancel={
          handlePointerCancel
        }
        style={{
          transform: `translateX(${offsetX}px)`,
          touchAction: "pan-y",
          transition:
            dragging
              ? "none"
              : removing
                ? "transform 220ms ease-in"
                : "transform 220ms ease-out",
        }}
        className={`relative flex select-none gap-4 p-5 ${
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
              <p
                className={`text-[16px] text-[#173743] ${
                  notification.read
                    ? "font-semibold"
                    : "font-bold"
                }`}
              >
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
                    notification.id ||
                  isDeleting
                }
                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  void onMarkRead(
                    notification.id
                  );
                }}
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
    </div>
  );
}

export function NotificationCenter({
  notifications,
}: NotificationCenterProps) {
  const router = useRouter();

  /*
   * Keep a local copy so a deleted
   * notification disappears immediately
   * instead of waiting for router.refresh().
   */
  const [items, setItems] =
    useState<NotificationItem[]>(
      notifications
    );

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  /*
   * Keep local state synchronized when
   * server props change after refresh.
   */
  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const unreadCount =
    items.filter(
      (notification) =>
        !notification.read
    ).length;

  async function handleMarkRead(
    notificationId: string
  ) {
    if (loadingId) {
      return;
    }

    setLoadingId(notificationId);

    const result =
      await markNotificationRead(
        notificationId
      );

    setLoadingId(null);

    if (result.success) {
      setItems((current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
      );

      router.refresh();
    }
  }

  async function handleMarkAllRead() {
    if (
      unreadCount === 0 ||
      markingAll
    ) {
      return;
    }

    setMarkingAll(true);

    const result =
      await markAllNotificationsRead();

    setMarkingAll(false);

    if (result.success) {
      setItems((current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
      );

      router.refresh();
    }
  }

  async function handleDelete(
    notificationId: string
  ): Promise<boolean> {
    if (deletingId) {
      return false;
    }

    setDeletingId(notificationId);

    const result =
      await deleteNotification(
        notificationId
      );

    setDeletingId(null);

    if (!result.success) {
      return false;
    }

    setItems((current) =>
      current.filter(
        (notification) =>
          notification.id !==
          notificationId
      )
    );

    router.refresh();

    return true;
  }

  if (items.length === 0) {
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

      <p className="mt-4 text-xs font-medium text-[#8a979c]">
        Swipe a notification left to
        delete it.
      </p>

      <section className="bank-card mt-3 overflow-hidden rounded-[24px]">
        {items.map(
          (notification, index) => (
            <SwipeableNotification
              key={notification.id}
              notification={
                notification
              }
              isLast={
                index ===
                items.length - 1
              }
              loadingId={loadingId}
              deletingId={deletingId}
              onMarkRead={
                handleMarkRead
              }
              onDelete={handleDelete}
            />
          )
        )}
      </section>
    </>
  );
}