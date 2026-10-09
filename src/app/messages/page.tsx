import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { SupportChat } from "@/components/banking/support-chat";
import { SupportPageHeader } from "@/components/banking/support-page-header";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { getUserSupport } from "@/server/queries/get-user-support";
import { cleanupResolvedSupportConversations } from "@/server/services/cleanup-support-conversations";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  if (
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  ) {
    redirect("/admin");
  }

  await cleanupResolvedSupportConversations();

  const conversations = await getUserSupport(user.id);

  return (
    <BankingPage title="Messages">
      <SupportPageHeader />

      <SupportChat conversations={conversations} />
    </BankingPage>
  );
}