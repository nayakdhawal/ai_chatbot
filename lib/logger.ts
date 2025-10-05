// Simple structured logging utility
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  service: string
  metadata?: Record<string, any>
}

class Logger {
  private service: string

  constructor(service: string = 'chatbot') {
    this.service = service
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      metadata,
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      console.log(JSON.stringify(entry))
    } else {
      // Development logging
      console[level === 'error' ? 'error' : 'log'](
        `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.service}]: ${entry.message}`,
        metadata ? JSON.stringify(metadata, null, 2) : ''
      )
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata)
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, metadata)
    }
  }
}

export const logger = new Logger()
