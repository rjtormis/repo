# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: someone who lifts weights 3–6× a week with a varying routine — not on a rigid program, not a beginner who needs coaching.

Secondary skew: developers / technical users. The contribution-graph metaphor is the share hook; they will get it instantly. Design for the primary lifter first; do not design only for the secondary audience.

Situation (logging): standing in a gym, one hand free, 60–90 seconds between sets, phone possibly with no signal, sweaty hands.

Core job: “what did I lift last time on this, so I know what to do now.”

Secondary job (at home): “have I been consistent, and what have I neglected.”

Explicit non-job: telling people what to train. No coaching, no program prescription.

## Product Purpose

Make progressive overload effortless — the user never has to remember or retype what they did before.

Success means: last session’s weight and reps are visible under each set while logging; weight is typed once per exercise; each set is a single tap to confirm; changing weight mid-exercise only affects sets not yet done.

## Positioning

Vs Hevy/Strong: those products model programs and the user deviates from them. This product has no program object. Sessions are free-form, ranked by recency; a “split” is only a pattern in history.

Consistency is a GitHub-style year heatmap that is also history navigation — tapping a square opens that session.

An account is required to use the product. Guest / anonymous logging is not a path.

PWA-specific position: no install required; data exports in one tap.

## Operating Context

- Gym floor: fast, one-handed logging between sets.
- Home: review consistency and neglected work via heatmap/history.
- Standalone PWA: no browser chrome; safe-area insets matter.
- RTL is enabled; layouts must not assume LTR (heatmap direction and right-aligned values).
- Sign-in is required before logging or reviewing history. Current sign-in surface is email magic link; Google OAuth is deferred (“soon”).

## Capabilities and Constraints

### Hard invariants

- Sign-in is required to use the product. There is no “keep using without an account” product path.
- Nothing is ever computed from session names. Names exist only so the user recognizes a card to copy. Every count, streak, square, and stat derives from logged exercises and sets. (Prior bug: name-matching reasoning; this rule is the fix.)
- Storage is per set, never `{weight, reps, sets}`. Must represent 8/8/6, drop sets, and per-set weight changes.
- Never punish. No red, no “you missed,” no “owed,” no streak-breaking guilt. Unmet targets stay hollow and reset weekly.
- Full data export.

### Technical (committed)

- Next.js single app (monorepo removed), pnpm, shadcn preset `b2BnwltWS`.
- Better Auth + Prisma (PostgreSQL) for identity; magic-link email is the live sign-in method.
- RTL enabled; do not assume LTR layout.
- Safe-area insets required for standalone mode.
- `overscroll-behavior-y: contain` on the logging screen.

### Deferred — do not invent

- Notifications, social feed, AI coaching, nutrition, form video.
- Scheduled / day-based programs. Weekly targets, if they ship, are counts, not days.
- Apple / additional social OAuth. Google OAuth is marked coming soon — do not present it as working.

### Open decisions — flag, do not guess

- App name. “Repo” is a suggestion, not a commitment. Folder name does not settle it.
- Offline and local storage. Offline-first IndexedDB is no longer a confirmed invariant now that an account is required; whether logs work with no signal, and whether Prisma or the device is the source of truth, is unset.
- What defines a PR (heaviest weight / best estimated 1RM / most reps at a weight).
- Heatmap square intensity: tonnage vs set count, and fallback for bodyweight and cardio.
- Muscle-group taxonomy and granularity. Grouping by muscle was desired; a coarse strip alongside session cards (plus primary-muscle-only tagging) was proposed but neither is confirmed.
- Whether weekly targets ship in v1 at all.
- Session duration means timing workouts, which means handling someone who forgets to hit Finish.
- Empty state for a brand-new signed-in user.

## Brand Commitments

- Working name: **Repo** (still a candidate, not legally locked).
- Logomark: a compact **contribution heatmap** (5×7 squares, denser toward recent). This is the product’s share hook and differentiator — not gym hardware, not isometric “data cubes.”
- Wordmark: geometric monospace, bold (Geist Mono in product UI).
- Dark lockup ground: `#0A192F`. Heat fills: teal/cyan ramp ending `#E0FFFF`; empty cells stay hollow/muted — never red or punitive.

## Evidence on Hand

No real testimonials, case studies, or marketing assets yet. Future work must not fabricate social proof. Product claims above are product requirements, not published evidence.

## Product Principles

1. **Last-time first** — Logging always surfaces prior weight/reps so progressive overload needs no memory or retyping.
2. **History is the model** — No program object; free-form sessions and patterns in logged sets are the source of truth, never session names.
3. **Per-set fidelity** — Sets are first-class; uneven reps, drops, and mid-exercise weight changes must be representable.
4. **No guilt** — Consistency UI never punishes; unmet targets stay hollow and reset without streak-breaking shame.
5. **Account required** — The product is used signed-in; guest logging is not a path. Export and gym-floor speed still matter; offline behavior is not assumed until decided.

## Accessibility & Inclusion

RTL must be supported correctly (heatmap direction and value alignment). Safe-area and one-handed gym use are product constraints. No additional WCAG target was established beyond usable mobile PWA behavior.
