import "dotenv/config"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Client } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "migrations")

async function seedExerciseCatalog(databaseUrl: string) {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    const catalog = readFileSync(
      join(migrationsDir, "20260908114100_seed_exercise_catalog/migration.sql"),
      "utf8"
    )
    await client.query(catalog)

    const commonAndClubbell = readFileSync(
      join(
        migrationsDir,
        "20260912120000_exercise_common_and_clubbell_fix/migration.sql"
      ),
      "utf8"
    )
    await client.query(commonAndClubbell)

    const { rows } = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM "exercise"'
    )
    return Number(rows[0]?.count ?? 0)
  } finally {
    await client.end()
  }
}

const messages: {
  lead: string
  accent: string
  author?: string
  source?: string
}[] = [
  { lead: "Rest is part of the", accent: "plan." },
  { lead: "Your future self is", accent: "watching." },
  { lead: "Nothing gets easier, you get", accent: "stronger." },
  { lead: "Log it before you forget", accent: "it." },
  { lead: "Warm up, then find", accent: "out." },
  { lead: "The hardest set is the", accent: "first." },
  { lead: "Motivation is optional. Attendance", accent: "isn't." },
  { lead: "Yesterday's max is today's", accent: "working weight." },
  { lead: "Move the number, however", accent: "small." },
  { lead: "You can always do", accent: "something." },
  { lead: "Deloads are training", accent: "too." },
  { lead: "Chase the number, not the", accent: "feeling." },
  { lead: "Empty bar, honest", accent: "start." },
  { lead: "Not every day is a", accent: "PR." },
  { lead: "The plan survives contact", accent: "sometimes." },
  { lead: "Half a session beats", accent: "none." },
  { lead: "Leave one rep in the", accent: "tank." },
  { lead: "Finish what you", accent: "started." },
  { lead: "Consistency is the whole", accent: "secret." },
  { lead: "Come back on", accent: "Monday." },
  { lead: "Tired is not", accent: "injured." },
  { lead: "The weight is just", accent: "information." },
  { lead: "Track it or it didn't", accent: "happen." },
  { lead: "Strong takes", accent: "years." },
  { lead: "Nobody starts", accent: "strong." },
  { lead: "One good rep, then", accent: "another." },
  { lead: "Your grid is your", accent: "receipt." },
  { lead: "Train, don't", accent: "perform." },
  { lead: "The gym doesn't check your", accent: "mood." },
  { lead: "Numbers go up", accent: "slowly." },
  {
    lead: "The impediment to action",
    accent: "advances action.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "Waste no more time arguing what a good man is.",
    accent: "Be one.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "Confine yourself to the",
    accent: "present.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "If it is endurable, then",
    accent: "endure it.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "Difficulties strengthen the mind, as labor does the",
    accent: "body.",
    author: "Seneca",
    source: "Letters from a Stoic",
  },
  {
    lead: "We suffer more often in imagination than in",
    accent: "reality.",
    author: "Seneca",
    source: "Letters from a Stoic",
  },
  {
    lead: "It is not that we have a short time to live, but that we waste much of",
    accent: "it.",
    author: "Seneca",
    source: "On the Shortness of Life",
  },
  {
    lead: "He who is brave is",
    accent: "free.",
    author: "Seneca",
    source: "Letters from a Stoic",
  },
  {
    lead: "First say what you would be; then do what you have to",
    accent: "do.",
    author: "Epictetus",
    source: "Discourses",
  },
  {
    lead: "No man is free who is not master of",
    accent: "himself.",
    author: "Epictetus",
    source: "Discourses",
  },
  {
    lead: "How long will you wait before you demand the best for",
    accent: "yourself?",
    author: "Epictetus",
    source: "Discourses",
  },
  {
    lead: "Don't explain your philosophy.",
    accent: "Embody it.",
    author: "Epictetus",
    source: "Discourses",
  },
  {
    lead: "It is not the critic who",
    accent: "counts.",
    author: "Theodore Roosevelt",
    source: "Citizenship in a Republic, 1910",
  },
  {
    lead: "If there is no struggle, there is no",
    accent: "progress.",
    author: "Frederick Douglass",
    source: "West India Emancipation, 1857",
  },
  {
    lead: "That which does not kill us makes us",
    accent: "stronger.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols",
  },
  {
    lead: "How much time he gains who does not look to see what his neighbour",
    accent: "says or does.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "Everything we hear is an opinion, not a",
    accent: "fact.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "If any man despises me, that is his",
    accent: "problem.",
    author: "Marcus Aurelius",
    source: "Meditations",
  },
  {
    lead: "It is the power of the mind to be",
    accent: "unconquerable.",
    author: "Seneca",
    source: "Letters from a Stoic",
  },
  {
    lead: "A gem cannot be polished without",
    accent: "friction.",
    author: "Seneca",
    source: "attributed",
  },
  {
    lead: "If you want to improve, be content to be thought foolish and",
    accent: "stupid.",
    author: "Epictetus",
    source: "Enchiridion",
  },
  {
    lead: "Seek not that things happen as you wish, but wish things to be as they",
    accent: "are.",
    author: "Epictetus",
    source: "Enchiridion",
  },
  { lead: "Nobody in here is watching", accent: "you." },
  { lead: "Their opinion isn't lifting the", accent: "bar." },
  { lead: "Be the one who kept", accent: "showing up." },
  { lead: "You against yesterday. That's the whole", accent: "contest." },
  { lead: "Comparison is a", accent: "distraction." },
  { lead: "Quiet work beats loud", accent: "plans." },
  { lead: "Let the numbers do the", accent: "arguing." },
  { lead: "Nobody's coming to do it for", accent: "you." },
  { lead: "Weak excuses, heavy", accent: "bar." },
  { lead: "Doubt is not a", accent: "reason to stop." },
  { lead: "Earn it every single", accent: "week." },
  { lead: "The only rep that counts is the one you", accent: "did." },
]

async function main() {
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL is not set")
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })

  try {
    const exerciseCount = await seedExerciseCatalog(databaseUrl)
    console.log(`Seeded exercise catalog (${exerciseCount} rows).`)

    for (const message of messages) {
      await prisma.motivationMessage.upsert({
        where: {
          lead_accent: {
            lead: message.lead,
            accent: message.accent,
          },
        },
        update: {
          author: message.author ?? null,
          source: message.source ?? null,
        },
        create: {
          lead: message.lead,
          accent: message.accent,
          author: message.author,
          source: message.source,
        },
      })
    }

    console.log(`Seeded ${messages.length} motivation messages.`)

    const offsets = [2, 5, 9, 13, 18, 23, 28, 34]
    const users = await prisma.user.findMany({ select: { id: true } })
    let spread = 0

    for (const user of users) {
      const sessions = await prisma.workoutSession.findMany({
        where: {
          userId: user.id,
          exercises: { some: { workoutSets: { some: {} } } },
        },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })

      for (const [index, row] of sessions.entries()) {
        const daysAgo = offsets[index] ?? 40 + (index - offsets.length) * 5
        const at = new Date()
        at.setHours(18, 0, 0, 0)
        at.setDate(at.getDate() - daysAgo)
        await prisma.workoutSession.update({
          where: { id: row.id },
          data: { startedAt: at, updatedAt: at },
        })
        spread += 1
      }
    }

    if (spread > 0) {
      console.log(`Spread ${spread} workout sessions across recent weeks.`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
