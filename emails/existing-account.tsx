import MagicLinkEmail, {
  type MagicLinkEmailProps,
} from "@/emails/magic-link"

export default function ExistingAccountEmail({
  url,
  email,
}: MagicLinkEmailProps) {
  return <MagicLinkEmail url={url} email={email} variant="existing" />
}

ExistingAccountEmail.PreviewProps = {
  url: "https://repo.app/login",
  email: "you@example.com",
} satisfies MagicLinkEmailProps
