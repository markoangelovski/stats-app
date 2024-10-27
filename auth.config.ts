import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";

import type { NextAuthConfig } from "next-auth";

import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./lib/utils";

export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);

          if (!user || !user.passwordHash) return null;

          const passwordsMatch = await bcryptjs.compare(
            password,
            user.passwordHash
          );

          if (passwordsMatch) return user;
        }
        return null;
      }
    })
  ]
} satisfies NextAuthConfig;
