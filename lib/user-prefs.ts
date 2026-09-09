"use client"

import { authClient } from "@/lib/auth-client"
import {
  parseWeekStart,
  parseWeightUnit,
  parseWorkoutDays,
  type WeightUnit,
} from "@/lib/units"

export type UserPrefs = {
  weightUnit: WeightUnit
  weekStartsOn: 0 | 1
  workoutDays: number
}

export async function updateUserPrefs(prefs: Partial<UserPrefs>) {
  return authClient.updateUser(prefs)
}

export function useUserPrefs(): UserPrefs & { isPending: boolean } {
  const { data, isPending } = authClient.useSession()
  const user = data?.user

  return {
    isPending,
    weightUnit: parseWeightUnit(user?.weightUnit),
    weekStartsOn: parseWeekStart(user?.weekStartsOn),
    workoutDays: parseWorkoutDays(user?.workoutDays),
  }
}
