import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if required environment variables are set
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    const isHealthy = !!webhookUrl

    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      services: {
        n8n: !!webhookUrl ? "configured" : "not configured",
      },
    }

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    )
  }
}
