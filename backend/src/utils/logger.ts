export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: string;
}

export class Logger {
  private static formatEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error | string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error instanceof Error ? error.stack || error.message : typeof error === 'string' ? error : undefined,
    };
  }

  static info(message: string, context?: Record<string, any>): void {
    const entry = this.formatEntry('INFO', message, context);
    console.log(`[INFO] [${entry.timestamp}] ${entry.message}`, context ? JSON.stringify(context) : '');
  }

  static warn(message: string, context?: Record<string, any>, error?: Error | string): void {
    const entry = this.formatEntry('WARN', message, context, error);
    console.warn(`[WARN] [${entry.timestamp}] ${entry.message}`, context ? JSON.stringify(context) : '', entry.error || '');
  }

  static error(message: string, context?: Record<string, any>, error?: Error | string): void {
    const entry = this.formatEntry('ERROR', message, context, error);
    console.error(`[ERROR] [${entry.timestamp}] ${entry.message}`, context ? JSON.stringify(context) : '', entry.error || '');
  }
}
