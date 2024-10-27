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
