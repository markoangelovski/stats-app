"use server";

import bcryptjs from "bcryptjs";
import { AuthError } from "next-auth";
import * as z from "zod";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { LoginSchema, RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      message: "Invalid fields!"
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT
    });
  } catch (error) {
    console.error("Login serv act err: ", error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Error: invalid credentials" };
        default:
          return { message: "Error: Something went wrong!" };
      }
    }
    throw error;
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) return { message: "Invalid fields" };

  const { username, email, password } = validatedFields.data;

  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) return { message: "User already exists" };

    const passwordHash = await bcryptjs.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    return { message: "Success!" };
  } catch (error) {
    console.error("Serv act err: ", error);
    return { message: error };
  }
};
