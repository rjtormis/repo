"use client"

import { useEffect, useRef, useState } from "react"
import { IconCheck, IconCopy, IconDownload, IconShare2 } from "@tabler/icons-react"
import { availableShareVariants } from "@/components/session/share/build-share-card"
import { ShareCard } from "@/components/session/share/share-card"
import {
  SHARE_STORY_HEIGHT,
  SHARE_STORY_WIDTH,
  type ShareCardData,
  type ShareVariant,
} from "@/components/session/share/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import {
  canShareFiles,
  captureSharePng,
  downloadPng,
  sharePngFile,
} from "@/lib/share-image"
import { cn } from "@/lib/utils"

const PREVIEW_WIDTH = 240
const VARIANT_LABEL: Record<ShareVariant, string> = {
  session: "Session",
  pr: "Personal record",
}

export function ShareSheet({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ShareCardData
}) {
  const variants = availableShareVariants(data)
  const [variant, setVariant] = useState<ShareVariant>("session")
  const cardRefs = useRef<Partial<Record<ShareVariant, HTMLDivElement | null>>>(
    {}
  )
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<"share" | "save" | "copy" | null>(null)
  const [copied, setCopied] = useState(false)
  const [fileShare, setFileShare] = useState(false)
  const selected = variants.includes(variant) ? variant : "session"
  const record = data.record
  const filename =
    selected === "pr" && record
      ? `${slug(record.exerciseName)}-pr-repo.png`
      : `${slug(data.name)}-repo.png`
  const profileUrl = `https://repo.fit/u/${data.handle ?? "you"}`
  const caption =
    selected === "pr" && record
      ? `${record.exerciseName} · ${record.weightAmount} ${record.weightUnit} × ${record.reps}`
      : `${data.name} · ${data.volumeAmount} ${data.volumeUnit}`

  useEffect(() => {
    setFileShare(canShareFiles())
  }, [])

  useEffect(() => {
    if (!open) return
    setVariant("session")
  }, [open])

  useEffect(() => {
    const node = scrollerRef.current
    if (!open || !node) return
    const child = node.querySelector<HTMLElement>(`[data-variant="${selected}"]`)
    child?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    })
  }, [open, selected, variants.length])

  function onScroll() {
    const node = scrollerRef.current
    if (!node) return
    const mid = node.getBoundingClientRect().left + node.clientWidth / 2
    let closest: ShareVariant = variants[0] ?? "session"
    let best = Infinity
    for (const child of node.querySelectorAll<HTMLElement>("[data-variant]")) {
      const box = child.getBoundingClientRect()
      const center = box.left + box.width / 2
      const dist = Math.abs(center - mid)
      if (dist < best) {
        best = dist
        closest = child.dataset.variant as ShareVariant
      }
    }
    setVariant(closest)
  }

  function selectVariant(next: ShareVariant) {
    setVariant(next)
    const child = scrollerRef.current?.querySelector<HTMLElement>(
      `[data-variant="${next}"]`
    )
    child?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }

  async function onShare() {
    const node = cardRefs.current[selected]
    if (!node) return
    setBusy("share")
    try {
      await sharePngFile({
        node,
        filename,
        text: caption,
        url: profileUrl,
      })
    } finally {
      setBusy(null)
    }
  }

  async function onSave() {
    const node = cardRefs.current[selected]
    if (!node) return
    setBusy("save")
    try {
      const png = await captureSharePng(node)
      downloadPng(png, filename)
    } finally {
      setBusy(null)
    }
  }

  async function onCopyLink() {
    setBusy("copy")
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto w-full max-w-lg gap-0 rounded-t-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30"
          aria-hidden
        />
        <SheetHeader className="mb-3 p-0 text-start">
          <SheetTitle className="text-base">Share workout</SheetTitle>
          <SheetDescription className="sr-only">
            Swipe to pick a card, then share or save an image.
          </SheetDescription>
        </SheetHeader>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className={cn(
            "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            variants.length === 1 && "justify-center"
          )}
        >
          {variants.map((item) => (
            <Button
              key={item}
              type="button"
              variant="transparent"
              data-variant={item}
              aria-pressed={item === selected}
              aria-label={VARIANT_LABEL[item]}
              onClick={() => selectVariant(item)}
              className="h-auto min-h-0 snap-center shrink-0 rounded-2xl p-0 text-start whitespace-normal active:translate-y-0"
            >
              <div
                className="relative overflow-hidden rounded-2xl bg-[#0A0A0A]"
                style={{
                  width: PREVIEW_WIDTH,
                  height:
                    PREVIEW_WIDTH * (SHARE_STORY_HEIGHT / SHARE_STORY_WIDTH),
                }}
              >
                <div
                  className="origin-top-left"
                  style={{
                    transform: `scale(${PREVIEW_WIDTH / SHARE_STORY_WIDTH})`,
                  }}
                >
                  <ShareCard
                    data={data}
                    variant={item}
                    cardRef={(node) => {
                      cardRefs.current[item] = node
                    }}
                  />
                </div>
              </div>
              {variants.length > 1 ? (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  {VARIANT_LABEL[item]}
                </p>
              ) : null}
            </Button>
          ))}
        </div>

        {variants.length > 1 ? (
          <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="Share cards">
            {variants.map((item) => (
              <Button
                key={item}
                type="button"
                variant="transparent"
                role="tab"
                aria-selected={item === selected}
                aria-label={VARIANT_LABEL[item]}
                onClick={() => selectVariant(item)}
                className={cn(
                  "min-h-0 rounded-full p-0 transition-[width,background-color] duration-200 ease-[var(--motion-ease-out)] active:translate-y-0",
                  item === selected
                    ? "h-1.5 w-4 bg-foreground"
                    : "size-1.5 bg-muted-foreground/35"
                )}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="ghost-outline"
            className="min-h-11"
            disabled={busy != null}
            onClick={() => {
              void onSave()
            }}
          >
            {busy === "save" ? (
              <Spinner />
            ) : (
              <IconDownload className="size-5" stroke={1.5} />
            )}
            Save image
          </Button>
          {fileShare ? (
            <Button
              className="min-h-11"
              disabled={busy != null}
              onClick={() => {
                void onShare()
              }}
            >
              {busy === "share" ? (
                <Spinner />
              ) : (
                <IconShare2 className="size-5" stroke={1.5} />
              )}
              Share
            </Button>
          ) : (
            <Button
              className="min-h-11"
              disabled={busy != null}
              onClick={() => {
                void onCopyLink()
              }}
            >
              {copied ? (
                <IconCheck className="size-5" stroke={1.5} />
              ) : busy === "copy" ? (
                <Spinner />
              ) : (
                <IconCopy className="size-5" stroke={1.5} />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function slug(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workout"
  )
}
