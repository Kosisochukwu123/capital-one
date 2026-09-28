"use client";

import {
  CheckCircle2,
  Headphones,
  Loader2,
  RotateCcw,
  Send,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  markCustomerSupportMessagesReadAction,
  reopenSupportConversationAction,
  resolveSupportConversationAction,
  sendAdminSupportMessageAction,
} from "@/server/actions/admin-support";

type Message = {
  id: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

type Conversation = {
  id: string;
  subject: string | null;
  status: "OPEN" | "RESOLVED";
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    email: string;
    customerId: string | null;
    fullName: string;
  };

  messages: Message[];
};

interface AdminSupportInboxProps {
  conversations: Conversation[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AdminSupportInbox({
  conversations,
}: AdminSupportInboxProps) {
  const [selectedId, setSelectedId] =
    useState<string | null>(
      conversations[0]?.id ?? null
    );

  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const selected = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedId
      ) ?? null,
    [conversations, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      return;
    }

    const hasUnread =
      selected.messages.some(
        (item) =>
          item.senderRole === "USER" &&
          !item.readAt
      );

    if (hasUnread) {
      void markCustomerSupportMessagesReadAction(
        selected.id
      );
    }
  }, [selected]);

  async function sendReply() {
    if (
      !selected ||
      !message.trim() ||
      working
    ) {
      return;
    }

    setWorking(true);
    setError(null);

    const result =
      await sendAdminSupportMessageAction(
        selected.id,
        message
      );

    if (!result.success) {
      setError(
        result.error ?? "Unable to send reply."
      );
      setWorking(false);
      return;
    }

    setMessage("");
    window.location.reload();
  }

  async function resolveConversation() {
    if (!selected || working) {
      return;
    }

    setWorking(true);
    setError(null);

    const result =
      await resolveSupportConversationAction(
        selected.id
      );

    if (!result.success) {
      setError(
        result.error ??
          "Unable to resolve conversation."
      );
      setWorking(false);
      return;
    }

    window.location.reload();
  }

  async function reopenConversation() {
    if (!selected || working) {
      return;
    }

    setWorking(true);
    setError(null);

    const result =
      await reopenSupportConversationAction(
        selected.id
      );

    if (!result.success) {
      setError(
        result.error ??
          "Unable to reopen conversation."
      );
      setWorking(false);
      return;
    }

    window.location.reload();
  }

  if (conversations.length === 0) {
    return (
      <section className="rounded-[24px] bg-white p-10 text-center">
        <Headphones
          size={36}
          className="mx-auto text-[#006b7d]"
        />

        <h2 className="mt-4 text-xl font-bold text-[#173743]">
          No support conversations
        </h2>

        <p className="mt-2 text-sm text-[#718087]">
          Customer messages will appear here.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="overflow-hidden rounded-[24px] bg-white">
        <div className="border-b border-[#e5ebed] p-5">
          <h2 className="font-bold text-[#173743]">
            Conversations
          </h2>

          <p className="mt-1 text-sm text-[#718087]">
            {conversations.length} total
          </p>
        </div>

        <div className="max-h-[680px] overflow-y-auto">
          {conversations.map((conversation) => {
            const unread =
              conversation.messages.some(
                (item) =>
                  item.senderRole === "USER" &&
                  !item.readAt
              );

            const lastMessage =
              conversation.messages[
                conversation.messages.length - 1
              ];

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setSelectedId(conversation.id);
                  setError(null);
                }}
                className={`w-full border-b border-[#edf1f2] p-4 text-left transition ${selectedId === conversation.id ? "bg-[#edf7f8]" : "bg-white hover:bg-[#f8fbfc]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-bold text-[#173743]">
                    {conversation.user.fullName}
                  </p>

                  {unread && (
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#006b7d]" />
                  )}
                </div>

                <p className="mt-1 truncate text-sm font-medium text-[#50666e]">
                  {conversation.subject || "Support"}
                </p>

                {lastMessage && (
                  <p className="mt-2 truncate text-xs text-[#829097]">
                    {lastMessage.body}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <section className="overflow-hidden rounded-[24px] bg-white">
          <div className="border-b border-[#e5ebed] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserRound
                    size={18}
                    className="text-[#006b7d]"
                  />

                  <h2 className="font-bold text-[#173743]">
                    {selected.user.fullName}
                  </h2>
                </div>

                <p className="mt-1 text-sm text-[#718087]">
                  {selected.user.email}
                </p>

                <p className="mt-2 font-semibold text-[#173743]">
                  {selected.subject || "Customer support"}
                </p>
              </div>

              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${selected.status === "OPEN" ? "bg-[#e7f7f1] text-[#16835f]" : "bg-[#edf1f3] text-[#66777e]"}`}>
                {selected.status}
              </span>
            </div>
          </div>

          <div className="min-h-[420px] max-h-[520px] space-y-5 overflow-y-auto bg-[#f8fbfc] p-5">
            {selected.messages.map((item) => {
              const admin =
                item.senderRole === "ADMIN";

              return (
                <div
                  key={item.id}
                  className={`flex ${admin ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
                    <p className={`mb-1 px-1 text-xs font-semibold ${admin ? "text-right text-[#006b7d]" : "text-[#66777e]"}`}>
                      {admin
                        ? "Administrator"
                        : selected.user.fullName}
                    </p>

                    <div className={`rounded-[18px] px-4 py-3 ${admin ? "rounded-br-[5px] bg-[#006b7d] text-white" : "rounded-bl-[5px] border border-[#e1e9ec] bg-white text-[#173743]"}`}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {item.body}
                      </p>
                    </div>

                    <p className={`mt-1 px-1 text-[11px] text-[#8a989e] ${admin ? "text-right" : ""}`}>
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e5ebed] p-5">
            {error && (
              <div className="mb-4 rounded-[14px] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {selected.status === "OPEN" ? (
              <>
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  maxLength={2000}
                  rows={3}
                  placeholder="Reply to customer..."
                  className="w-full resize-none rounded-[16px] border border-[#dce5e8] px-4 py-3 text-sm leading-6 text-[#173743] outline-none focus:border-[#006b7d]"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={working}
                    onClick={resolveConversation}
                    className="inline-flex items-center gap-2 rounded-[14px] border border-[#dce5e8] px-4 py-3 text-sm font-bold text-[#173743] disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    Resolve
                  </button>

                  <button
                    type="button"
                    disabled={
                      working || !message.trim()
                    }
                    onClick={sendReply}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[#006b7d] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {working ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={17} />
                    )}

                    Reply
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                disabled={working}
                onClick={reopenConversation}
                className="inline-flex items-center gap-2 rounded-[14px] bg-[#006b7d] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {working ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <RotateCcw size={17} />
                )}

                Reopen conversation
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}