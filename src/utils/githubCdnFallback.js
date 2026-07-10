const RAW_GITHUB_HOST = "raw.githubusercontent.com";
const JSDELIVR_HOST = "cdn.jsdelivr.net";
const JSDELIVR_GH_PREFIX = "https://cdn.jsdelivr.net/gh/";

const A9_RETRY_PARAM = "a9cdn_retry";
const JSDELIVR_RESOURCE_RETRY_DELAYS_MS = [7000, 15000, 30000, 45000, 60000];
const JSDELIVR_FETCH_RETRY_DELAYS_MS = [6000, 15000, 30000, 45000];

const resourceRetryTimers = new WeakMap();

function isElement(value, tagName) {
  return (
    typeof window !== "undefined" &&
    value instanceof window.Element &&
    (!tagName || value.tagName === tagName)
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    const timeoutFn =
      typeof window !== "undefined" ? window.setTimeout : globalThis.setTimeout;
    timeoutFn(resolve, ms);
  });
}

function parseUrl(url) {
  try {
    return new URL(
      String(url || ""),
      typeof window !== "undefined" ? window.location.href : undefined,
    );
  } catch {
    return null;
  }
}

function isMediaElement(value) {
  return isElement(value, "AUDIO") || isElement(value, "VIDEO");
}

function getElementCurrentUrl(target) {
  return String(target?.currentSrc || target?.src || "").trim();
}

function getRetryBaseUrl(url) {
  const parsed = parseUrl(url);
  if (!parsed) return String(url || "").trim();
  parsed.searchParams.delete(A9_RETRY_PARAM);
  return parsed.href;
}

function addRetryCacheBust(url, attempt) {
  const parsed = parseUrl(url);
  if (!parsed) return String(url || "").trim();
  parsed.searchParams.set(A9_RETRY_PARAM, `${Date.now()}_${attempt}`);
  return parsed.href;
}

function stopResourceError(event) {
  try {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
  } catch {
    // no-op
  }
}

function resetJsDelivrRetryState(target) {
  try {
    if (!target?.dataset) return;
    target.dataset.a9JsdelivrRetryCount = "0";
    delete target.dataset.a9JsdelivrRetryBase;
    delete target.dataset.a9JsdelivrRetryPending;
  } catch {
    // no-op
  }

  const timer = resourceRetryTimers.get(target);
  if (timer) {
    try {
      const clearTimeoutFn =
        typeof window !== "undefined" ? window.clearTimeout : globalThis.clearTimeout;
      clearTimeoutFn(timer);
    } catch {
      // no-op
    }
    resourceRetryTimers.delete(target);
  }
}

function getJsDelivrRetryCount(target) {
  const count = Number(target?.dataset?.a9JsdelivrRetryCount || 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function setElementSrc(target, src) {
  target.src = src;

  if (isMediaElement(target) && typeof target.load === "function") {
    try {
      target.load();
    } catch {
      // no-op
    }
  }
}

function scheduleJsDelivrResourceRetry(target, currentUrl) {
  if (!target || !isJsDelivrGithubUrl(currentUrl)) return false;

  const count = getJsDelivrRetryCount(target);
  if (count >= JSDELIVR_RESOURCE_RETRY_DELAYS_MS.length) return false;

  const baseUrl =
    target?.dataset?.a9JsdelivrRetryBase || getRetryBaseUrl(currentUrl);
  if (!baseUrl) return false;

  const nextCount = count + 1;
  const delayMs = JSDELIVR_RESOURCE_RETRY_DELAYS_MS[nextCount - 1];

  try {
    if (target.dataset) {
      target.dataset.a9JsdelivrRetryCount = String(nextCount);
      target.dataset.a9JsdelivrRetryBase = baseUrl;
      target.dataset.a9JsdelivrRetryPending = "1";
    }
  } catch {
    // no-op
  }

  const existingTimer = resourceRetryTimers.get(target);
  if (existingTimer) {
    try {
      const clearTimeoutFn =
        typeof window !== "undefined" ? window.clearTimeout : globalThis.clearTimeout;
      clearTimeoutFn(existingTimer);
    } catch {
      // no-op
    }
  }

  const setTimeoutFn =
    typeof window !== "undefined" ? window.setTimeout : globalThis.setTimeout;

  const timer = setTimeoutFn(() => {
    resourceRetryTimers.delete(target);

    try {
      if (target.dataset) delete target.dataset.a9JsdelivrRetryPending;
    } catch {
      // no-op
    }

    if (typeof document !== "undefined" && !document.contains(target)) return;

    setElementSrc(target, addRetryCacheBust(baseUrl, nextCount));
  }, delayMs);

  resourceRetryTimers.set(target, timer);
  return true;
}

export function rawGithubToJsDelivr(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  const parsed = parseUrl(value);
  if (!parsed) return value;

  if (parsed.hostname !== RAW_GITHUB_HOST) return value;

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4) return value;

  const [user, repo] = parts;
  let branch = parts[2];
  let pathParts = parts.slice(3);

  if (parts[2] === "refs" && parts[3] === "heads" && parts.length >= 6) {
    branch = parts[4];
    pathParts = parts.slice(5);
  }

  if (!user || !repo || !branch || pathParts.length === 0) return value;

  return `${JSDELIVR_GH_PREFIX}${user}/${repo}@${branch}/${pathParts.join("/")}${parsed.search || ""}${parsed.hash || ""}`;
}

export function jsDelivrToRawGithub(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  const parsed = parseUrl(value);
  if (!parsed || parsed.hostname !== JSDELIVR_HOST) return value;

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[0] !== "gh") return value;

  const user = parts[1];
  const repoAndBranch = parts[2];
  const atIndex = repoAndBranch.indexOf("@");
  if (!user || atIndex <= 0 || atIndex >= repoAndBranch.length - 1) return value;

  const repo = repoAndBranch.slice(0, atIndex);
  const branch = repoAndBranch.slice(atIndex + 1);
  const pathParts = parts.slice(3);
  if (!repo || !branch || pathParts.length === 0) return value;

  return `https://${RAW_GITHUB_HOST}/${user}/${repo}/${branch}/${pathParts.join("/")}${parsed.search || ""}${parsed.hash || ""}`;
}

export function isRawGithubUrl(url) {
  const parsed = parseUrl(url);
  return parsed?.hostname === RAW_GITHUB_HOST;
}

export function isJsDelivrGithubUrl(url) {
  const parsed = parseUrl(url);
  if (!parsed || parsed.hostname !== JSDELIVR_HOST) return false;
  const parts = parsed.pathname.split("/").filter(Boolean);
  return parts[0] === "gh" && parts.length >= 4;
}

export function getRawGithubFallbackUrl(url) {
  const next = rawGithubToJsDelivr(url);
  return next && next !== String(url || "").trim() ? next : "";
}

function markFallbackTarget(target) {
  try {
    if (target?.dataset) target.dataset.rawGithubCdnFallback = "1";
  } catch {
    // no-op
  }
}

function hasUsedFallback(target) {
  try {
    return target?.dataset?.rawGithubCdnFallback === "1";
  } catch {
    return false;
  }
}

export function makeRawGithubImageFallbackHandler({ onFallback, onFinalError } = {}) {
  return (event) => {
    const img = event?.currentTarget || event?.target;
    if (!isElement(img, "IMG")) return;

    const current = getElementCurrentUrl(img);
    const fallback = getRawGithubFallbackUrl(current);

    if (fallback && !hasUsedFallback(img)) {
      markFallbackTarget(img);
      resetJsDelivrRetryState(img);
      onFallback?.(fallback, img);
      img.src = fallback;
      return;
    }

    if (scheduleJsDelivrResourceRetry(img, current)) return;

    onFinalError?.(event);
  };
}

export function installRawGithubAssetFallback() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const existing = window.__A9VN_RAW_GITHUB_FALLBACK_DISPOSE__;
  if (typeof existing === "function") return existing;

  const onResourceError = (event) => {
    const target = event?.target;
    if (!target) return;

    const isImg = isElement(target, "IMG");
    const isAudio = isMediaElement(target);
    if (!isImg && !isAudio) return;

    const current = getElementCurrentUrl(target);

    if (isJsDelivrGithubUrl(current)) {
      if (scheduleJsDelivrResourceRetry(target, current)) {
        stopResourceError(event);
      }
      return;
    }

    if (hasUsedFallback(target)) return;

    const fallback = getRawGithubFallbackUrl(current);
    if (!fallback) return;

    markFallbackTarget(target);
    resetJsDelivrRetryState(target);
    setElementSrc(target, fallback);
    stopResourceError(event);
  };

  window.addEventListener("error", onResourceError, true);

  const dispose = () => {
    window.removeEventListener("error", onResourceError, true);
    if (window.__A9VN_RAW_GITHUB_FALLBACK_DISPOSE__ === dispose) {
      delete window.__A9VN_RAW_GITHUB_FALLBACK_DISPOSE__;
    }
  };

  window.__A9VN_RAW_GITHUB_FALLBACK_DISPOSE__ = dispose;
  return dispose;
}

async function isProbablyJsDelivrPackageLimit(response) {
  if (!response || response.ok) return false;

  const status = Number(response.status);
  if ([408, 425, 429, 500, 502, 503, 504].includes(status)) return true;

  if (![403, 404].includes(status)) return false;

  try {
    const contentType = String(response.headers?.get?.("content-type") || "");
    if (contentType && !/text|html|plain|json/i.test(contentType)) return false;

    const text = await response.clone().text();
    return /Package size exceeded the configured limit of 50 MB|Try https:\/\/github\.com\//i.test(
      text,
    );
  } catch {
    return false;
  }
}

async function fetchJsDelivrWithRetry(url, init) {
  const baseUrl = getRetryBaseUrl(url);
  let lastResponse = null;
  let lastError = null;

  for (let attempt = 0; attempt <= JSDELIVR_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
    const requestUrl = attempt === 0 ? baseUrl : addRetryCacheBust(baseUrl, attempt);

    try {
      const response = await fetch(requestUrl, init);
      if (response.ok) return response;

      lastResponse = response;
      const shouldRetry = await isProbablyJsDelivrPackageLimit(response);
      if (!shouldRetry || attempt >= JSDELIVR_FETCH_RETRY_DELAYS_MS.length) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt >= JSDELIVR_FETCH_RETRY_DELAYS_MS.length) throw error;
    }

    await sleep(JSDELIVR_FETCH_RETRY_DELAYS_MS[attempt]);
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error(`jsdelivr-fetch-failed: ${baseUrl}`);
}

export async function fetchWithRawGithub429Fallback(input, init) {
  const rawUrl =
    typeof input === "string" || input instanceof URL
      ? String(input)
      : String(input?.url || "");
  const response = await fetch(input, init);

  if (response.status !== 429) return response;

  const fallback = getRawGithubFallbackUrl(rawUrl);
  if (!fallback) return response;

  try {
    return await fetchJsDelivrWithRetry(fallback, init);
  } catch {
    return response;
  }
}
