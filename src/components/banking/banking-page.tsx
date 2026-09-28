import { auth } from "@/lib/auth";
import { getCustomerSupportUnreadCount } from "@/server/queries/get-support-unread-count";

import { BottomNav } from "./bottom-nav";
import { MobileHeader } from "./mobile-header";
import { SupportFloatingButton } from "./support-floating-button";

interface BankingPageProps {
  title: string;
  children: React.ReactNode;
}

export async function BankingPage({
  title,
  children,
}: BankingPageProps) {
  const session = await auth();

  const unreadCount = session?.user?.id
    ? await getCustomerSupportUnreadCount(
        session.user.id
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#eef6fb]">
      <MobileHeader title={title} />

      <div className="mx-auto w-full max-w-[760px] px-4 pb-36 pt-5 sm:px-6">
        {children}
      </div>

      <SupportFloatingButton
        unreadCount={unreadCount}
      />

      <BottomNav />
    </main>
  );
}