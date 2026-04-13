export function log(...messages: any[]) {
  console.log("[LOG]", ...messages);
}

export function error(message: string, err?: any) {
  console.error(`[ERROR] ${message}`, err);
}

export function warn(message: string) {
  console.warn(`[WARN] ${message}`);
}

export function info(...messages: any[]) {
  console.info(`[INFO] ${messages}`);
}

export function debug(...messages: any[]) {
  console.debug(`[DEBUG] ${messages}`);
}

export function trace(...messages: any[]) {
  console.trace(`[TRACE] ${messages}`);
}

export function fatal(message: string) {
  console.error(`[FATAL] ${message}`);
}