import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required!" }),
  password: z.string().min(1, { message: "Password is required!" })
});

export const RegisterSchema = z.object({
  username: z.string().min(3, { message: "Minimum 3 characters required!" }),
  email: z.string().email({ message: "Email is required!" }),
  password: z.string().min(4, { message: "Minimum 4 characters required!" })
});

export const StatSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters required!" })
    .max(250, { message: "Maximum 250 characters allowed!" }),
  description: z
    .string()
    .min(3, { message: "Minimum 3 characters required!" })
    .max(1000, { message: "Maximum 1000 characters allowed!" }),
  label: z
    .string()
    .min(1, { message: "Minimum 1 character required!" })
    .max(50, { message: "Maximum 50 characters allowed!" })
});
