import { z } from "zod";

export const startSupportConversationSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject.")
    .max(120, "Subject is too long."),

  message: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(2000, "Message is too long."),
});

export const sendSupportMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation is required."),

  message: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(2000, "Message is too long."),
});

export type StartSupportConversationInput = z.infer<
  typeof startSupportConversationSchema
>;

export type SendSupportMessageInput = z.infer<
  typeof sendSupportMessageSchema
>;