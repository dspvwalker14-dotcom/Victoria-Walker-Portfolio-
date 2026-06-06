export function info(message: string, meta?: Record<string, unknown>) {
  console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
}

export function warn(message: string, meta?: Record<string, unknown>) {
  console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
}

export function error(message: string, meta?: Record<string, unknown>) {
  console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
}

export function debug(message: string, meta?: Record<string, unknown>) {
  console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
}
