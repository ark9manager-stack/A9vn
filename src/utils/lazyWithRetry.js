import { lazy } from "react";

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 450;
const MAX_DELAY_MS = 3000;
const AUTO_RELOAD_GUARD_KEY = "a9_dynamic_import_reload_v2";
const AUTO_RELOAD_GUARD_MS = 60_000;

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

function canAutoReloadAfterDynamicImportError() {
  if (typeof window === "undefined") return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;

  try {
    const now = Date.now();
    const lastReload = Number(sessionStorage.getItem(AUTO_RELOAD_GUARD_KEY) || 0);
    if (Number.isFinite(lastReload) && now - lastReload < AUTO_RELOAD_GUARD_MS) {
      return false;
    }
    sessionStorage.setItem(AUTO_RELOAD_GUARD_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

function reloadOnceForStaleChunk(error, label) {
  if (!isDynamicImportError(error) || !canAutoReloadAfterDynamicImportError()) {
    return false;
  }

  try {
    console.warn(
      `[A9VN] ${label} is incompatible with the current cached build; reloading once to sync assets.`,
      error,
    );
  } catch {
    // no-op
  }

  window.location.reload();
  return true;
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

      if (!isDynamicImportError(error)) {
        throw error;
      }

      if (attempt >= retries) break;

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

  if (reloadOnceForStaleChunk(lastError, label)) {
    return new Promise(() => {});
  }

  throw lastError;
}

export function lazyWithRetry(importer, options = {}) {
  return lazy(() => retryDynamicImport(importer, options));
}
