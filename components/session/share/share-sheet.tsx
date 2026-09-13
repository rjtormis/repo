"use client"

import { useEffect, useRef, useState } from "react"
import { IconCheck, IconCopy, IconDownload, IconShare2 } from "@tabler/icons-react"
import { ShareCard } from "@/components/session/share/share-card"
import type { ShareCardData } from "@/components/session/share/types"
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

export function ShareSheet({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ShareCardData
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<"share" | "save" | "copy" | null>(null)
  const [copied, setCopied] = useState(false)
  const [fileShare, setFileShare] = useState(false)
  const filename = `${slug(data.name)}-repo.png`
  const profileUrl = `https://repo.fit/u/${data.handle ?? "you"}`
  const caption = `${data.name} · ${data.volumeLabel}`

  useEffect(() => {
    setFileShare(canShareFiles())
  }, [])

  async function onShare() {
    const node = cardRef.current
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
    const node = cardRef.current
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
            Preview the card, then share or save an image.
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-center overflow-x-auto rounded-2xl bg-[#0a0a0a]">
          <ShareCard data={data} cardRef={cardRef} />
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
