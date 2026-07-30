/**
 * Centralized logging service for the AEM A2UI Demo
 * Replaces scattered console.log statements with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  sendToServer: boolean;
  serverEndpoint?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_STYLES: Record<LogLevel, string> = {
  debug: 'color: #6b7280',
  info: 'color: #3b82f6',
  warn: 'color: #f59e0b',
  error: 'color: #ef4444; font-weight: bold',
};

class Logger {
  private config: LoggerConfig = {
    enabled: true,
    minLevel: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'debug' : 'warn',
    sendToServer: false,
  };

  private logs: LogEntry[] = [];
  private maxLogs = 100;

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(context: string | undefined, message: string): string {
    return context ? `[${context}] ${message}` : message;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };

    // Store in memory for debugging
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const formattedMessage = this.formatMessage(context, message);
    const style = LOG_STYLES[level];

    if (data !== undefined) {
      console[level](`%c${formattedMessage}`, style, data);
    } else {
      console[level](`%c${formattedMessage}`, style);
    }

    // Send to server if configured
    if (this.config.sendToServer && level === 'error') {
      this.sendToServer(entry);
    }
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    if (!this.config.serverEndpoint) return;

    try {
      await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail - don't want logging to break the app
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log('error', message, context, data);
  }

  // Get recent logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Create a scoped logger for a specific context
  scope(context: string): ScopedLogger {
    return new ScopedLogger(this, context);
  }
}

class ScopedLogger {
  constructor(
    private logger: Logger,
    private context: string,
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.debug(message, this.context, data);
  }

  info(message: string, data?: unknown): void {
    this.logger.info(message, this.context, data);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(message, this.context, data);
  }

  error(message: string, data?: unknown): void {
    this.logger.error(message, this.context, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export scoped loggers for common contexts
export const apiLogger = logger.scope('API');
export const uiLogger = logger.scope('UI');
export const collaborationLogger = logger.scope('Collaboration');
export const contentLogger = logger.scope('Content');
