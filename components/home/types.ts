export type SessionCard = {
  id: string
  name: string
  exercises: string[]
  exerciseCount: number
  setCount: number
  lastDoneAt: string
}

export type ActiveSession = {
  id: string
  name: string
  startedAt: number
}

export type WeeklyTarget = {
  done: number
  goal: number
  daysLeft: number
}
