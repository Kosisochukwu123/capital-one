"use server";

import { auth } from "@/lib/auth";
import { setTransactionPin } from "@/server/services/set-transaction-pin";

export async function setTransactionPinAction(values: {
  pin: string;
  confirmPin: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in.",
    };
  }

  try {
    return await setTransactionPin(
      session.user.id,
      values
    );
  } catch (error) {
    console.error("Transaction PIN setup error:", error);

    return {
      success: false,
      error: "Unable to create transaction PIN.",
    };
  }
}