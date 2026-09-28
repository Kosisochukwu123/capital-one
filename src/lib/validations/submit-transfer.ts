import { createTransferSchema } from "@/lib/validations/transfer";
import { z } from "zod";

export const submitTransferSchema =
  createTransferSchema.extend({
    pin: z
      .string()
      .regex(
        /^\d{4}$/,
        "Enter your 4-digit transaction PIN"
      ),
  });

export type SubmitTransferInput = z.infer<
  typeof submitTransferSchema
>;