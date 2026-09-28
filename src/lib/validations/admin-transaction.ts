import { z } from "zod";

export const adminTransactionSchema = z.object({
  userId: z.string().min(1),
  accountId: z.string().min(1),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  title: z.string().trim().min(2, "Transaction title is required").max(120),
  description: z.string().trim().max(500).optional(),
  memo: z.string().trim().max(500).optional(),
  adminNote: z.string().trim().max(1000).optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
});

export type AdminTransactionInput = z.infer<
  typeof adminTransactionSchema
>;