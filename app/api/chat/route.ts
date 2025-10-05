import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = ip
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Input validation
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      )
    }

    if (body.message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 1000 characters allowed." },
        { status: 400 }
      )
    }

    logger.info("Processing chat message", { 
      messageLength: body.message.length,
      ip: ip.substring(0, 8) + '...' // Partial IP for privacy
    })

    // Send POST request to n8n webhook with JSON body
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      logger.error("N8N_WEBHOOK_URL environment variable is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        timestamp: body.timestamp,
      }),
    })

    logger.debug("n8n response status", { status: response.status })

    if (!response.ok) {
      logger.error("n8n returned error status", { 
        status: response.status,
        statusText: response.statusText 
      })
      return NextResponse.json({ error: "Failed to get response from AI" }, { status: response.status })
    }

    const responseText = await response.text()
    logger.debug("n8n raw response", { responseLength: responseText.length })

    if (!responseText || responseText.trim() === "") {
      logger.warn("n8n returned empty response")
      return NextResponse.json({
        response: "I received your message but got an empty response. Please check your n8n workflow configuration.",
      })
    }

    try {
      const data = JSON.parse(responseText)
      logger.debug("n8n parsed JSON response", { hasResponse: !!data.response })
      return NextResponse.json(data)
    } catch (parseError) {
      logger.debug("Response is not JSON, returning as text")
      // If n8n returns plain text, wrap it in a response object
      return NextResponse.json({ response: responseText })
    }
  } catch (error) {
    logger.error("Error in chat API route", { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
