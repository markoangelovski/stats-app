"use server";

import bcryptjs from "bcryptjs";
import { AuthError } from "next-auth";
import * as z from "zod";
import { DateRange } from "react-day-picker";

import { signIn, auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  LoginSchema,
  RegisterSchema,
  StatItemSchema,
  StatSchema
} from "@/schemas";
import { getUserByEmail } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { startOfMonth, endOfMonth } from "date-fns";

export interface Resp<D> {
  hasErrors: boolean;
  message: string;
  data: D;
}

export interface Stat {
  id: string;
  name: string;
  description: string | null;
  measurementLabel: string | null;
}

export interface StatWithItems extends Stat {
  statItems: StatItem[];
}

export interface StatItem {
  id: string;
  dateOfEntry: Date;
  numericValue: number;
  note: string | null;
}

// export type DateRange = { start: Date; end: Date };

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

export const getUser = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true
      }
    });
    return responseWithItems(false, "User fetched successfully!", user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return responseWithItems(true, "Error fetching user!", null);
  }
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
    return responseWithItems(true, "Unauthorized", []);
  }

  const validationResult = StatSchema.safeParse(values);
  if (!validationResult.success) {
    return responseWithItems(true, "Invalid fields!", []);
  }
  const { name, description, label } = validationResult.data;

  try {
    const existingStat = await prisma.stat.findFirst({
      where: { name, user_id: session.user.id }
    });

    if (existingStat) {
      return responseWithItems(true, "Stat already exists!", []);
    }

    await prisma.stat.create({
      data: {
        name,
        description,
        measurementLabel: label,
        user_id: session.user.id
      }
    });

    return responseWithItems(false, `Stat "${name}" created successfully!`, []);
  } catch (error) {
    console.error("Error creating stat:", error);
    return responseWithItems(true, "Error creating stat!", []);
  }
};

export const getStats = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }
  try {
    const stats = await prisma.stat.findMany({
      where: { user_id: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        measurementLabel: true
      }
    });
    return responseWithItems(false, "Stats fetched successfully!", stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return responseWithItems(true, "Error fetching stats!", []);
  }
};

export const updateStat = async (
  values: z.infer<typeof StatSchema>,
  id: string
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  const validationResult = StatSchema.safeParse(values);
  if (!validationResult.success) {
    return responseWithItems(true, "Invalid fields!", []);
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
    return responseWithItems(false, "Stat updated successfully!", []);
  } catch (error) {
    console.error("Error updating stat:", error);
    return responseWithItems(true, "Error updating stat!", []);
  }
};

export const deleteStat = async (statId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  try {
    await prisma.stat.delete({
      where: { id: statId, user_id: session.user.id },
      include: {
        statItems: true
      }
    });
    return responseWithItems(false, "Stat deleted successfully!", []);
  } catch (error) {
    console.error("Error deleting stat:", error);
    return responseWithItems(true, "Error deleting stat!", []);
  }
};

export const getStatsWithItems = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

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
              gte: startOfMonth(new Date()),
              lte: endOfMonth(new Date())
            }
          },
          orderBy: {
            dateOfEntry: "asc"
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

export const getItems = async (
  statId: string,
  dateRange: DateRange = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  try {
    const items = await prisma.statItem.findMany({
      where: {
        user_id: session.user.id,
        stat_id: statId,
        dateOfEntry: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      orderBy: {
        dateOfEntry: "asc"
      },
      select: {
        id: true,
        dateOfEntry: true,
        numericValue: true,
        note: true
      }
    });

    return responseWithItems(false, "Stat items fetched successfully!", items);
  } catch (error) {
    console.error("Error fetching stat items:", error);
    return responseWithItems(true, "Error fetching stats with items!", []);
  }
};

export const newStatItem = async (
  statId: string,
  values: z.infer<typeof StatItemSchema>
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  const validationResult = StatItemSchema.safeParse(values);

  if (!validationResult.success) {
    return responseWithItems(true, "Invalid stat item data!", []);
  }

  try {
    const statItem = await prisma.statItem.create({
      data: {
        stat_id: statId,
        user_id: session.user.id,
        dateOfEntry: values.dateOfEntry,
        numericValue: values.numericValue,
        note: values.note
      }
    });
    return responseWithItems(false, "Stat item created successfully!", [
      statItem
    ]);
  } catch (error) {
    console.error("Error creating stat item:", error);
    return responseWithItems(true, "Error creating stat item!", []);
  }
};

export const updateStatItem = async (
  statId: string,
  itemId: string,
  values: z.infer<typeof StatItemSchema>
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  const validationResult = StatItemSchema.safeParse(values);

  if (!validationResult.success) {
    return responseWithItems(true, "Invalid stat item data!", []);
  }

  try {
    const statItem = await prisma.statItem.update({
      where: { id: itemId, stat_id: statId, user_id: session.user.id },
      data: {
        dateOfEntry: values.dateOfEntry,
        numericValue: values.numericValue,
        note: values.note
      }
    });
    return responseWithItems(false, "Stat item updated successfully!", [
      statItem
    ]);
  } catch (error) {
    console.error("Error updating stat item:", error);
    return responseWithItems(true, "Error updating stat item!", []);
  }
};

export const deleteStatItem = async (statId: string, itemId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return responseWithItems(true, "Unauthorized", []);
  }

  try {
    await prisma.statItem.delete({
      where: { id: itemId, stat_id: statId, user_id: session.user.id }
    });
    return responseWithItems(false, "Stat item deleted successfully!", []);
  } catch (error) {
    console.error("Error deleting stat item:", error);
    return responseWithItems(true, "Error deleting stat item!", []);
  }
};
