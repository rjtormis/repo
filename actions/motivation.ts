import { prisma } from "@/lib/prisma"

// ===== GET =====

export const getOrCreateDailyMotivation = async ({
  userId,
  date,
}: {
  userId: string
  date: string
}) => {
  const formattedDate = new Date(`${date}T00:00:00.000Z`)
  const [checkMessage] = await Promise.all([
    await prisma.motivationMessageDaily.findFirst({
      where: {
        date: formattedDate,
        userId,
      },
      select: {
        motivationMessages: true,
      },
    }),
  ])

  if (!checkMessage) {
    const count = await prisma.motivationMessage.count()

    const picked = await prisma.motivationMessage.findMany({
      take: 1,
      skip: Math.floor(Math.random() * count),
    })

    const createMessage = await prisma.motivationMessageDaily.create({
      data: {
        userId: userId,
        motivationMessageId: picked[0].id,
        date: formattedDate,
      },
      select: {
        motivationMessages: true,
      },
    })

    return createMessage
  }

  return checkMessage
}
