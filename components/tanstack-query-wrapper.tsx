"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { Toaster } from "@/components/ui/toast"
const queryClient = new QueryClient()

function TanStackQueryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
export default TanStackQueryWrapper
