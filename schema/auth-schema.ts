import { z } from "zod"

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .pipe(z.email("That doesn’t look like an email address.")),
  password: z.string().min(1, "Enter a password."),
})

export const signUpSchema = authSchema.extend({
  password: z
    .string()
    .min(1, "Enter a password.")
    .min(8, "Use at least 8 characters."),
})

export const updateNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name.")
    .max(80, "Keep it under 80 characters."),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(1, "Enter a new password.")
      .min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don’t match.",
    path: ["confirmPassword"],
  })

export const deleteAccountSchema = z.object({
  confirmEmail: z.string().min(1, "Type your email to confirm."),
  password: z.string().min(1, "Enter your password."),
})

export type AuthValues = z.infer<typeof authSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type UpdateNameValues = z.infer<typeof updateNameSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>
