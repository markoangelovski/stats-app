"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import * as z from "zod";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/schemas";

export const login = async (formData: FormData) => {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    console.error("Serv act err: ", error);
  }

  revalidatePath("/login");
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) return { message: "Invalid fields" };

  const { username, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) return { message: "User already exists" };

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    console.log("values on ser: ", values);
    return { message: "Success!" };
  } catch (error) {
    console.error("Serv act err: ", error);
    return { message: error };
  }

  // revalidatePath("/register");
};
