"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Settings, Minimize2, X, Copy, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  error?: boolean
  retryable?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] Sending message to API route:", userMessage.text)
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          timestamp: userMessage.timestamp.toISOString(),
        }),
      })

      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] API route response status:", response.status)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (process.env.NODE_ENV === 'development') {
        console.log("[v0] Received response data:", data)
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || "I received your message.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[v0] Error sending message:", error)
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}. Click retry to try again.`
          : "Sorry, I encountered an unexpected error. Click retry to try again.",
        sender: "bot",
        timestamp: new Date(),
        error: true,
        retryable: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const retryMessage = async (messageId: string) => {
    const messageToRetry = messages.find(m => m.id === messageId)
    if (!messageToRetry || !messageToRetry.retryable) return

    setRetryingMessageId(messageId)
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToRetry.text,
          timestamp: messageToRetry.timestamp.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error (${response.status})`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Remove the error message and add the successful response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== messageId)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || data.message || "I received your message.",
          sender: "bot",
          timestamp: new Date(),
        }
        return [...filtered, botMessage]
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[v0] Error retrying message:", error)
      }
      // Update the error message with more details
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, text: `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
          : m
      ))
    } finally {
      setIsTyping(false)
      setRetryingMessageId(null)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: "#1a1a1a" }}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4a9eff] to-transparent"
          style={{ top: "0" }}
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-between border-b px-6 py-4"
          style={{
            backgroundColor: "#2a2a2a",
            borderColor: "#333333",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-lg font-bold"
              style={{
                backgroundColor: "#374151",
                color: "#4a9eff",
                boxShadow: "0 0 20px rgba(74, 158, 255, 0.3)",
              }}
            >
              AI
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: "#e0e0e0" }}>
                AI Assistant
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full pulse-glow" style={{ backgroundColor: "#10b981" }} />
                <span className="text-xs" style={{ color: "#666666" }}>
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-all duration-200 hover:scale-105"
              style={{ color: "#666666" }}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-all duration-200 hover:scale-105"
              style={{ color: "#666666" }}
              aria-label="Minimize"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-all duration-200 hover:scale-105"
              style={{ color: "#666666" }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat area */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto px-6 py-6" 
          style={{ backgroundColor: "#1a1a1a" }}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "#2a2a2a",
                    border: "2px solid #4a9eff",
                  }}
                >
                  <span className="text-2xl" style={{ color: "#4a9eff" }}>
                    AI
                  </span>
                </div>
                <p className="text-lg" style={{ color: "#666666" }}>
                  Start a conversation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "message-enter flex gap-3",
                    message.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.sender === "bot" && (
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold"
                      style={{
                        backgroundColor: "#374151",
                        color: "#4a9eff",
                      }}
                    >
                      AI
                    </div>
                  )}

                  <div className={cn("group relative max-w-[70%]", message.sender === "user" ? "order-1" : "order-2")}>
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 transition-all duration-200",
                        message.sender === "user" ? "hover:shadow-lg" : "border-l-2 hover:shadow-lg",
                        message.error && "border-l-2",
                      )}
                      style={{
                        backgroundColor: message.sender === "user" ? "#2d3748" : "#374151",
                        color: "#ffffff",
                        borderColor: message.error ? "#ef4444" : message.sender === "bot" ? "#4a9eff" : "transparent",
                        boxShadow:
                          message.sender === "user"
                            ? "0 2px 8px rgba(45, 55, 72, 0.3)"
                            : "0 2px 8px rgba(55, 65, 81, 0.3)",
                      }}
                    >
                      <p className="text-[15px] leading-relaxed">{message.text}</p>

                      {/* Action buttons */}
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        <button
                          onClick={() => copyMessage(message.text, message.id)}
                          className="rounded p-1 hover:scale-110"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            color: "#e0e0e0",
                          }}
                          aria-label="Copy message"
                        >
                          {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                        {message.error && message.retryable && (
                          <button
                            onClick={() => retryMessage(message.id)}
                            disabled={retryingMessageId === message.id}
                            className="rounded p-1 hover:scale-110 disabled:opacity-50"
                            style={{
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              color: "#e0e0e0",
                            }}
                            aria-label="Retry message"
                          >
                            <RotateCcw className={`h-3 w-3 ${retryingMessageId === message.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-1 px-1 text-xs" style={{ color: "#666666" }}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: "#2d3748",
                        color: "#e0e0e0",
                      }}
                    >
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="message-enter flex gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold pulse-glow"
                    style={{
                      backgroundColor: "#374151",
                      color: "#4a9eff",
                    }}
                  >
                    AI
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-xl border-l-2 px-4 py-3"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#4a9eff",
                    }}
                  >
                    <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: "#4a9eff" }} />
                    <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: "#4a9eff" }} />
                    <div className="typing-dot h-2 w-2 rounded-full" style={{ backgroundColor: "#4a9eff" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div
          className="border-t px-6 py-4"
          style={{
            backgroundColor: "#2a2a2a",
            borderColor: "#333333",
          }}
        >
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-lg px-4 py-3 text-[15px] leading-relaxed outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#e0e0e0",
                  border: "1px solid #333333",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4a9eff"
                  e.target.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(74, 158, 255, 0.2)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#333333"
                  e.target.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.3)"
                }}
                aria-label="Message input"
                aria-describedby="input-help"
                role="textbox"
                autoComplete="off"
                spellCheck="true"
              />
              {input.length > 0 && (
                <span className="absolute bottom-2 right-3 text-xs" style={{ color: "#666666" }}>
                  {input.length}
                </span>
              )}
              <div id="input-help" className="sr-only">
                Type your message and press Enter to send, or Shift+Enter for a new line
              </div>
            </div>

            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 flex-shrink-0 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: input.trim() && !isTyping ? "#4a9eff" : "#374151",
                color: "#ffffff",
                boxShadow: input.trim() && !isTyping ? "0 0 20px rgba(74, 158, 255, 0.4)" : "none",
              }}
              onMouseDown={(e) => {
                if (input.trim() && !isTyping) {
                  e.currentTarget.style.transform = "scale(0.95)"
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
              aria-label={isTyping ? "Sending message..." : "Send message"}
              title={isTyping ? "Sending message..." : "Send message"}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
