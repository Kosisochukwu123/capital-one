import { z } from "zod";

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, "Select an account"),

  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name is required")
    .max(120),

  recipientBankName: z
    .string()
    .trim()
    .min(2, "Enter the recipient bank name.")
    .max(100, "Bank name is too long."),

  recipientAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "Enter a valid account number"),

  amount: z.coerce.number().positive("Amount must be greater than zero"),

  memo: z.string().trim().max(250).optional(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
