/**
 * logger.ts
 * Single Responsibility: Handles all logging — console + rotating debug log files.
 * Rule 4: Comprehensive Activity Logging
 * Rule 5: Centralized Error Logging
 * Rule 6: Function-Level Logging
 * Rule 7: Debug-Level Logging with File Rotation
 */

import fs from "fs";
import path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGS_DIR = path.resolve("logs");
const LOG_FILES = ["debug1.log", "debug2.log", "debug3.log"];
const MAX_SLOTS = 3;

// ─── Log Levels ───────────────────────────────────────────────────────────────

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "ACTION" | "FUNCTION";

// ─── Rotation Logic ───────────────────────────────────────────────────────────

/**
 * Determines which log file to write to and rotates if all 3 slots are full.
 * Run 1 → debug1.log
 * Run 2 → debug2.log
 * Run 3 → debug3.log
 * Run 4+ → rotate: debug2→debug1, debug3→debug2, new→debug3
 */
function resolveLogFile(): string {
  console.log("[FUNCTION] resolveLogFile() called");

  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  const existing = LOG_FILES.filter((f) =>
    fs.existsSync(path.join(LOGS_DIR, f))
  );

  // Slots available — use next empty slot
  if (existing.length < MAX_SLOTS) {
    const nextFile = LOG_FILES[existing.length];
    console.log(`[DEBUG] Log slot available → writing to ${nextFile}`);
    return path.join(LOGS_DIR, nextFile);
  }

  // All 3 slots full — rotate
  console.log("[DEBUG] All log slots full → rotating logs");

  // debug2 → debug1
  fs.renameSync(
    path.join(LOGS_DIR, "debug2.log"),
    path.join(LOGS_DIR, "debug1.log")
  );

  // debug3 → debug2
  fs.renameSync(
    path.join(LOGS_DIR, "debug3.log"),
    path.join(LOGS_DIR, "debug2.log")
  );

  // New logs → debug3
  console.log("[DEBUG] Rotation complete → writing to debug3.log");
  return path.join(LOGS_DIR, "debug3.log");
}

// ─── Active Log File ──────────────────────────────────────────────────────────

let activeLogFile: string | null = null;

function getActiveLogFile(): string {
  if (!activeLogFile) {
    activeLogFile = resolveLogFile();
  }
  return activeLogFile;
}

// ─── Core Logger ──────────────────────────────────────────────────────────────

/**
 * Formats and writes a log entry to both console and the active log file.
 */
function writeLog(level: LogLevel, message: string, context?: object): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
  const entry = `[${timestamp}] [${level}] ${message}${contextStr}`;

  // Console output
  if (level === "ERROR") {
    console.error(entry);
  } else if (level === "WARN") {
    console.warn(entry);
  } else {
    console.log(entry);
  }

  // File output
  try {
    fs.appendFileSync(getActiveLogFile(), entry + "\n", "utf8");
  } catch (err) {
    console.error("[LOGGER ERROR] Failed to write to log file:", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  /** General information */
  info: (message: string, context?: object) => writeLog("INFO", message, context),

  /** Warnings — something unexpected but not breaking */
  warn: (message: string, context?: object) => writeLog("WARN", message, context),

  /** Errors — something broke */
  error: (message: string, context?: object) => writeLog("ERROR", message, context),

  /** Debug details — internals, values, state */
  debug: (message: string, context?: object) => writeLog("DEBUG", message, context),

  /** User-triggered actions — button clicks, form submits */
  action: (message: string, context?: object) => writeLog("ACTION", message, context),

  /** Function entry points — Rule 6 */
  fn: (functionName: string, context?: object) =>
    writeLog("FUNCTION", `${functionName}() called`, context),
};
