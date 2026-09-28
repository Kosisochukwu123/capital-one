import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name is required")
      .max(80),

    middleName: z
      .string()
      .trim()
      .max(80)
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name is required")
      .max(80),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required"),

    country: z
      .string()
      .trim()
      .min(2, "Country is required"),

    state: z
      .string()
      .trim()
      .min(2, "State / Province is required"),

    city: z
      .string()
      .trim()
      .min(2, "City is required"),

    address: z
      .string()
      .trim()
      .min(5, "Address is required"),

    postalCode: z
      .string()
      .trim()
      .optional(),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters"
      )
      .regex(
        /[A-Z]/,
        "Password must contain an uppercase letter"
      )
      .regex(
        /[0-9]/,
        "Password must contain a number"
      ),

    confirmPassword: z.string(),

    acceptedTerms: z
      .boolean()
      .refine((value) => value === true, {
        message: "You must accept the terms",
      }),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<
  typeof registerSchema
>;

export type LoginInput = z.infer<
  typeof loginSchema
>;