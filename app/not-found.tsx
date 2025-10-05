import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="text-center">
        <div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: "#2a2a2a",
            border: "2px solid #4a9eff",
          }}
        >
          <span className="text-4xl font-bold" style={{ color: "#4a9eff" }}>
            404
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold" style={{ color: "#e0e0e0" }}>
          Page Not Found
        </h1>
        <p className="mb-8 text-lg" style={{ color: "#666666" }}>
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button
            className="px-8 py-3 text-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#4a9eff",
              color: "#ffffff",
              boxShadow: "0 0 20px rgba(74, 158, 255, 0.4)",
            }}
          >
            Back to Chat
          </Button>
        </Link>
      </div>
    </div>
  )
}
