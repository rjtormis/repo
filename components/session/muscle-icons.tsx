import { cn } from "@/lib/utils"

const COLS = 4
const ROWS = 4
const SPRITE = "/muscle-groups.png?v=5"

/** Column, row in the 4×4 sheet. */
const POSITION: Record<string, readonly [number, number]> = {
  CHEST: [0, 0],
  ABDOMINALS: [1, 0],
  BACK: [2, 0],
  TRAPEZIUS: [3, 0],
  SHOULDERS: [0, 1],
  BICEPS: [1, 1],
  TRICEPS: [2, 1],
  FOREARMS: [3, 1],
  GLUTES: [0, 2],
  HIP_FLEXORS: [1, 2],
  QUADRICEPS: [2, 2],
  HAMSTRINGS: [3, 2],
  ADDUCTORS: [0, 3],
  ABDUCTORS: [1, 3],
  CALVES: [2, 3],
  SHINS: [3, 3],
}

export function MuscleSprite({
  group,
  className,
}: {
  group: string
  className?: string
}) {
  const [col, row] = POSITION[group] ?? POSITION.CHEST
  return (
    <span
      aria-hidden
      className={cn("block size-6 shrink-0 bg-no-repeat dark:invert", className)}
      style={{
        backgroundImage: `url(${SPRITE})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
      }}
    />
  )
}
