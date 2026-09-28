import { z } from "zod";

export const transactionPinSchema = z
  .object({
    pin: z
      .string()
      .regex(
        /^\d{4}$/,
        "Transaction PIN must contain exactly 4 digits"
      ),

    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export type TransactionPinInput = z.infer<
  typeof transactionPinSchema
>;