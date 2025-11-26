/**
 * Production-ready logging service with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    let output = `[${entry.timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\nContext: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.error) {
      output += `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`;
    }
    
    return output;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatLog(entry);

    // In development, use console
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          break;
      }
    } else {
      // In production, send to monitoring service (e.g., Sentry, DataDog, LogRocket)
      // For now, just console.log
      console.log(formatted);
      
      // Example: Send to external service
      if (level === LogLevel.ERROR && error) {
        // captureException(error, { contexts: { custom: context } });
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // API request logging
  apiRequest(method: string, path: string, context?: Record<string, any>) {
    this.info(`API ${method} ${path}`, context);
  }

  // API response logging
  apiResponse(method: string, path: string, status: number, duration: number) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${path} ${status} (${duration}ms)`);
  }

  // User action logging
  userAction(userId: string, action: string, context?: Record<string, any>) {
    this.info(`User ${userId} performed ${action}`, context);
  }

  // Database query logging
  dbQuery(query: string, duration: number, error?: Error) {
    if (error) {
      this.error(`DB Query failed: ${query}`, error, { duration });
    } else if (duration > 1000) {
      this.warn(`Slow DB Query (${duration}ms): ${query}`);
    } else if (this.isDevelopment) {
      this.debug(`DB Query (${duration}ms): ${query}`);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper for API middleware logging
export function createRequestLogger(requestId: string) {
  return {
    info: (message: string, context?: Record<string, any>) => {
      logger.info(message, { ...context, requestId });
    },
    warn: (message: string, context?: Record<string, any>) => {
      logger.warn(message, { ...context, requestId });
    },
    error: (message: string, error?: Error, context?: Record<string, any>) => {
      logger.error(message, error, { ...context, requestId });
    },
  };
}
