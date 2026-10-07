import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    modelName: "admin",
  },

  session: {
    modelName: "session",
    fields: {
      userId: "adminId",
    },
  },

  account: {
    modelName: "account",
    fields: {
      userId: "adminId",
    },
  },

  emailAndPassword: {
    enabled: true,
  },
});