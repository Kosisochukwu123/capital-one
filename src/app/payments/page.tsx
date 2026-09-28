import { redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { PaymentForm } from "@/components/banking/payment-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PaymentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const accounts = await db.account.findMany({
    where: {
      userId: session.user.id,
      status: {
        not: "CLOSED",
      },
    },

    orderBy: {
      openedAt: "asc",
    },

    select: {
      id: true,
      type: true,
      accountNumber: true,
      currency: true,
      balance: true,
      status: true,
      transferPermission: true,
    },
  });

  const paymentAccounts = accounts.map((account) => ({
    id: account.id,
    type: account.type,
    accountNumber: account.accountNumber,
    currency: account.currency,
    balance: account.balance.toNumber(),
    status: account.status,
    transferPermission: account.transferPermission,
  }));

  return (
    <BankingPage title="Payments">
      <PaymentForm accounts={paymentAccounts} />
    </BankingPage>
  );
}