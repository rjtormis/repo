import { domToPng, domToBlob } from "modern-screenshot"
import {
  SHARE_STORY_HEIGHT,
  SHARE_STORY_WIDTH,
} from "@/components/session/share/types"

export function canShareFiles() {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false
  }
  const probe = new File([new Uint8Array(0)], "repo.png", { type: "image/png" })
  try {
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"))
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true })
        image.addEventListener("error", () => resolve(), { once: true })
      })
    })
  )
}

export async function captureSharePng(node: HTMLElement) {
  await waitForImages(node)
  return domToPng(node, {
    scale: 3,
    width: SHARE_STORY_WIDTH,
    height: SHARE_STORY_HEIGHT,
    backgroundColor: "#0A0A0A",
  })
}

export async function sharePngFile({
  node,
  filename,
  text,
  url,
}: {
  node: HTMLElement
  filename: string
  text: string
  url: string
}) {
  await waitForImages(node)
  const blob = await domToBlob(node, {
    scale: 3,
    width: SHARE_STORY_WIDTH,
    height: SHARE_STORY_HEIGHT,
    backgroundColor: "#0A0A0A",
  })
  if (!blob) throw new Error("Couldn’t render that card.")

  const file = new File([blob], filename, { type: "image/png" })
  if (!canShareFiles()) {
    throw new Error("This browser can’t attach images to Share.")
  }

  try {
    await navigator.share({ files: [file], text, url })
  } catch (error) {
    if (isAbort(error)) return
    await navigator.share({ files: [file], text: `${text}\n${url}` })
  }
}

export function downloadPng(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  link.click()
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}
