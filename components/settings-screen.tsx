"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconCamera, IconLoader2, IconMinus, IconPlus } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Controller, useForm } from "react-hook-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Segmented } from "@/components/ui/segmented"
import { Separator } from "@/components/ui/separator"
import { SubpageHeader } from "@/components/subpage-header"
import { exercises, pastSessions } from "@/lib/demo-data"
import { authClient } from "@/lib/auth-client"
import { updateUserPrefs, useUserPrefs } from "@/lib/user-prefs"
import { cn } from "@/lib/utils"
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateNameSchema,
  type ChangePasswordValues,
  type DeleteAccountValues,
  type UpdateNameValues,
} from "@/schema/auth-schema"

const AVATAR_PX = 256
const MAX_SOURCE_BYTES = 8 * 1024 * 1024
const MAX_AVATAR_BYTES = 350_000

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.trim()
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "?").toUpperCase()
}

function displayName(name: string | undefined, email: string) {
  return name?.trim() || email.split("@")[0] || email
}

async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Use a JPEG, PNG, or WebP photo.")
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Photo is too large. Keep it under 8 MB.")
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("Couldn’t use that photo. Try a JPEG, PNG, or WebP.")
  }
  const canvas = document.createElement("canvas")
  canvas.width = AVATAR_PX
  canvas.height = AVATAR_PX
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    throw new Error("Couldn’t process that photo.")
  }

  const scale = Math.max(AVATAR_PX / bitmap.width, AVATAR_PX / bitmap.height)
  const drawW = bitmap.width * scale
  const drawH = bitmap.height * scale
  ctx.drawImage(
    bitmap,
    (AVATAR_PX - drawW) / 2,
    (AVATAR_PX - drawH) / 2,
    drawW,
    drawH
  )
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => {
        if (!next) {
          reject(new Error("Couldn’t process that photo."))
          return
        }
        resolve(next)
      },
      "image/jpeg",
      0.82
    )
  })

  if (blob.size > MAX_AVATAR_BYTES) {
    throw new Error("Photo is still too large. Try a simpler shot.")
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Couldn’t read that photo."))
        return
      }
      resolve(reader.result)
    }
    reader.onerror = () => reject(new Error("Couldn’t read that photo."))
    reader.readAsDataURL(blob)
  })
}

function exportLogs() {
  const payload = {
    exportedAt: new Date().toISOString(),
    exercises,
    sessions: pastSessions,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "repo-export.json"
  link.click()
  URL.revokeObjectURL(url)
}

function SettingsSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("mt-8 first-of-type:mt-1", className)}>
      <h2 className="mb-2 px-1 text-xs font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function SettingsRow({
  title,
  detail,
  children,
}: {
  title: string
  detail: string
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-lg px-1">
      <div className="min-w-0 flex-1">
        <p className="text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {children}
    </div>
  )
}

function SettingsBlock({
  title,
  detail,
  children,
}: {
  title: string
  detail: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 px-1 py-2.5">
      <div>
        <p className="text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {children}
    </div>
  )
}

function AppearanceControl() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const value =
    mounted && (theme === "light" || theme === "dark" || theme === "system")
      ? theme
      : "system"

  return (
    <SettingsBlock title="Appearance" detail="Light, dark, or follow the device">
      <Segmented
        aria-label="Appearance"
        value={value}
        disabled={!mounted}
        onChange={setTheme}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
    </SettingsBlock>
  )
}

function LoggingPrefs() {
  const prefs = useUserPrefs()
  const [saving, setSaving] = useState<"unit" | "week" | "target" | null>(null)
  const weeklyTarget = prefs.workoutDays > 0 ? prefs.workoutDays : 5

  async function save(next: Parameters<typeof updateUserPrefs>[0], key: typeof saving) {
    setSaving(key)
    await updateUserPrefs(next)
    setSaving(null)
  }

  return (
    <>
      <SettingsBlock title="Units" detail="How weights show while you log">
        <Segmented
          aria-label="Weight units"
          value={prefs.weightUnit}
          disabled={prefs.isPending || saving === "unit"}
          onChange={(weightUnit) => save({ weightUnit }, "unit")}
          options={[
            { value: "kg", label: "kg" },
            { value: "lb", label: "lb" },
          ]}
        />
      </SettingsBlock>

      <SettingsBlock
        title="Week starts"
        detail="First column on the heatmap"
      >
        <Segmented
          aria-label="Week start day"
          value={prefs.weekStartsOn === 1 ? "1" : "0"}
          disabled={prefs.isPending || saving === "week"}
          onChange={(value) =>
            save({ weekStartsOn: value === "1" ? 1 : 0 }, "week")
          }
          options={[
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
          ]}
        />
      </SettingsBlock>

      <SettingsRow
        title="Weekly target"
        detail="Sessions you want to log each week"
      >
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Decrease weekly target"
            disabled={prefs.isPending || weeklyTarget <= 1 || saving === "target"}
            onClick={() =>
              save({ workoutDays: Math.max(1, weeklyTarget - 1) }, "target")
            }
          >
            <IconMinus className="size-4" stroke={1.5} />
          </Button>
          <span className="w-8 text-center font-mono text-[15px] tabular-nums">
            {weeklyTarget}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Increase weekly target"
            disabled={prefs.isPending || weeklyTarget >= 7 || saving === "target"}
            onClick={() =>
              save({ workoutDays: Math.min(7, weeklyTarget + 1) }, "target")
            }
          >
            <IconPlus className="size-4" stroke={1.5} />
          </Button>
        </div>
      </SettingsRow>
    </>
  )
}

function AccountSettings({
  deleteOpen,
  onDeleteOpenChange,
}: {
  deleteOpen: boolean
  onDeleteOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const fileInputId = useId()
  const nameId = useId()
  const currentPasswordId = useId()
  const newPasswordId = useId()
  const confirmPasswordId = useId()
  const deleteEmailId = useId()
  const deletePasswordId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const nameForm = useForm<UpdateNameValues>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: "" },
  })
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  const deleteForm = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmEmail: "", password: "" },
  })

  const savedName = user?.name ?? ""
  const savedImage = user?.image ?? null

  useEffect(() => {
    nameForm.reset({ name: savedName })
  }, [nameForm, savedName])

  useEffect(() => {
    setPhotoPreview(savedImage)
  }, [savedImage])

  const nameValue = nameForm.watch("name")
  const nameDirty =
    nameValue.trim() !== savedName.trim() && nameValue.trim() !== ""

  const email = user?.email ?? ""
  const shownName = user ? displayName(user.name, user.email) : ""
  const avatarSrc = photoPreview || user?.image || undefined

  async function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setPhotoError("")
    setPhotoBusy(true)
    const previous = photoPreview
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setPhotoPreview(dataUrl)
      const { error } = await authClient.updateUser({ image: dataUrl })
      if (error) {
        setPhotoPreview(previous)
        setPhotoError("Couldn’t save that photo. Try another.")
        return
      }
      router.refresh()
    } catch (caught) {
      setPhotoPreview(previous)
      setPhotoError(
        caught instanceof Error ? caught.message : "Couldn’t use that photo."
      )
    } finally {
      setPhotoBusy(false)
    }
  }

  async function onSaveName(values: UpdateNameValues) {
    const { error } = await authClient.updateUser({ name: values.name })
    if (error) {
      nameForm.setError("name", {
        type: "server",
        message: "Couldn’t save that name. Try again.",
      })
      return
    }
    nameForm.reset({ name: values.name })
    router.refresh()
  }

  async function onChangePassword(values: ChangePasswordValues) {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    })
    if (error) {
      const message =
        error.code === "INVALID_PASSWORD"
          ? "Current password is wrong."
          : error.code === "PASSWORD_TOO_SHORT"
            ? "Use at least 8 characters."
            : "Couldn’t update the password. Try again."
      passwordForm.setError("currentPassword", {
        type: "server",
        message,
      })
      return
    }
    passwordForm.reset()
    setChangingPassword(false)
  }

  async function onDeleteAccount(values: DeleteAccountValues) {
    if (values.confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
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
    onDeleteOpenChange(false)
    router.replace("/login")
    router.refresh()
  }

  const deleteDialog = (
    <AlertDialog
      open={deleteOpen}
      onOpenChange={(open) => {
        onDeleteOpenChange(open)
        if (!open) deleteForm.reset()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your sessions, exercises, and this sign-in go with it. Logs live on
            the account — this device will not keep a copy. Type your email and
            password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteForm.formState.isSubmitting}
            >
              {deleteForm.formState.isSubmitting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )

  if (isPending) {
    return (
      <>
        <SettingsSection title="Account">
          <div className="flex items-center gap-4 px-1 py-3" aria-hidden>
            <div className="size-16 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-28 rounded-sm bg-muted" />
              <div className="h-2.5 w-40 rounded-sm bg-muted" />
            </div>
          </div>
        </SettingsSection>
        {deleteDialog}
      </>
    )
  }

  if (!user) return deleteDialog

  return (
    <>
      <SettingsSection title="Account">
        <div className="flex items-center gap-4 px-1 py-3">
          <input
            ref={fileRef}
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={onPhotoChange}
          />
          <button
            type="button"
            className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Change photo"
            disabled={photoBusy}
            onClick={() => fileRef.current?.click()}
          >
            <Avatar className="size-16">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt={shownName} />
              ) : null}
              <AvatarFallback className="text-base">
                {initialsFrom(shownName, email)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute end-0 bottom-0 flex size-7 items-center justify-center rounded-full border border-border bg-surface-2 text-secondary-foreground ring-2 ring-background">
              {photoBusy ? (
                <IconLoader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <IconCamera className="size-3.5" stroke={1.6} aria-hidden />
              )}
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px]">{shownName}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {email}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Used to sign in. Changing it isn’t available yet.
            </p>
            {photoError ? (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {photoError}
              </p>
            ) : null}
          </div>
        </div>

        <form
          className="px-1 pt-1"
          onSubmit={nameForm.handleSubmit(onSaveName)}
          noValidate
        >
          <Field data-invalid={!!nameForm.formState.errors.name}>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <div className="flex items-start gap-2">
              <Controller
                name="name"
                control={nameForm.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id={nameId}
                    autoComplete="name"
                    className="min-h-11"
                    aria-invalid={!!nameForm.formState.errors.name}
                  />
                )}
              />
              {nameDirty || nameForm.formState.isSubmitting ? (
                <Button
                  type="submit"
                  className="min-h-11"
                  disabled={nameForm.formState.isSubmitting}
                >
                  {nameForm.formState.isSubmitting ? (
                    <IconLoader2 className="size-4.5 animate-spin" aria-hidden />
                  ) : (
                    "Save"
                  )}
                </Button>
              ) : null}
            </div>
            <FieldError errors={[nameForm.formState.errors.name]} />
          </Field>
        </form>

        <SettingsRow title="Password" detail="Change the password for this email">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            aria-expanded={changingPassword}
            onClick={() => {
              setChangingPassword((open) => !open)
              passwordForm.reset()
            }}
          >
            {changingPassword ? "Cancel" : "Change"}
          </Button>
        </SettingsRow>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            changingPassword ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <form
              className="px-1 pb-2 pt-1"
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
              noValidate
              hidden={!changingPassword}
            >
              <FieldGroup className="gap-4">
                <Field
                  data-invalid={!!passwordForm.formState.errors.currentPassword}
                >
                  <FieldLabel htmlFor={currentPasswordId}>
                    Current password
                  </FieldLabel>
                  <Controller
                    name="currentPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id={currentPasswordId}
                        type="password"
                        autoComplete="current-password"
                        className="min-h-11"
                        aria-invalid={
                          !!passwordForm.formState.errors.currentPassword
                        }
                      />
                    )}
                  />
                  <FieldError
                    errors={[passwordForm.formState.errors.currentPassword]}
                  />
                </Field>
                <Field
                  data-invalid={!!passwordForm.formState.errors.newPassword}
                >
                  <FieldLabel htmlFor={newPasswordId}>New password</FieldLabel>
                  <Controller
                    name="newPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id={newPasswordId}
                        type="password"
                        autoComplete="new-password"
                        className="min-h-11"
                        aria-invalid={
                          !!passwordForm.formState.errors.newPassword
                        }
                      />
                    )}
                  />
                  <FieldError
                    errors={[passwordForm.formState.errors.newPassword]}
                  />
                </Field>
                <Field
                  data-invalid={!!passwordForm.formState.errors.confirmPassword}
                >
                  <FieldLabel htmlFor={confirmPasswordId}>
                    Confirm new
                  </FieldLabel>
                  <Controller
                    name="confirmPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id={confirmPasswordId}
                        type="password"
                        autoComplete="new-password"
                        className="min-h-11"
                        aria-invalid={
                          !!passwordForm.formState.errors.confirmPassword
                        }
                      />
                    )}
                  />
                  <FieldError
                    errors={[passwordForm.formState.errors.confirmPassword]}
                  />
                </Field>
                <Button
                  type="submit"
                  className="min-h-11 w-full"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <IconLoader2
                        className="size-4.5 animate-spin"
                        data-icon="inline-start"
                        aria-hidden
                      />
                      Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Plan">
        <SettingsRow title="Free" detail="Logs, heatmap, and export">
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-secondary-foreground">
            Current
          </span>
        </SettingsRow>
      </SettingsSection>

      {deleteDialog}
    </>
  )
}

export function SettingsScreen() {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden pb-8">
      <SubpageHeader title="Settings" menu={false} />

      <AccountSettings
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
      />

      <SettingsSection title="Training">
        <LoggingPrefs />
      </SettingsSection>

      <SettingsSection title="App">
        <AppearanceControl />
        <SettingsRow title="Export" detail="Download your sessions and exercises">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={exportLogs}
          >
            Export
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection className="mt-12" title="Danger">
        <Separator className="mb-3" />
        <SettingsRow
          title="Delete account"
          detail="Removes your sessions, exercises, and this sign-in. Nothing stays on this device."
        >
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  )
}
