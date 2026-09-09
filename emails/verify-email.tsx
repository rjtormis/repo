import MagicLinkEmail, {
  type MagicLinkEmailProps,
} from "@/emails/magic-link"

export default function VerifyEmail({ url, email }: MagicLinkEmailProps) {
  return <MagicLinkEmail url={url} email={email} variant="verify" />
}

VerifyEmail.PreviewProps = {
  url: "https://repo.app/auth/verify-email?token=preview",
  email: "you@example.com",
} satisfies MagicLinkEmailProps
