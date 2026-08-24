export function logInfo(message: string, meta?: unknown) {
  if (meta === undefined) {
    console.info(message);
    return;
  }

  console.info(message, meta);
}

export function logWarn(message: string, meta?: unknown) {
  if (meta === undefined) {
    console.warn(message);
    return;
  }

  console.warn(message, meta);
}

export function logError(message: string, error: unknown) {
  console.error(message, error);
}
