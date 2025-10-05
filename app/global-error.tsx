"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
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
              Application Error
            </h1>
            <p className="mb-8 text-lg" style={{ color: "#666666" }}>
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              className="rounded-lg px-8 py-3 text-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "#4a9eff",
                color: "#ffffff",
                boxShadow: "0 0 20px rgba(74, 158, 255, 0.4)",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
