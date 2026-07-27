import winston from "winston";
import path from "path";
import DailyRotateFilePkg from "winston-daily-rotate-file";

// Compatibilidade ESM/CommonJS
const DailyRotateFile =
  (DailyRotateFilePkg as any).default || DailyRotateFilePkg;

const botType = process.env.TYPE_BOT?.toLowerCase() || "bot";
const isProduction = process.env.NODE_ENV === "production";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// =====================
// SAFE STRINGIFY
// =====================
function safeStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v,
  );
}

// =====================
// ARG FORMAT
// =====================
function formatMessage(...args: unknown[]): string {
  return args
    .filter((arg) => arg !== undefined)
    .map((arg) => {
      if (arg === null) return "null";
      if (typeof arg === "bigint") return arg.toString();

      if (arg instanceof Error) {
        return arg.stack ?? `${arg.name}: ${arg.message}`;
      }

      if (typeof arg === "object") {
        try {
          return safeStringify(arg);
        } catch {
          return String(arg);
        }
      }

      return String(arg);
    })
    .join(" ");
}

// =====================
// LOGGER FORMAT
// =====================
const logFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  let output = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(meta).length) {
    try {
      output += ` ${safeStringify(meta)}`;
    } catch {
      output += ` ${String(meta)}`;
    }
  }

  if (stack) {
    output += `\n${stack}`;
  }

  return output;
});

// =====================
// TRANSPORTS
// =====================
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: !isProduction }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat,
    ),
  }),
];

if (!isProduction) {
  const logDir = path.join(process.cwd(), "data", "logs", botType);

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
    }),
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
      maxSize: "20m",
    }),
  );
}

// =====================
// LOGGER
// =====================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  defaultMeta: { service: botType },
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports,
});

// =====================
// HELPERS
// =====================
function write(
  level: "error" | "warn" | "info" | "debug" | "verbose",
  ...args: unknown[]
) {
  logger.log(level, formatMessage(...args));
}

// =====================
// API
// =====================
export function log(...args: unknown[]) {
  write("info", ...args);
}

export function info(...args: unknown[]) {
  write("info", ...args);
}

export function warn(...args: unknown[]) {
  write("warn", ...args);
}

export function debug(...args: unknown[]) {
  write("debug", ...args);
}

export function trace(...args: unknown[]) {
  write("verbose", ...args);
}

export function error(...args: unknown[]) {
  write("error", ...args);
}

export function fatal(...args: unknown[]): never {
  write("error", ...args);
  process.exit(1);
}

export default logger;