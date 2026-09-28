import { redirect } from "next/navigation";
import { Headphones } from "lucide-react";

import { BankingPage } from "@/components/banking/banking-page";
import { SupportChat } from "@/components/banking/support-chat";
import { SupportCloseButton } from "@/components/banking/support-close-button";
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

  if (user.role === "ADMIN") {
    redirect("/admin");
  }


await cleanupResolvedSupportConversations();


  const conversations = await getUserSupport(
    user.id
  );

  return (
    <BankingPage title="Messages">
      <div className="mb-4 flex items-center justify-between rounded-[20px] bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#006b7d]">
            <Headphones size={20} />
          </div>

          <div>
            <p className="font-bold text-[#173743]">
              Customer care
            </p>

            <p className="text-xs text-[#718087]">
              Support messages
            </p>
          </div>
        </div>

        <SupportCloseButton />
      </div>

      <SupportChat
        conversations={conversations}
      />
    </BankingPage>
  );
}