import Link from "next/link";
import {
  ArrowLeft,
  Headphones,
} from "lucide-react";

import { AdminSupportInbox } from "@/components/admin/admin-support-inbox";
import { requireAdmin } from "@/server/auth/require-admin";
import { getAdminSupport } from "@/server/queries/get-admin-support";
import { cleanupResolvedSupportConversations } from "@/server/services/cleanup-support-conversations";


export default async function AdminMessagesPage() {
await requireAdmin();

await cleanupResolvedSupportConversations();

const conversations =
  await getAdminSupport();

  const unreadCount = conversations.reduce(
    (total, conversation) => {
      return (
        total +
        conversation.messages.filter(
          (message) =>
            message.senderRole === "USER" &&
            !message.readAt
        ).length
      );
    },
    0
  );

  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-8">
      <div className="mx-auto w-full max-w-[1100px]">
        <Link href="/admin" className="inline-flex items-center gap-2 font-semibold text-[#006b7d]">
          <ArrowLeft size={18} />
          Admin dashboard
        </Link>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#006b7d]">
                <Headphones size={21} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#66808a]">
                  Customer care
                </p>

                <h1 className="text-3xl font-bold text-[#173743]">
                  Messages
                </h1>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="rounded-full bg-[#006b7d] px-4 py-2 text-sm font-bold text-white">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="mt-8">
          <AdminSupportInbox
            conversations={conversations}
          />
        </div>
      </div>
    </main>
  );
}