import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] Sending message to n8n:", body.message)
    }

    // Send POST request to n8n webhook with JSON body
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      console.error("[v0] N8N_WEBHOOK_URL environment variable is not set")
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

    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] n8n response status:", response.status)
    }

    if (!response.ok) {
      console.error("[v0] n8n returned error status:", response.status)
      return NextResponse.json({ error: "Failed to get response from AI" }, { status: response.status })
    }

    const responseText = await response.text()
    if (process.env.NODE_ENV === 'development') {
      console.log("[v0] n8n raw response:", responseText)
    }

    if (!responseText || responseText.trim() === "") {
      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] n8n returned empty response")
      }
      return NextResponse.json({
        response: "I received your message but got an empty response. Please check your n8n workflow configuration.",
      })
    }

    try {
      const data = JSON.parse(responseText)
      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] n8n parsed JSON response:", data)
      }
      return NextResponse.json(data)
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] Response is not JSON, returning as text")
      }
      // If n8n returns plain text, wrap it in a response object
      return NextResponse.json({ response: responseText })
    }
  } catch (error) {
    console.error("[v0] Error in chat API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
