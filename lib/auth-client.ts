import { createAuthClient } from "better-auth/react"
import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins"

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(),
    inferAdditionalFields({
      user: {
        weightUnit: {
          type: "string",
          required: false,
          defaultValue: "kg",
        },
        weekStartsOn: {
          type: "number",
          required: false,
          defaultValue: 0,
        },
        workoutDays: {
          type: "number",
          required: false,
          defaultValue: 0,
        },
        totalExp: {
          type: "number",
          required: false,
          defaultValue: 0,
        },
      },
    }),
  ],
})
