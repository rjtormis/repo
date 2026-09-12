import { MuscleSprite } from "@/components/session/muscle-icons"

export {
  MUSCLE_GROUP_FILTERS,
  muscleGroupLabel,
  type MuscleGroupFilter,
} from "@/lib/muscle-groups"

export function MuscleGroupIcon({
  group,
  className,
}: {
  group: string
  className?: string
}) {
  return <MuscleSprite group={group} className={className} />
}
