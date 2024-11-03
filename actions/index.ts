"use server";

import bcryptjs from "bcryptjs";
import { AuthError } from "next-auth";
import * as z from "zod";

import { signIn, auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LoginSchema, RegisterSchema, StatSchema } from "@/schemas";
import { getUserByEmail } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export interface Resp<D> {
  hasErrors: boolean;
  message: string;
  data: D;
}

export interface StatWithItems {
  id: string;
  name: string;
  description: string | null;
  measurementLabel: string | null;
  statItems: StatItem[];
}

export interface StatItem {
  id: string;
  dateOfEntry: Date;
  numericValue: number;
  note: string | null;
}

const responseWithItems = <D>(
  hasErrors: boolean,
  message: string,
  data: D
): Resp<D> => {
  return {
    hasErrors,
    message,
    data
  };
};

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

export const newStat = async (values: z.infer<typeof StatSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  const validationResult = StatSchema.safeParse(values);
  if (!validationResult.success) {
    return { message: "Invalid fields!" };
  }
  const { name, description, label } = validationResult.data;

  try {
    const existingStat = await prisma.stat.findFirst({
      where: { name, user_id: session.user.id }
    });

    if (existingStat) {
      return { message: "Stat already exists!" };
    }

    await prisma.stat.create({
      data: {
        name,
        description,
        measurementLabel: label,
        user_id: session.user.id
      }
    });

    return { message: `Stat "${name}" created successfully!` };
  } catch (error) {
    console.error("Error creating stat:", error);
    return { message: "Error creating stat!" };
  }
};

export const getStats = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }
  // TODO: Return uniform object {hasErrors: boolean, message: string, stats: any[]}
  try {
    const stats = await prisma.stat.findMany({
      where: { user_id: session.user.id }
    });
    return { stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { message: "Error fetching stats!" };
  }
};

export const updateStat = async (
  values: z.infer<typeof StatSchema>,
  id: string
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  const validationResult = StatSchema.safeParse(values);
  if (!validationResult.success) {
    return { message: "Invalid fields!" };
  }

  try {
    await prisma.stat.update({
      where: { id: id, user_id: session.user.id },
      data: {
        name: values.name,
        description: values.description,
        measurementLabel: values.label
      }
    });
    return { message: "Stat updated successfully!" };
  } catch (error) {
    console.error("Error updating stat:", error);
    return { message: "Error updating stat!" };
  }
};

export const deleteStat = async (statId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.stat.delete({
      where: { id: statId, user_id: session.user.id }
    });
    return { message: "Stat deleted successfully!" };
  } catch (error) {
    console.error("Error deleting stat:", error);
    return { message: "Error deleting stat!" };
  }
};

export const getStatsWithItems = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  try {
    const statsWithItems = await prisma.stat.findMany({
      where: {
        user_id: session.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        measurementLabel: true,
        statItems: {
          where: {
            dateOfEntry: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          select: {
            id: true,
            dateOfEntry: true,
            numericValue: true,
            note: true
          }
        }
      }
    });
    console.log("statsWithItems: ", statsWithItems);
    return responseWithItems(
      false,
      "Stats fetched successfully!",
      statsWithItems
    );
  } catch (error) {
    console.error("Error fetching stats with items:", error);
    return responseWithItems(true, "Error fetching stats with items!", []);
  }
};
