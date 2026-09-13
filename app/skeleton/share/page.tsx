import { ShareCard } from "@/components/session/share/share-card"
import {
  SHARE_PHOTO_LAYOUTS,
  SHARE_PHOTO_LAYOUT_LABEL,
  type ShareCardData,
} from "@/components/session/share/types"

const SAMPLE: ShareCardData = {
  name: "Push day",
  dateLabel: "Sunday 13 September",
  durationLabel: "48 MIN",
  exerciseCount: 6,
  setCount: 18,
  volumeAmount: "8,240",
  volumeUnit: "kg",
  record: {
    exerciseName: "Bench press",
    detail: "",
    weightAmount: "100",
    weightUnit: "kg",
    reps: 5,
    previous: null,
  },
  heatmap: Array.from({ length: 182 }, () => 1),
  monthsLabel: "Last 6 months",
  streakCount: 4,
  streakUnit: "week",
  handle: "you",
  sessionCount: 22,
}

const PHOTO = "/screenshots/dashboard-mobile.png"

export default function Page() {
  return (
    <div className="min-h-dvh overflow-x-auto bg-black px-4 py-6">
      <div className="flex gap-4">
        {SHARE_PHOTO_LAYOUTS.map((layout) => (
          <figure key={layout} className="shrink-0">
            <ShareCard data={SAMPLE} photoSrc={PHOTO} photoLayout={layout} />
            <figcaption className="mt-2 text-center text-xs text-white/55">
              {SHARE_PHOTO_LAYOUT_LABEL[layout]}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
