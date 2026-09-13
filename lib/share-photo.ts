const TARGET_W = 1080
const TARGET_H = 1920

export async function photoFileToCoverUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = TARGET_W
  canvas.height = TARGET_H
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    throw new Error("Couldn’t read that photo.")
  }

  const scale = Math.max(TARGET_W / bitmap.width, TARGET_H / bitmap.height)
  const width = bitmap.width * scale
  const height = bitmap.height * scale
  ctx.drawImage(
    bitmap,
    (TARGET_W - width) / 2,
    (TARGET_H - height) / 2,
    width,
    height
  )
  bitmap.close()
  return canvas.toDataURL("image/jpeg", 0.86)
}
