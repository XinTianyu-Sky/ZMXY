const DEV = import.meta.env.DEV;

export { DEV as DEBUG };

export function debugLog(...args: unknown[]): void {
  if (DEV) console.log('[DEBUG]', ...args);
}

export function debugWarn(...args: unknown[]): void {
  if (DEV) console.warn('[DEBUG]', ...args);
}

export function debugError(...args: unknown[]): void {
  if (DEV) console.error('[DEBUG]', ...args);
}
