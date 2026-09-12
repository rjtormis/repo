"use client"

import { useState } from "react"
import { PickupList } from "@/components/home/pickup-list"
import { PrList } from "@/components/home/pr-list"
import type { PersonalRecord, SessionCard } from "@/components/home/types"
import { Segmented } from "@/components/ui/segmented"
import type { WeightUnit } from "@/lib/units"

export function HistoryPager({
  cards,
  records,
  unit,
}: {
  cards: SessionCard[]
  records: PersonalRecord[]
  unit: WeightUnit
}) {
  const [page, setPage] = useState<"workouts" | "records">("workouts")

  return (
    <section className="mb-4">
      <Segmented
        aria-label="Workouts or records"
        value={page}
        onChange={setPage}
        options={[
          { value: "workouts", label: "Workouts" },
          { value: "records", label: "Records" },
        ]}
        className="mb-4"
      />
      {page === "workouts" ? (
        cards.length > 0 ? (
          <PickupList cards={cards} />
        ) : (
          <p className="rounded-xl bg-surface-1 px-3.5 py-3.5 text-sm text-muted-foreground">
            Finished workouts show up here so you can run them again.
          </p>
        )
      ) : (
        <PrList records={records} unit={unit} />
      )}
    </section>
  )
}
