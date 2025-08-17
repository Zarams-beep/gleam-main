import { SignUpSubmitFormData } from "@/types/auth";
import { z, ZodType } from "zod";

export const signUpSchema: ZodType<SignUpSubmitFormData> = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    image: z.string().nullable().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });