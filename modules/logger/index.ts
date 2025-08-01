export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export type LogContext = Record<string, unknown>;

export type LoggerConfig = {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
};

class Logger {
  private config: Required<LoggerConfig>;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      prefix: config.prefix ?? "",
      timestamp: config.timestamp ?? true,
    };
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const parts: string[] = [];

    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level}]`);

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    parts.push(message);

    if (context && Object.keys(context).length > 0) {
      parts.push(JSON.stringify(context));
    }

    return parts.join(" ");
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: LogContext,
  ): void {
    if (level < this.config.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      default:
        // biome-ignore lint/suspicious/noConsoleLog:
        console.log(formattedMessage);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, "INFO", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, "WARN", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = context || {};

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = error;
    }

    this.log(LogLevel.ERROR, "ERROR", message, errorContext);
  }

  createChild(prefix: string): Logger {
    const childPrefix = this.config.prefix
      ? `${this.config.prefix}:${prefix}`
      : prefix;

    return new Logger({
      ...this.config,
      prefix: childPrefix,
    });
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.LOG_LEVEL
    ? (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ??
      LogLevel.INFO)
    : LogLevel.INFO,
});

export default defaultLogger;
export { Logger };
