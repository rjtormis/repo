"use client"

import { PwaInstallPrompt } from "@/components/pwa/install-prompt"

export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallPrompt />
      {children}
    </>
  )
}
