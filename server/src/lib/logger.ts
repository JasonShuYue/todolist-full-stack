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

export function logError(message: string, error: unknown, meta?: unknown) {
  if (meta === undefined) {
    console.error(message, error);
    return;
  }

  console.error(message, error, meta);
}
