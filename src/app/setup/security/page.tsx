import { redirect } from "next/navigation";

import { TransactionPinForm } from "@/components/auth/transaction-pin-form";
import { auth } from "@/lib/auth";

export default async function SecuritySetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.requiresPinSetup) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-12">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#003b4d] text-xl font-bold text-white">
            N
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Secure your account
          </h1>

          <p className="mt-2 leading-6 text-[#66777e]">
            Create a 4-digit PIN for confirming
            transactions.
          </p>
        </div>

        <TransactionPinForm />
      </div>
    </main>
  );
}