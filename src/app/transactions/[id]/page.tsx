import { notFound, redirect } from "next/navigation";

import { BankingPage } from "@/components/banking/banking-page";
import { TransactionDetailsView } from "@/components/banking/transaction-details-view";
import { auth } from "@/lib/auth";
import { getUserTransactionDetails } from "@/server/queries/get-user-transaction-details";

interface TransactionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailsPage({
  params,
}: TransactionDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const transaction = await getUserTransactionDetails(
    id,
    session.user.id
  );

  if (!transaction) {
    notFound();
  }

  return (
    <BankingPage title="Transaction details">
      <TransactionDetailsView transaction={transaction} />
    </BankingPage>
  );
}