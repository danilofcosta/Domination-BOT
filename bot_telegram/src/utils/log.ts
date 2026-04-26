import winston from "winston";
import path from "path";

const botType = process.env.TYPE_BOT?.toLowerCase() || "bot";
const isProduction = process.env.NODE_ENV === "production";

const { combine, timestamp, printf, colorize, errors } = winston.format;

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}

const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    try {
      msg += ` ${safeStringify(metadata)}`;
    } catch {
      msg += ` ${String(metadata)}`;
    }
  }

  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

// 🔥 TRANSPORTS DINÂMICOS
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: !isProduction }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat
    ),
  }),
];

// ✅ Só usa arquivo LOCAL (NUNCA na Vercel)
if (!isProduction) {
  const DailyRotateFile = require("winston-daily-rotate-file");

  const logDir = path.join(process.cwd(), "data", "logs", botType);

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
      maxSize: "20m",
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  defaultMeta: { service: botType },
  transports,
});

// =====================
// HELPERS
// =====================

function formatMessage(...args: any[]): string {
  return args
    .map((arg) => {
      if (arg === undefined) return "";
      if (typeof arg === "bigint") return arg.toString();
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

export function log(...messages: any[]) {
  logger.info(formatMessage(...messages));
}

export function error(message: string, err?: unknown) {
  if (err instanceof Error) {
    logger.error(message, {
      stack: err.stack,
      errorName: err.name,
      errorMessage: err.message,
    });
  } else {
    logger.error(message, { extra: err });
  }
}

export function warn(message: string, ...meta: any[]) {
  logger.warn(formatMessage(message, ...meta));
}

export function info(message: string, ...meta: any[]) {
  logger.info(formatMessage(message, ...meta));
}

export function debug(message: string, ...meta: any[]) {
  logger.debug(formatMessage(message, ...meta));
}

export function trace(message: string, ...meta: any[]) {
  logger.verbose(formatMessage(message, ...meta));
}

export function fatal(message: string, ...args: any[]) {
  logger.error(message, {
    args: args.map((a) =>
      typeof a === "object" ? safeStringify(a) : String(a)
    ),
  });
  process.exit(1);
}

export default logger;