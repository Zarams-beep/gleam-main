import { LoginFormData } from "@/types/auth";
import { z, ZodType } from "zod";


export const loginSchema: ZodType<LoginFormData> = z
  .object({
    email: z.string().email('Invalid email').min(0, 'Email is required'),
    password: z.string().min(6, 'Wrong Password, confirm password'),
    saveDetails: z.boolean().optional(),

  });
