import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const botType = process.env.TYPE_BOT?.toLowerCase() || "bot";
const logDir = path.join(process.cwd(), "data", "logs", botType);

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
  if (Object.keys(metadata).length > 0 && metadata[0] !== undefined) {
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

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize({ all: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  }),
  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxFiles: "14d",
    maxSize: "20m",
  }),
  new DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    maxSize: "20m",
  }),
];

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

function formatMessage(...args: any[]): string {
  return args.map(arg => {
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
  }).join(" ");
}

export function log(...messages: any[]) {
  const formatted = formatMessage(...messages);
  console.log(formatted);
  logger.info(formatted);
}

export function error(message: string, err?: unknown) {
  if (err instanceof Error) {
    logger.error(message, { stack: err.stack, errorName: err.name, errorMessage: err.message });
  } else {
    logger.error(message, { extra: err });
  }
}

export function warn(message: string, ...meta: any[]) {
  if (meta.length > 0 && meta[0] !== undefined) {
    logger.warn(message, ...meta);
  } else {
    logger.warn(message);
  }
}

export function info(message: string, ...meta: any[]) {
  if (meta.length > 0 && meta[0] !== undefined) {
    logger.info(message, ...meta);
  } else {
    logger.info(message);
  }
}

export function debug(message: string, ...meta: any[]) {
  const formatted = formatMessage(message, ...meta);
  console.log(formatted);
  logger.debug(formatted);
}

export function trace(message: string, ...meta: any[]) {
  logger.verbose(formatMessage(message, ...meta));
}

export function fatal(message: string, ...args: any[]) {
  logger.error(message, { args: args.map(a => typeof a === "object" ? safeStringify(a) : String(a)) });
  process.exit(1);
}

export default logger;
