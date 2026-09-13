"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconPhoto,
  IconShare2,
  IconX,
} from "@tabler/icons-react"
import { availableShareVariants } from "@/components/session/share/build-share-card"
import { ShareCard } from "@/components/session/share/share-card"
import {
  SHARE_PHOTO_LAYOUTS,
  SHARE_PHOTO_LAYOUT_LABEL,
  SHARE_STORY_HEIGHT,
  SHARE_STORY_WIDTH,
  type ShareCardData,
  type SharePhotoLayout,
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
import { photoFileToCoverUrl } from "@/lib/share-photo"
import { cn } from "@/lib/utils"

const PREVIEW_WIDTH = 240
const VARIANT_LABEL: Record<ShareVariant, string> = {
  session: "Session",
  pr: "Personal record",
}

type ShareSlide = {
  id: string
  label: string
  variant: ShareVariant
  layout?: SharePhotoLayout
}

function shareSlides(data: ShareCardData, photoSrc: string | null): ShareSlide[] {
  if (!photoSrc) {
    return availableShareVariants(data).map((variant) => ({
      id: variant,
      label: VARIANT_LABEL[variant],
      variant,
    }))
  }

  const slides: ShareSlide[] = SHARE_PHOTO_LAYOUTS.map((layout) => ({
    id: `photo-${layout}`,
    label: SHARE_PHOTO_LAYOUT_LABEL[layout],
    variant: "session",
    layout,
  }))
  if (data.record) {
    slides.push({
      id: "photo-pr",
      label: "Record",
      variant: "pr",
      layout: "dock",
    })
  }
  return slides
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
  const [slideId, setSlideId] = useState("session")
  const cardRefs = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  const scrollerRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<"share" | "save" | "copy" | "photo" | null>(
    null
  )
  const [copied, setCopied] = useState(false)
  const [fileShare, setFileShare] = useState(false)
  const [photoSrc, setPhotoSrc] = useState<string | null>(null)
  const slides = shareSlides(data, photoSrc)
  const selected = slides.find((slide) => slide.id === slideId) ?? slides[0]
  const record = data.record
  const filename =
    selected?.variant === "pr" && record
      ? `${slug(record.exerciseName)}-pr-repo.png`
      : `${slug(data.name)}-repo.png`
  const profileUrl = `https://repo.fit/u/${data.handle ?? "you"}`
  const caption =
    selected?.variant === "pr" && record
      ? `${record.exerciseName} · ${record.weightAmount} ${record.weightUnit} × ${record.reps}`
      : `${data.name} · ${data.volumeAmount} ${data.volumeUnit}`

  useEffect(() => {
    setFileShare(canShareFiles())
  }, [])

  useEffect(() => {
    if (!open) return
    setPhotoSrc(null)
    setSlideId("session")
  }, [open])

  useEffect(() => {
    const node = scrollerRef.current
    if (!open || !node || !selected) return
    const child = node.querySelector<HTMLElement>(`[data-slide="${selected.id}"]`)
    child?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    })
  }, [open, selected, slides.length])

  function onScroll() {
    const node = scrollerRef.current
    if (!node) return
    const mid = node.getBoundingClientRect().left + node.clientWidth / 2
    let closest = slides[0]?.id ?? "session"
    let best = Infinity
    for (const child of node.querySelectorAll<HTMLElement>("[data-slide]")) {
      const box = child.getBoundingClientRect()
      const center = box.left + box.width / 2
      const dist = Math.abs(center - mid)
      if (dist < best) {
        best = dist
        closest = child.dataset.slide ?? closest
      }
    }
    setSlideId(closest)
  }

  function selectSlide(next: string) {
    setSlideId(next)
    const child = scrollerRef.current?.querySelector<HTMLElement>(
      `[data-slide="${next}"]`
    )
    child?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }

  async function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setBusy("photo")
    try {
      setPhotoSrc(await photoFileToCoverUrl(file))
      setSlideId("photo-dock")
    } finally {
      setBusy(null)
    }
  }

  async function onShare() {
    const node = selected ? cardRefs.current[selected.id] : null
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
    const node = selected ? cardRefs.current[selected.id] : null
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
            slides.length === 1 && "justify-center"
          )}
        >
          {slides.map((slide) => (
            <Button
              key={slide.id}
              type="button"
              variant="transparent"
              data-slide={slide.id}
              aria-pressed={slide.id === selected?.id}
              aria-label={slide.label}
              onClick={() => selectSlide(slide.id)}
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
                    variant={slide.variant}
                    photoSrc={photoSrc}
                    photoLayout={slide.layout}
                    cardRef={(node) => {
                      cardRefs.current[slide.id] = node
                    }}
                  />
                </div>
              </div>
              {slides.length > 1 ? (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  {slide.label}
                </p>
              ) : null}
            </Button>
          ))}
        </div>

        {slides.length > 1 ? (
          <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="Share cards">
            {slides.map((slide) => (
              <Button
                key={slide.id}
                type="button"
                variant="transparent"
                role="tab"
                aria-selected={slide.id === selected?.id}
                aria-label={slide.label}
                onClick={() => selectSlide(slide.id)}
                className={cn(
                  "min-h-0 rounded-full p-0 transition-[width,background-color] duration-200 ease-[var(--motion-ease-out)] active:translate-y-0",
                  slide.id === selected?.id
                    ? "h-1.5 w-4 bg-foreground"
                    : "size-1.5 bg-muted-foreground/35"
                )}
              />
            ))}
          </div>
        ) : null}

        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            void onPhotoChange(event)
          }}
        />
        <div className="mt-3 flex gap-2">
          <Button
            variant="ghost-outline"
            className="min-h-11 min-w-0 flex-1"
            disabled={busy != null}
            onClick={() => photoRef.current?.click()}
          >
            {busy === "photo" ? (
              <Spinner />
            ) : (
              <IconPhoto className="size-5" stroke={1.5} />
            )}
            {photoSrc ? "Change photo" : "Add photo"}
          </Button>
          {photoSrc ? (
            <Button
              variant="ghost-outline"
              className="min-h-11"
              disabled={busy != null}
              aria-label="Remove photo"
              onClick={() => {
                setPhotoSrc(null)
                setSlideId("session")
              }}
            >
              <IconX className="size-5" stroke={1.5} />
            </Button>
          ) : null}
        </div>

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
