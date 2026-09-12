import type { Metadata } from "next"
import {
  LegalDocument,
  LegalList,
  LegalMail,
  LegalSection,
} from "@/components/legal/document"

export const metadata: Metadata = {
  title: "Privacy Policy · Repo",
  description: "What Repo collects, why, and what we never do with it.",
}

const UPDATED = "12 September 2026"
const CONTACT = "hello@repo.fit"

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" updated={UPDATED} current="privacy">
      <LegalSection title="The short version">
        <p>
          Repo stores your account details and the workouts you log. That is it.
          We do not sell your data, we do not share it with advertisers, and
          there are no third-party analytics or advertising trackers in the app.
          You can export everything you have logged at any time, and you can
          delete your account and all of its data whenever you want.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>
          <strong>Account information.</strong> Your email address and display
          name. If you sign in with Google, we receive your email, name, and
          profile image from Google. We never see your Google password.
        </p>
        <p>
          <strong>Training data.</strong> The workouts, exercises, sets,
          weights, and repetitions you enter, along with the dates and times you
          logged them.
        </p>
        <p>
          <strong>Preferences.</strong> Your weight unit, the day your week
          starts on, your weekly session target, and your timezone. The timezone
          is used so your workouts appear on the correct day.
        </p>
        <p>
          <strong>Technical information.</strong> Standard server logs from our
          hosting provider, including IP address and browser type. These are
          used to keep the service running and secure, and are retained only
          briefly.
        </p>
      </LegalSection>

      <LegalSection title="What we do not collect">
        <p>
          We do not collect your location, contacts, photos, health data from
          your phone or wearables, or anything from other apps. We do not use
          advertising identifiers, behavioural tracking, or third-party
          analytics scripts.
        </p>
      </LegalSection>

      <LegalSection title="Why we hold it">
        <p>
          Account information exists so you can sign in and so your training is
          available on more than one device. Training data exists because
          showing you what you lifted last time is the entire purpose of the
          app. Preferences exist so the app displays things the way you asked.
        </p>
      </LegalSection>

      <LegalSection title="Who else touches it">
        <p>
          We use a small number of service providers to run Repo. They process
          data on our instructions and are not permitted to use it for their own
          purposes.
        </p>
        <LegalList>
          <li>Supabase — database and authentication, hosted in Singapore.</li>
          <li>Vercel — application hosting and delivery.</li>
          <li>Google — only if you choose to sign in with a Google account.</li>
        </LegalList>
        <p>
          We will never sell, rent, or trade your data. If we are ever legally
          compelled to disclose information, we will tell you unless we are
          prohibited from doing so.
        </p>
      </LegalSection>

      <LegalSection title="Public profiles">
        <p>
          If you choose to make your profile public, the information you have
          opted to display becomes visible to anyone with the link. Profiles are
          private by default and you can make yours private again at any time.
          Share images you generate are yours to post wherever you like.
        </p>
      </LegalSection>

      <LegalSection title="Your control">
        <p>
          You can export all of your data from Settings as a file you keep. You
          can correct your name and preferences at any time. You can delete your
          account from Settings, which removes your account, your workouts, and
          your exercises from our database.
        </p>
        <p>
          Depending on where you live you may have additional rights over your
          personal data, including the right to access it, correct it, or object
          to how it is used. Email us and we will help.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Your training data stays until you delete it or delete your account.
          Server logs are kept for a short period and then discarded. Deleted
          accounts are removed from our systems, though copies may persist in
          routine backups for a limited time before those backups expire.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is encrypted in transit. Passwords are stored hashed, never in
          plain text. No service can promise perfect security, but we keep the
          amount of data we hold small, which is the most effective protection
          we can offer.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Repo is not intended for children under 13, and we do not knowingly
          collect information from them. If you believe a child has created an
          account, contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes in a way that meaningfully affects you, we will
          say so in the app before the change takes effect. The date at the top
          always reflects the current version.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about any of this, or about your data specifically, go to{" "}
          <LegalMail address={CONTACT} />.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
