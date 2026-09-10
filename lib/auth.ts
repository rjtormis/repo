import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { magicLink } from "better-auth/plugins"
import { Resend } from "resend"
import ExistingAccountEmail from "@/emails/existing-account"
import MagicLinkEmail from "@/emails/magic-link"
import VerifyEmail from "@/emails/verify-email"
import { prisma } from "./prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      weightUnit: {
        type: "string",
        defaultValue: "kg",
        required: false,
      },
      weekStartsOn: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
      workoutDays: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
      totalExp: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }) => {
      const origin = process.env.BETTER_AUTH_URL?.replace(/\/$/, "")
      if (!origin) {
        throw new Error("BETTER_AUTH_URL is not set")
      }

      const { error } = await resend.emails.send({
        from: "noreply@repo.fit",
        to: user.email,
        subject: "You already have an account",
        react: ExistingAccountEmail({
          url: `${origin}/login`,
          email: user.email,
        }),
      })

      if (error) {
        throw new Error(error.message)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: "noreply@repo.fit",
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ url, email: user.email }),
      })

      if (error) {
        throw new Error(error.message)
      }
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { error } = await resend.emails.send({
          from: "noreply@repo.fit",
          to: email,
          subject: "Sign in to Repo",
          react: MagicLinkEmail({ url, email }),
        })

        if (error) {
          throw new Error(error.message)
        }
      },
    }),
    nextCookies(),
  ],
})
