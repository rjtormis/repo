import type { Metadata } from "next"
import {
  LegalDocument,
  LegalList,
  LegalMail,
  LegalSection,
} from "@/components/legal/document"
import { SITE } from "@/lib/meta-data"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The rules for using ${SITE.name}.`,
  alternates: { canonical: "/terms" },
}

const UPDATED = "12 September 2026"
const CONTACT = "hello@repo.fit"
const JURISDICTION = "the Philippines"

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated={UPDATED}
      current="terms"
    >
      <LegalSection title="Using Repo">
        <p>
          By creating an account or using Repo, you agree to these terms. If you
          do not agree with them, please do not use the service.
        </p>
        <p>
          You need to be at least 13 years old to use Repo. If you are under the
          age of majority where you live, you should have a parent or guardian
          review these terms with you.
        </p>
      </LegalSection>

      <LegalSection title="Repo is not a coach">
        <p>
          Repo records what you tell it. It does not assess your technique,
          prescribe training, or provide medical, physiotherapy, nutritional, or
          professional fitness advice. Any figures it shows you — estimated
          one-rep maxes, volume totals, records — are calculated from the
          numbers you entered and are informational only.
        </p>
        <p>
          Strength training carries a risk of injury. You are responsible for
          deciding what is safe for you, and for seeking qualified advice before
          starting or changing a training programme, particularly if you have an
          existing injury or medical condition. Do not rely on Repo to tell you
          what you should lift.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          Keep your login details to yourself. You are responsible for activity
          that happens under your account. Tell us promptly if you think someone
          else has access to it.
        </p>
        <p>
          Provide accurate information when you sign up, and keep it current so
          we can reach you if something goes wrong.
        </p>
      </LegalSection>

      <LegalSection title="Your data belongs to you">
        <p>
          The workouts you log are yours. We claim no ownership over them. You
          can export them at any time and take them elsewhere.
        </p>
        <p>
          You give us only the permission we need to operate the service —
          storing your data, showing it back to you, and displaying anything you
          have explicitly chosen to make public.
        </p>
      </LegalSection>

      <LegalSection title="Fair use">
        <p>Please do not use Repo to:</p>
        <LegalList>
          <li>break any law that applies to you</li>
          <li>access another person&rsquo;s account or data</li>
          <li>
            scrape, overload, probe, or otherwise interfere with the service or
            its infrastructure
          </li>
          <li>
            publish content through a public profile that is abusive, harassing,
            or infringes someone else&rsquo;s rights
          </li>
          <li>resell or redistribute the service as your own</li>
        </LegalList>
        <p>
          We may suspend or close accounts that do these things, usually after
          warning you first unless the situation is serious.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          Repo is provided as it is. We work to keep it running, but we do not
          guarantee it will be uninterrupted, error-free, or permanently
          available. Features may change, and parts of the service may be
          modified or withdrawn.
        </p>
        <p>
          Export your data periodically if it matters to you. It is the simplest
          protection against any service, including this one, losing something.
        </p>
      </LegalSection>

      <LegalSection title="Paid features">
        <p>
          Some features may require a subscription. Prices, billing intervals,
          and what is included will be shown clearly before you pay. You can
          cancel at any time and keep access until the end of the period you
          have paid for. Unless the law where you live says otherwise, payments
          already made are not refundable.
        </p>
        <p>
          Cancelling a subscription does not delete your account or your
          training history. Free features remain available to you.
        </p>
      </LegalSection>

      <LegalSection title="Ending things">
        <p>
          You can delete your account from Settings at any time, for any reason.
        </p>
        <p>
          We may suspend or terminate an account that breaches these terms, or
          if we discontinue the service. If we shut Repo down, we will give
          reasonable notice and time to export your data.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the extent the law allows, we are not liable for indirect or
          consequential losses arising from your use of Repo, including lost
          data, lost profits, or injury sustained while training. Nothing here
          excludes liability that cannot legally be excluded.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms. If a change materially affects you, we will
          give notice in the app before it takes effect. Continuing to use Repo
          after that means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of {JURISDICTION}, without regard
          to conflict of law provisions.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Anything unclear, write to <LegalMail address={CONTACT} />.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
