/**
 * clientLogger.ts
 * Single Responsibility: Browser-side logging (console only).
 * Same interface as server logger — consistent logging across the stack.
 * Rule 4, 5, 6 | SOLID — Interface Segregation.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'ACTION' | 'FUNCTION';

function writeLog(level: LogLevel, message: string, context?: object): void {
  const ts = new Date().toISOString();
  const ctx = context ? ` | ${JSON.stringify(context)}` : '';
  const entry = `[${ts}] [${level}] ${message}${ctx}`;
  if (level === 'ERROR') console.error(entry);
  else if (level === 'WARN') console.warn(entry);
  else console.log(entry);
}

export const clientLogger = {
  info:   (msg: string, ctx?: object) => writeLog('INFO',     msg, ctx),
  warn:   (msg: string, ctx?: object) => writeLog('WARN',     msg, ctx),
  error:  (msg: string, ctx?: object) => writeLog('ERROR',    msg, ctx),
  debug:  (msg: string, ctx?: object) => writeLog('DEBUG',    msg, ctx),
  action: (msg: string, ctx?: object) => writeLog('ACTION',   msg, ctx),
  fn:     (name: string, ctx?: object) => writeLog('FUNCTION', `${name}() called`, ctx),
};
