import { domToPng, domToBlob } from "modern-screenshot"

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

export async function captureSharePng(node: HTMLElement) {
  return domToPng(node, {
    scale: 3,
    backgroundColor: "#0a0a0a",
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
  const blob = await domToBlob(node, {
    scale: 3,
    backgroundColor: "#0a0a0a",
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
