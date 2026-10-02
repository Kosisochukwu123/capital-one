import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { TransactionsView } from "@/components/banking/transactions-view";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTransactionsData } from "@/server/queries/get-transactions-data";

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      status: true,
      role: true,
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

  const data = await getTransactionsData(session.user.id);

  if (!data) {
    redirect("/login");
  }

  return (
    <BankingPage title="Transactions">
      <TransactionsView
        accounts={data.accounts}
        transactions={data.transactions}
      />
    </BankingPage>
  );
}