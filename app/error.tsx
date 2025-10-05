"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="text-center">
        <div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: "#2a2a2a",
            border: "2px solid #ef4444",
          }}
        >
          <span className="text-4xl font-bold" style={{ color: "#ef4444" }}>
            !
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold" style={{ color: "#e0e0e0" }}>
          Something went wrong
        </h1>
        <p className="mb-8 text-lg" style={{ color: "#666666" }}>
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="px-6 py-3 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#4a9eff",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(74, 158, 255, 0.4)",
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="px-6 py-3 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "#4a9eff",
              color: "#4a9eff",
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
