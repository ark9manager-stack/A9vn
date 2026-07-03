import { lazy } from "react";

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 350;
const MAX_DELAY_MS = 2000;

function getErrorText(error) {
  return `${String(error?.name || "")} ${String(error?.message || error || "")}`;
}

export function isDynamicImportError(error) {
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|error loading dynamically imported module|dynamically imported module/i.test(
    getErrorText(error),
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    const setTimeoutFn =
      typeof window !== "undefined" ? window.setTimeout : globalThis.setTimeout;
    setTimeoutFn(resolve, ms);
  });
}

function waitUntilOnline(timeoutMs) {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return Promise.resolve();
  }

  if (navigator.onLine !== false) return Promise.resolve();

  return new Promise((resolve) => {
    const timeout = window.setTimeout(done, timeoutMs);

    function done() {
      window.clearTimeout(timeout);
      window.removeEventListener("online", done);
      resolve();
    }

    window.addEventListener("online", done, { once: true });
  });
}

export async function retryDynamicImport(importer, options = {}) {
  const retries = Number.isFinite(options.retries)
    ? Math.max(0, options.retries)
    : DEFAULT_RETRIES;
  const baseDelayMs = Number.isFinite(options.delayMs)
    ? Math.max(0, options.delayMs)
    : DEFAULT_DELAY_MS;
  const label = options.label || "dynamic module";

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await importer();
    } catch (error) {
      lastError = error;

      if (!isDynamicImportError(error) || attempt >= retries) {
        throw error;
      }

      const retryNumber = attempt + 1;
      const delayMs = Math.min(baseDelayMs * 2 ** attempt, MAX_DELAY_MS);

      try {
        console.warn(
          `[A9VN] Failed to load ${label}; retrying ${retryNumber}/${retries}.`,
          error,
        );
      } catch {
        // no-op
      }

      await waitUntilOnline(5000);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

export function lazyWithRetry(importer, options = {}) {
  return lazy(() => retryDynamicImport(importer, options));
}
