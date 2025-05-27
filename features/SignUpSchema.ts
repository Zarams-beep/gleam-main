import { SignUpSubmitFormData } from "@/types/auth";
import { z, ZodType } from "zod";

export const signUpSchema: ZodType<SignUpSubmitFormData> = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    image: z.any()
    .refine(file => !file || file instanceof File, "Must be a valid file")
    .optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    saveDetails: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });