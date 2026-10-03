"use client";

import {
  CheckCircle2,
  Headphones,
  ImagePlus,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  markSupportMessagesReadAction,
  sendSupportMessageAction,
  startSupportConversationAction,
} from "@/server/actions/support";

type SupportMessage = {
  id: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  body: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type SupportConversation = {
  id: string;
  subject: string | null;
  status: "OPEN" | "RESOLVED";
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
};

interface SupportChatProps {
  conversations: SupportConversation[];
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function SupportChat({
  conversations,
}: SupportChatProps) {
  const [selectedId, setSelectedId] =
    useState<string | null>(
      conversations[0]?.id ?? null
    );

  const [creating, setCreating] =
    useState(conversations.length === 0);

  const [subject, setSubject] = useState("");

  const [firstMessage, setFirstMessage] =
    useState("");

  const [message, setMessage] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedId
      ) ?? null,
    [conversations, selectedId]
  );

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const hasUnreadAdminMessage =
      selectedConversation.messages.some(
        (supportMessage) =>
          supportMessage.senderRole ===
            "ADMIN" &&
          !supportMessage.readAt
      );

    if (!hasUnreadAdminMessage) {
      return;
    }

    void markSupportMessagesReadAction(
      selectedConversation.id
    );
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function handleCreateConversation() {
    if (submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    const result =
      await startSupportConversationAction({
        subject,
        message: firstMessage,
      });

    if (!result.success) {
      setError(
        result.error ??
          "Unable to start conversation."
      );

      setSubmitting(false);
      return;
    }

    window.location.reload();
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image must be 5MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(preview);
  }

  function removeSelectedImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleSendMessage() {
    if (
      submitting ||
      !selectedConversation ||
      (!message.trim() && !selectedImage)
    ) {
      return;
    }

    setError(null);
    setSubmitting(true);

    const formData = new FormData();

    formData.append(
      "conversationId",
      selectedConversation.id
    );

    formData.append(
      "message",
      message.trim()
    );

    if (selectedImage) {
      formData.append(
        "image",
        selectedImage
      );
    }

    const result =
      await sendSupportMessageAction(
        formData
      );

    if (!result.success) {
      setError(
        result.error ??
          "Unable to send message."
      );

      setSubmitting(false);
      return;
    }

    setMessage("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    window.location.reload();
  }

  if (creating) {
    return (
      <section className="overflow-hidden rounded-[26px] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5ebed] px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-[#173743]">
              Contact customer care
            </h1>

            <p className="mt-1 text-sm text-[#718087]">
              Tell us what you need help
              with.
            </p>
          </div>

          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setCreating(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f6f8] text-[#173743]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="text-sm font-semibold text-[#173743]">
              Subject
            </label>

            <input
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              maxLength={120}
              placeholder="What can we help with?"
              className="mt-2 w-full rounded-[16px] border border-[#dce5e8] bg-white px-4 py-3.5 text-sm text-[#173743] outline-none transition focus:border-[#006b7d]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#173743]">
              Message
            </label>

            <textarea
              value={firstMessage}
              onChange={(event) =>
                setFirstMessage(
                  event.target.value
                )
              }
              maxLength={2000}
              rows={7}
              placeholder="Describe your issue..."
              className="mt-2 w-full resize-none rounded-[16px] border border-[#dce5e8] bg-white px-4 py-3.5 text-sm leading-6 text-[#173743] outline-none transition focus:border-[#006b7d]"
            />

            <p className="mt-2 text-right text-xs text-[#829097]">
              {firstMessage.length}/2000
            </p>
          </div>

          {error && (
            <div className="rounded-[14px] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={
              handleCreateConversation
            }
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#006b7d] px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send message
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  if (!selectedConversation) {
    return (
      <section className="rounded-[26px] bg-white p-8 text-center">
        <Headphones
          size={34}
          className="mx-auto text-[#006b7d]"
        />

        <h1 className="mt-4 text-xl font-bold text-[#173743]">
          Customer care
        </h1>

        <p className="mt-2 text-sm text-[#718087]">
          Start a conversation with our
          support team.
        </p>

        <button
          type="button"
          onClick={() =>
            setCreating(true)
          }
          className="mt-6 rounded-[16px] bg-[#006b7d] px-5 py-3 font-bold text-white"
        >
          Start conversation
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.length > 1 && (
        <section className="rounded-[22px] bg-white p-4">
          <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-[#718087]">
            Conversations
          </p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {conversations.map(
              (conversation) => {
                const unread =
                  conversation.messages.some(
                    (supportMessage) =>
                      supportMessage.senderRole ===
                        "ADMIN" &&
                      !supportMessage.readAt
                  );

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(
                        conversation.id
                      );

                      setError(null);
                      removeSelectedImage();
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedId === conversation.id ? "bg-[#003b4d] text-white" : "bg-[#edf5f7] text-[#173743]"}`}
                  >
                    {conversation.subject ||
                      "Support"}

                    {unread && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#ffb84d]" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-[26px] bg-white">
        <div className="border-b border-[#e5ebed] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                <Headphones size={21} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate font-bold text-[#173743]">
                  {selectedConversation.subject ||
                    "Customer care"}
                </h1>

                <p className="mt-1 text-xs text-[#718087]">
                  {selectedConversation.status ===
                  "OPEN"
                    ? "Customer care conversation"
                    : "Resolved conversation"}
                </p>
              </div>
            </div>

            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${selectedConversation.status === "OPEN" ? "bg-[#e7f7f1] text-[#16835f]" : "bg-[#edf1f3] text-[#66777e]"}`}>
              {
                selectedConversation.status
              }
            </span>
          </div>
        </div>

        <div className="min-h-[360px] space-y-5 bg-[#f8fbfc] px-4 py-6 sm:px-6">
          {selectedConversation.messages.map(
            (supportMessage) => {
              const isUser =
                supportMessage.senderRole ===
                "USER";

              return (
                <div
                  key={supportMessage.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] sm:max-w-[72%]">
                    {!isUser && (
                      <div className="mb-1.5 flex items-center gap-1.5 px-1">
                        <MessageCircle
                          size={13}
                          className="text-[#006b7d]"
                        />

                        <span className="text-xs font-semibold text-[#006b7d]">
                          Customer care
                        </span>
                      </div>
                    )}

                    <div className={`overflow-hidden rounded-[20px] ${isUser ? "rounded-br-[6px] bg-[#006b7d] text-white" : "rounded-bl-[6px] border border-[#e2eaed] bg-white text-[#173743]"}`}>
                      {supportMessage.imageUrl && (
                        <a
                          href={
                            supportMessage.imageUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={
                              supportMessage.imageUrl
                            }
                            alt="Support attachment"
                            className="max-h-[340px] w-full max-w-[360px] object-cover"
                          />
                        </a>
                      )}

                      {supportMessage.body?.trim() && (
                        <p className="whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6">
                          {
                            supportMessage.body
                          }
                        </p>
                      )}

                      {!supportMessage.imageUrl &&
                        !supportMessage.body?.trim() && (
                          <p className="px-4 py-3 text-sm italic opacity-70">
                            Empty message
                          </p>
                        )}
                    </div>

                    <p className={`mt-1.5 px-1 text-[11px] text-[#8a989e] ${isUser ? "text-right" : "text-left"}`}>
                      {formatDate(
                        supportMessage.createdAt
                      )}{" "}
                      ·{" "}
                      {formatTime(
                        supportMessage.createdAt
                      )}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {selectedConversation.status ===
        "OPEN" ? (
          <div className="border-t border-[#e5ebed] p-4 sm:p-5">
            {error && (
              <div className="mb-3 rounded-[14px] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {imagePreview && (
              <div className="mb-3">
                <div className="relative inline-block overflow-hidden rounded-[18px] border border-[#dce5e8] bg-[#f8fbfc]">
                  <img
                    src={imagePreview}
                    alt="Selected attachment"
                    className="max-h-[220px] max-w-[280px] object-cover"
                  />

                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    disabled={submitting}
                    aria-label="Remove image"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-1.5 max-w-[280px] truncate text-xs text-[#829097]">
                  {selectedImage?.name}
                </p>
              </div>
            )}

            <div className="flex items-end gap-2 sm:gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                disabled={submitting}
                aria-label="Attach image"
                title="Attach image"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#dce5e8] bg-white text-[#006b7d] transition hover:bg-[#edf5f7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus size={20} />
              </button>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                maxLength={2000}
                rows={2}
                placeholder={
                  selectedImage
                    ? "Add a message (optional)..."
                    : "Write a message..."
                }
                className="min-h-[52px] flex-1 resize-none rounded-[18px] border border-[#dce5e8] bg-white px-4 py-3 text-sm leading-6 text-[#173743] outline-none transition focus:border-[#006b7d]"
              />

              <button
                type="button"
                disabled={
                  submitting ||
                  (!message.trim() &&
                    !selectedImage)
                }
                onClick={
                  handleSendMessage
                }
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#006b7d] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCreating(true);
                  setError(null);
                  removeSelectedImage();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006b7d]"
              >
                <Plus size={14} />
                New conversation
              </button>

              <span className="text-xs text-[#829097]">
                {message.length}/2000
              </span>
            </div>
          </div>
        ) : (
          <div className="border-t border-[#e5ebed] p-5">
            <div className="flex items-start gap-3 rounded-[16px] bg-[#f3f7f8] p-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-[#159873]"
              />

              <div>
                <p className="font-semibold text-[#173743]">
                  Conversation resolved
                </p>

                <p className="mt-1 text-sm leading-6 text-[#718087]">
                  This conversation has been
                  closed by customer care.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setError(null);
                removeSelectedImage();
              }}
              className="mt-4 inline-flex items-center gap-2 font-semibold text-[#006b7d]"
            >
              <Plus size={17} />
              Start another conversation
            </button>
          </div>
        )}
      </section>
    </div>
  );
}