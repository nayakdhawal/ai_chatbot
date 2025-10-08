"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Settings, Minimize2, X, Copy, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  error?: boolean
  retryable?: boolean
}

// Welcome message configuration
const WELCOME_MESSAGE = {
  title: "👋 Welcome to AI Assistant!",
  content: `I'm here to help you with any questions or tasks you might have. Here are some things I can do:

- **Answer questions** about various topics
- **Provide step-by-step guidance** for complex tasks
- **Help with problem-solving** and decision making
- **Explain concepts** in detail with examples
- **Assist with research** and information gathering

Feel free to ask me anything! What would you like to know?`
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

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `# ${WELCOME_MESSAGE.title}\n\n${WELCOME_MESSAGE.content}`,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

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
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Main container */}
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col shadow-minimal-lg bg-white">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm shadow-minimal">
              AI
            </div>
            <div>
              <h1 className="text-lg font-semibold text-blue-900">
                AI Assistant
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 pulse" />
                <span className="text-xs text-blue-600">
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-minimal"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-minimal"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-minimal"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat area */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-blue-50/30 to-indigo-50/30" 
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-semibold shadow-minimal-lg">
                  AI
                </div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">
                  Welcome to AI Assistant
                </h2>
                <p className="text-blue-600">
                  Loading your assistant...
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
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold shadow-minimal">
                      AI
                    </div>
                  )}

                  <div className={cn("group relative max-w-[70%]", message.sender === "user" ? "order-1" : "order-2")}>
                    <div
                      className={cn(
                        "rounded-minimal-lg px-4 py-3 transition-all duration-200 shadow-minimal",
                        message.sender === "user" 
                          ? "bg-blue-500 text-white ml-auto" 
                          : "bg-white text-slate-800 border border-blue-100",
                        message.error && "border-l-4 border-red-400 bg-red-50"
                      )}
                    >
                      <div className="text-[15px] leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-blue-400">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-blue-300">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-blue-200">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-green-400">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-300 mb-2">
                                {children}
                              </blockquote>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-blue-200">{children}</strong>,
                            em: ({ children }) => <em className="italic text-yellow-200">{children}</em>,
                            table: ({ children }) => (
                              <div className="overflow-x-auto mb-2">
                                <table className="min-w-full border-collapse border border-gray-600">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border border-gray-600 px-2 py-1 bg-gray-700 font-bold text-left">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-gray-600 px-2 py-1">
                                {children}
                              </td>
                            ),
                            img: ({ src, alt, ...props }) => (
                              <div className="my-4 flex flex-col items-center">
                                <div className="relative group">
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="max-w-full h-auto rounded-lg shadow-lg border-2 border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-blue-400/20 hover:shadow-xl cursor-pointer"
                                    style={{
                                      maxHeight: '400px',
                                      objectFit: 'contain',
                                      backgroundColor: '#1a1a1a',
                                      padding: '8px'
                                    }}
                                    loading="lazy"
                                    onClick={() => window.open(src, '_blank')}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const errorDiv = document.createElement('div');
                                      errorDiv.className = 'text-center p-4 bg-gray-800 rounded-lg border border-red-500/30';
                                      errorDiv.innerHTML = `
                                        <div class="text-red-400 mb-2">⚠️</div>
                                        <div class="text-sm text-gray-300">Image failed to load</div>
                                        <div class="text-xs text-gray-500 mt-1">${alt || 'No description available'}</div>
                                      `;
                                      target.parentNode?.replaceChild(errorDiv, target);
                                    }}
                                    {...props}
                                  />
                                  <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/10 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-blue-400/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                                      Click to view full size
                                    </div>
                                  </div>
                                </div>
                                {alt && (
                                  <div className="mt-2 text-xs text-gray-400 text-center max-w-md">
                                    {alt}
                                  </div>
                                )}
                              </div>
                            ),
                            a: ({ href, children, ...props }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors duration-200"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>

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

                    <p className="mt-1 px-1 text-xs text-blue-500">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-400 text-white text-xs font-semibold shadow-minimal">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="message-enter flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold shadow-minimal pulse">
                    AI
                  </div>
                  <div className="flex items-center gap-1 rounded-minimal-lg px-4 py-3 bg-white border border-blue-100 shadow-minimal">
                    <div className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                    <div className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-minimal-lg px-4 py-3 text-[15px] leading-relaxed outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border border-blue-200 bg-white text-slate-800 placeholder-blue-400 shadow-minimal"
                aria-label="Message input"
                aria-describedby="input-help"
                role="textbox"
                autoComplete="off"
                spellCheck="true"
              />
              {input.length > 0 && (
                <span className="absolute bottom-2 right-3 text-xs text-blue-500">
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
              className="h-12 w-12 flex-shrink-0 rounded-minimal-lg transition-all duration-200 disabled:opacity-50 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white shadow-minimal hover:shadow-minimal-lg"
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
