import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { getDashboardData } from "@/server/queries/get-dashboard-data";

import { AccountDetails } from "@/components/banking/account-details";
import { AccountSummary } from "@/components/banking/account-summary";
import { BalanceDetails } from "@/components/banking/balance-details";
import { BankingPage } from "@/components/banking/banking-page";
import { RecentTransactions } from "@/components/banking/recent-transactions";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
      status: true,
      requiresPinSetup: true,
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

  if (user.requiresPinSetup) {
    redirect("/setup/security");
  }



  const dashboardData = await getDashboardData(session.user.id);

  if (!dashboardData) {
    redirect("/login");
  }

  return (
    <BankingPage title="At a glance">
      <div className="space-y-5">
        <AccountSummary
          accounts={dashboardData.accounts}
        />
        <BalanceDetails
          firstName={dashboardData.firstName}
          lastName={dashboardData.lastName}
          accounts={dashboardData.accounts}
        />
        <RecentTransactions
          transactions={dashboardData.transactions}
        />
        <AccountDetails
          accounts={dashboardData.accounts}
        />
      </div>
    </BankingPage>
  );
}