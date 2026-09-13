"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ConfirmDialogIcon } from "@/components/ui/confirm-dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import {
  deleteAccountSchema,
  type DeleteAccountValues,
} from "@/schema/auth-schema"

export function DeleteAccountDialog({
  open,
  onOpenChange,
  expectedEmail,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  expectedEmail: string
  onDeleted: () => void
}) {
  const deleteEmailId = useId()
  const deletePasswordId = useId()
  const deleteForm = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmEmail: "", password: "" },
  })

  async function onDeleteAccount(values: DeleteAccountValues) {
    if (
      values.confirmEmail.trim().toLowerCase() !== expectedEmail.toLowerCase()
    ) {
      deleteForm.setError("confirmEmail", {
        type: "validate",
        message: "Type your email exactly.",
      })
      return
    }

    const { error } = await authClient.deleteUser({
      password: values.password,
    })
    if (error) {
      const message =
        error.code === "INVALID_PASSWORD"
          ? "Password is wrong."
          : "Couldn’t delete this account. Try again."
      deleteForm.setError("password", {
        type: "server",
        message,
      })
      return
    }
    onOpenChange(false)
    onDeleted()
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) deleteForm.reset()
      }}
    >
      <AlertDialogContent>
        <div className="flex min-w-0 items-start gap-3">
          <ConfirmDialogIcon intent="destructive" />
          <AlertDialogHeader className="min-w-0 flex-1 place-items-start text-start">
            <AlertDialogTitle className="w-full min-w-0 select-none text-start">
              Delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription className="w-full select-none text-start">
              Your sessions, exercises, and this sign-in go with it. Logs live
              on the account — this device will not keep a copy. Type your email
              and password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <form
          onSubmit={deleteForm.handleSubmit(onDeleteAccount)}
          noValidate
          className="grid gap-4"
        >
          <Field data-invalid={!!deleteForm.formState.errors.confirmEmail}>
            <FieldLabel htmlFor={deleteEmailId}>Type your email</FieldLabel>
            <Controller
              name="confirmEmail"
              control={deleteForm.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={deleteEmailId}
                  type="email"
                  autoComplete="off"
                  inputMode="email"
                  className="min-h-11"
                  aria-invalid={!!deleteForm.formState.errors.confirmEmail}
                />
              )}
            />
            <FieldError errors={[deleteForm.formState.errors.confirmEmail]} />
          </Field>
          <Field data-invalid={!!deleteForm.formState.errors.password}>
            <FieldLabel htmlFor={deletePasswordId}>Password</FieldLabel>
            <Controller
              name="password"
              control={deleteForm.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id={deletePasswordId}
                  type="password"
                  autoComplete="current-password"
                  className="min-h-11"
                  aria-invalid={!!deleteForm.formState.errors.password}
                />
              )}
            />
            <FieldError errors={[deleteForm.formState.errors.password]} />
          </Field>
          <AlertDialogFooter className="grid grid-cols-2">
            <AlertDialogCancel
              variant="ghost-outline"
              className="min-h-11 w-full"
              disabled={deleteForm.formState.isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive-solid"
              className="min-h-11 w-full"
              disabled={deleteForm.formState.isSubmitting}
            >
              {deleteForm.formState.isSubmitting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
