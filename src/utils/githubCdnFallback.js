const RAW_GITHUB_HOST = "raw.githubusercontent.com";
const JSDELIVR_GH_PREFIX = "https://cdn.jsdelivr.net/gh/";

function isElement(value, tagName) {
  return (
    typeof window !== "undefined" &&
    value instanceof window.Element &&
    (!tagName || value.tagName === tagName)
  );
}

export function rawGithubToJsDelivr(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  let parsed;
  try {
    parsed = new URL(value, typeof window !== "undefined" ? window.location.href : undefined);
  } catch {
    return value;
  }

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

export function isRawGithubUrl(url) {
  try {
    const parsed = new URL(String(url || ""), typeof window !== "undefined" ? window.location.href : undefined);
    return parsed.hostname === RAW_GITHUB_HOST;
  } catch {
    return false;
  }
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

    const current = String(img.currentSrc || img.src || "");
    const fallback = getRawGithubFallbackUrl(current);

    if (!fallback || hasUsedFallback(img)) {
      onFinalError?.(event);
      return;
    }

    markFallbackTarget(img);
    onFallback?.(fallback, img);
    img.src = fallback;
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
    if (!target || hasUsedFallback(target)) return;

    const isImg = isElement(target, "IMG");
    const isAudio = isElement(target, "AUDIO") || isElement(target, "VIDEO");
    if (!isImg && !isAudio) return;

    const current = String(target.currentSrc || target.src || "");
    const fallback = getRawGithubFallbackUrl(current);
    if (!fallback) return;

    markFallbackTarget(target);
    target.src = fallback;

    if (isAudio && typeof target.load === "function") {
      try {
        target.load();
      } catch {
        // no-op
      }
    }

    try {
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
    } catch {
      // no-op
    }
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

export async function fetchWithRawGithub429Fallback(input, init) {
  const rawUrl = typeof input === "string" || input instanceof URL ? String(input) : String(input?.url || "");
  const response = await fetch(input, init);

  if (response.status !== 429) return response;

  const fallback = getRawGithubFallbackUrl(rawUrl);
  if (!fallback) return response;

  try {
    return await fetch(fallback, init);
  } catch {
    return response;
  }
}
