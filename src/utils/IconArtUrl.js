const __IMG_STATUS__ = new Map();
const __LOCAL_ASSET_MODULES__ = import.meta.glob("../assets/assets_op/*", {
  eager: true,
  import: "default",
});

const __LOCAL_ASSET_BY_NAME__ = Object.fromEntries(
  Object.entries(__LOCAL_ASSET_MODULES__).map(([path, url]) => {
    const fileName = path.split("/").pop()?.toLowerCase?.() || "";
    return [fileName, url];
  }),
);

function getLocalAssetUrl(fileName) {
  const key = String(fileName || "").trim().toLowerCase();
  return key ? __LOCAL_ASSET_BY_NAME__[key] || "" : "";
}

function preferLocalAsset(fileName, remoteUrl) {
  return getLocalAssetUrl(fileName) || remoteUrl;
}

const AK_ASSET_BRANCH = "cn";
const AK_ASSET_RAW_BASE = `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/${AK_ASSET_BRANCH}`;
const AK_ASSET_JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/ArknightsAssets/ArknightsAssets2@${AK_ASSET_BRANCH}`;

function buildAkAssetUrl(path = "") {
  const clean = String(path || "").replace(/^\/+/, "");
  return `${AK_ASSET_RAW_BASE}/${clean}`;
}

export function toJsDelivrAssetUrl(url) {
  const rawPrefix = `${AK_ASSET_RAW_BASE}/`;
  const value = String(url || "");
  if (!value.startsWith(rawPrefix)) return value;
  return `${AK_ASSET_JSDELIVR_BASE}/${value.slice(rawPrefix.length)}`;
}

export function toRawGithubAssetUrl(url) {
  const jsdelivrPrefix = `${AK_ASSET_JSDELIVR_BASE}/`;
  const value = String(url || "");
  if (!value.startsWith(jsdelivrPrefix)) return value;
  return `${AK_ASSET_RAW_BASE}/${value.slice(jsdelivrPrefix.length)}`;
}

export function makeRawToJsDelivrFallbackHandler({ onFallback } = {}) {
  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;
    const current = String(img.currentSrc || img.src || "");
    const next = toJsDelivrAssetUrl(current);
    if (!next || next === current || img?.dataset?.cdnFallback === "1") return;
    try {
      if (img.dataset) img.dataset.cdnFallback = "1";
    } catch {}
    onFallback?.(next, img);
    img.src = next;
  };
}

const __IMG_QUEUE__ = [];
let __IMG_ACTIVE__ = 0;
let __IMG_JOB_SEQ__ = 0;

const IMG_PRELOAD_CONCURRENCY = 1;
const IMG_PRELOAD_QUEUE_MAX = 0;
const IMG_PRELOAD_TIMEOUT_MS = 0;
const IMG_PRIORITY_PRELOAD_TIMEOUT_MS = 0;
const IMG_ERROR_RETRY_COOLDOWN_MS = 15000;
const IMG_BACKGROUND_PRELOAD_ENABLED = false;

function normalizeImgUrl(url) {
  return typeof url === "string" ? url.trim() : "";
}

function createImgCacheEntry(url) {
  return {
    url,
    status: "idle", // idle | queued | loading | loaded | error
    promise: null,
    error: null,
    errorAt: 0,
    touchedAt: Date.now(),
    queueJob: null,
  };
}

function getImgCacheEntry(url) {
  const key = normalizeImgUrl(url);
  if (!key) return null;
  let entry = __IMG_STATUS__.get(key);
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    entry = createImgCacheEntry(key);
    __IMG_STATUS__.set(key, entry);
  }
  entry.touchedAt = Date.now();
  return entry;
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function removeImgJob(job, { resolveValue, rejectReason } = {}) {
  if (!job) return false;
  const idx = __IMG_QUEUE__.indexOf(job);
  if (idx >= 0) {
    __IMG_QUEUE__.splice(idx, 1);
    job.cancelled = true;
    if (rejectReason) job.reject?.(rejectReason);
    else if (resolveValue !== undefined) job.resolve?.(resolveValue);
    return true;
  }
  return false;
}

function trimImgQueue() {
  const max = Number(IMG_PRELOAD_QUEUE_MAX);
  if (!Number.isFinite(max) || max <= 0) return;

  while (__IMG_QUEUE__.length > max) {
    let idx = -1;
    for (let i = __IMG_QUEUE__.length - 1; i >= 0; i -= 1) {
      if (!__IMG_QUEUE__[i]?.priority) {
        idx = i;
        break;
      }
    }
    if (idx < 0) idx = __IMG_QUEUE__.length - 1;

    const [job] = __IMG_QUEUE__.splice(idx, 1);
    if (!job) continue;
    job.cancelled = true;

    const entry = getImgCacheEntry(job.url);
    if (entry?.queueJob === job && entry.status === "queued") {
      entry.queueJob = null;
      entry.status = "idle";
      entry.promise = null;
    }

    job.resolve?.(job.url || "");
  }
}

function flushImgQueue() {
  while (__IMG_ACTIVE__ < IMG_PRELOAD_CONCURRENCY && __IMG_QUEUE__.length > 0) {
    const job = __IMG_QUEUE__.shift();
    if (!job || job.cancelled || typeof job.run !== "function") continue;

    job.started = true;

    const entry = getImgCacheEntry(job.url);
    if (entry?.queueJob === job && entry.status === "queued") {
      entry.status = "loading";
    }

    __IMG_ACTIVE__ += 1;
    Promise.resolve()
      .then(job.run)
      .finally(() => {
        const currentEntry = getImgCacheEntry(job.url);
        if (currentEntry?.queueJob === job) currentEntry.queueJob = null;
        __IMG_ACTIVE__ = Math.max(0, __IMG_ACTIVE__ - 1);
        flushImgQueue();
      });
  }
}

function enqueueImgJob(url, run, { priority = false } = {}) {
  const deferred = createDeferred();
  const job = {
    id: ++__IMG_JOB_SEQ__,
    url,
    run: () => Promise.resolve(run()).then(deferred.resolve, deferred.reject),
    resolve: deferred.resolve,
    reject: deferred.reject,
    priority: !!priority,
    started: false,
    cancelled: false,
  };

  if (priority) __IMG_QUEUE__.unshift(job);
  else __IMG_QUEUE__.push(job);

  trimImgQueue();
  flushImgQueue();

  return { promise: deferred.promise, job };
}

function promoteImgJob(job) {
  if (!job || job.started || job.cancelled) return false;
  const idx = __IMG_QUEUE__.indexOf(job);
  if (idx < 0) return false;
  __IMG_QUEUE__.splice(idx, 1);
  job.priority = true;
  __IMG_QUEUE__.unshift(job);
  flushImgQueue();
  return true;
}

function loadImageElement(key, { decode = true, priority = false, timeoutMs = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    let timer = null;

    if (decode) img.decoding = "async";
    try {
      if (priority && "fetchPriority" in img) img.fetchPriority = "high";
      if (priority && "loading" in img) img.loading = "eager";
    } catch {
      // no-op
    }

    const done = (ok, payload) => {
      if (settled) return;
      settled = true;
      if (timer) globalThis.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      ok ? resolve(key) : reject(payload);
    };

    const safeTimeout = Number(timeoutMs);
    if (Number.isFinite(safeTimeout) && safeTimeout > 0) {
      timer = globalThis.setTimeout(
        () => done(false, new Error(`image-load-timeout: ${key}`)),
        safeTimeout,
      );
    }

    img.onload = () => done(true, key);
    img.onerror = (e) =>
      done(false, e || new Error(`image-load-failed: ${key}`));

    img.src = key;

    if (img.complete && img.naturalWidth > 0) {
      done(true, key);
    }
  });
}

function shouldRetryCachedError(entry, retryAfterMs) {
  return !(
    entry?.status === "error" &&
    Number.isFinite(retryAfterMs) &&
    retryAfterMs > 0 &&
    Date.now() - (entry.errorAt || 0) < retryAfterMs
  );
}

function scheduleBackgroundPreload(
  key,
  entry,
  { decode = true, priority = false, timeoutMs = 0 } = {},
) {
  if (!entry) return null;

  if (entry.status === "loaded") {
    return Promise.resolve(key);
  }

  if ((entry.status === "queued" || entry.status === "loading") && entry.promise) {
    if (entry.status === "queued" && entry.queueJob && priority) {
      promoteImgJob(entry.queueJob);
    }
    return entry.promise;
  }

  entry.status = "queued";
  entry.error = null;
  entry.errorAt = 0;

  const { promise, job } = enqueueImgJob(
    key,
    () =>
      loadImageElement(key, {
        decode,
        priority,
        timeoutMs,
      })
        .then(() => {
          markImageLoaded(key);
          return key;
        })
        .catch((error) => {
          markImageError(key, error);
          throw error;
        }),
    { priority },
  );

  promise.catch(() => {});
  entry.promise = promise;
  entry.queueJob = job;

  return promise;
}

export function getImageCacheStatus(url) {
  const entry = getImgCacheEntry(url);
  return entry?.status || "idle";
}

export function isImageLoadedCached(url) {
  return getImageCacheStatus(url) === "loaded";
}

export function markImageLoaded(url) {
  const entry = getImgCacheEntry(url);
  if (!entry) return;
  if (entry.queueJob && !entry.queueJob.started) {
    removeImgJob(entry.queueJob, { resolveValue: entry.url || url });
  }
  entry.status = "loaded";
  entry.promise = null;
  entry.error = null;
  entry.errorAt = 0;
  entry.queueJob = null;
  entry.touchedAt = Date.now();
}

export function markImageError(url, error) {
  const entry = getImgCacheEntry(url);
  if (!entry) return;
  if (entry.queueJob && !entry.queueJob.started) {
    removeImgJob(entry.queueJob, {
      rejectReason: error || new Error("image-error"),
    });
  }
  entry.status = "error";
  entry.promise = null;
  entry.error = error || new Error("image-error");
  entry.errorAt = Date.now();
  entry.queueJob = null;
  entry.touchedAt = Date.now();
}

export function clearImageCache(url) {
  const key = normalizeImgUrl(url);
  if (key) {
    const entry = __IMG_STATUS__.get(key);
    if (entry?.queueJob && !entry.queueJob.started) {
      removeImgJob(entry.queueJob, {
        rejectReason: new Error(`image-cache-cleared: ${key}`),
      });
    }
    __IMG_STATUS__.delete(key);
    return;
  }

  for (const entry of __IMG_STATUS__.values()) {
    if (entry?.queueJob && !entry.queueJob.started) {
      removeImgJob(entry.queueJob, {
        rejectReason: new Error("image-cache-cleared"),
      });
    }
  }
  __IMG_QUEUE__.length = 0;
  __IMG_STATUS__.clear();
}

export function getImmediateImageSrc(url) {
  return normalizeImgUrl(url);
}

export function preloadImageCached(
  url,
  {
    retryAfterMs = IMG_ERROR_RETRY_COOLDOWN_MS,
    decode = true,
    priority = false,
    timeoutMs,
    waitForLoad = false,
    background = false,
  } = {},
) {
  const key = normalizeImgUrl(url);
  if (!key) return Promise.reject(new Error("no-url"));

  const entry = getImgCacheEntry(key);
  if (!entry) return Promise.reject(new Error("no-url"));

  if (entry.status === "loaded") {
    return Promise.resolve(key);
  }

  if (!shouldRetryCachedError(entry, retryAfterMs)) {
    if (!waitForLoad) return Promise.resolve(key);
    return Promise.reject(entry.error || new Error("cached-image-error"));
  }

  const effectiveTimeout =
    timeoutMs ?? (priority ? IMG_PRIORITY_PRELOAD_TIMEOUT_MS : IMG_PRELOAD_TIMEOUT_MS);

  if (!waitForLoad) {
    if (background && IMG_BACKGROUND_PRELOAD_ENABLED && !priority) {
      scheduleBackgroundPreload(key, entry, {
        decode,
        priority: false,
        timeoutMs: effectiveTimeout,
      });
    }
    return Promise.resolve(key);
  }

  const loadPromise = scheduleBackgroundPreload(key, entry, {
    decode,
    priority,
    timeoutMs: effectiveTimeout,
  });

  return loadPromise || Promise.resolve(key);
}

export function warmPreloadImageUrls(
  urls,
  {
    limit = 0,
    retryAfterMs = IMG_ERROR_RETRY_COOLDOWN_MS,
    enabled = IMG_BACKGROUND_PRELOAD_ENABLED,
  } = {},
) {
  const list = [
    ...new Set(
      (Array.isArray(urls) ? urls : []).map(normalizeImgUrl).filter(Boolean),
    ),
  ];

  if (!enabled) {
    return Promise.resolve(list.map((url) => ({ status: "fulfilled", value: url })));
  }

  const picked = list.slice(0, Math.max(0, Number(limit) || 0));
  return Promise.allSettled(
    picked.map((url) =>
      preloadImageCached(url, {
        retryAfterMs,
        waitForLoad: false,
        background: true,
      }),
    ),
  );
}

export function imgOnErrorHideVisibility(e) {
  try {
    e?.currentTarget && (e.currentTarget.style.visibility = "hidden");
  } catch {}
}

export function imgOnErrorHideDisplay(e) {
  try {
    e?.currentTarget && (e.currentTarget.style.display = "none");
  } catch {}
}

export function makeImgFallbackOnceHandler(
  getFallbackSrc,
  { flagAttr = "data-fallback" } = {},
) {
  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;

    if (img?.dataset?.fallback === "1" || img?.getAttribute?.(flagAttr) === "1")
      return;
    try {
      if (img.dataset) img.dataset.fallback = "1";
      img.setAttribute?.(flagAttr, "1");
    } catch {}

    const next =
      typeof getFallbackSrc === "function" ? getFallbackSrc(img) : "";
    if (typeof next === "string" && next.trim()) {
      img.src = next;
    }
  };
}

export function makeStatefulImgFallbackHandler({
  usedFallback,
  fallbackImgUrl,
  setUsedFallback,
  setSrc,
} = {}) {
  return () => {
    try {
      if (
        !usedFallback &&
        typeof fallbackImgUrl === "string" &&
        fallbackImgUrl.trim()
      ) {
        setUsedFallback?.(true);
        setSrc?.(fallbackImgUrl);
        return;
      }
      setSrc?.("");
    } catch {
      // no-op
    }
  };
}

export const RANGE_STAND = getLocalAssetUrl("attack_range_stand.png");
export const RANGE_ATTACK = getLocalAssetUrl("attack_range_attack.png");

export const STAT_ICON = {
  maxHp: getLocalAssetUrl("icon_hp.png"),
  atk: getLocalAssetUrl("icon_atk.png"),
  def: getLocalAssetUrl("icon_def.png"),
  magicResistance: getLocalAssetUrl("icon_res.png"),
  respawnTime: getLocalAssetUrl("icon_time.png"),
  cost: getLocalAssetUrl("icon_cost.png"),
  blockCnt: getLocalAssetUrl("icon_block.png"),
  baseAttackTime: getLocalAssetUrl("icon_attack_speed.png"),
};

export const RANGE_ATTACK_SKILL = getLocalAssetUrl("attack_range_attack_2.png");

export function getEliteIconLarge(phaseIndex) {
  const i = Number(phaseIndex);
  if (!Number.isFinite(i) || i < 0) return "";
  return getLocalAssetUrl(`elite_${i}_large.png`);
}

export const getPotIcon = (idx0) => getLocalAssetUrl(`potential_${idx0}.png`);
export const getPotIconSmall = (idx1) =>
  getLocalAssetUrl(`potential_${idx1}_small.png`);

export const SKILL_ICON_DIR =
  `${buildAkAssetUrl("assets/dyn/arts/skills")}/`;
export const SKILL_ICON_BASE = `${SKILL_ICON_DIR}skill_icon_`;

export function getSkillIconUrl(skillId, iconId) {
  const iconKey = String(iconId || "").trim();
  if (iconKey) return `${SKILL_ICON_BASE}${iconKey}.png`;
  const key = String(skillId || "").trim();
  if (!key) return "";
  return `${SKILL_ICON_BASE}${key}.png`;
}

export const INIT_SP_ICON = getLocalAssetUrl("init_sp.png");
export const SP_COST_ICON = getLocalAssetUrl("image_sp_cost_bkg.png");

export function getSkillLevelIconUrl(levelNum) {
  const n = Number(levelNum);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n <= 7) return getLocalAssetUrl(`solid_${n}.png`);
  if (n <= 10) return getLocalAssetUrl(`specialized_${n - 7}.png`);
  return "";
}

export const BUILDING_SKILL_ICON_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/building/skills")}/`;

export function getBuildingSkillIconUrl(iconKey) {
  const key = String(iconKey || "").trim();
  if (!key) return "";
  return `${BUILDING_SKILL_ICON_BASE}${key.toLowerCase()}.png`;
}

export const ITEM_BG_BASE =
  `${buildAkAssetUrl("assets/dyn/ui/[uc]home/mail/panel_mail_item")}/`;
export const ITEM_ICON_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/items/icons")}/`;

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
}

function rarityToR(rarity) {
  const m = String(rarity || "").match(/TIER_(\d+)/);
  const n = m ? Number(m[1]) : 1;
  return Number.isFinite(n) ? n : 1;
}

export function getItemBgUrl(rarity) {
  const r = clamp(rarityToR(rarity), 1, 6);
  return preferLocalAsset(`sprite_item_r${r}.png`, `${ITEM_BG_BASE}sprite_item_r${r}.png`);
}

export function getItemIconUrl(iconId) {
  const key = String(iconId || "").trim();
  if (!key) return "";
  return `${ITEM_ICON_BASE}${key.toLowerCase()}.png`;
}

export function getItemIconUrlForModule(itemId, iconId) {
  const raw = iconId || itemId || "";
  const key = String(raw).trim();
  if (!key) return "";

  if (key.toLowerCase() === "mod_unlock_token") {
    return `${ITEM_ICON_BASE}acticon/mod_unlock_token.png`;
  }
  return `${ITEM_ICON_BASE}${key.toLowerCase()}.png`;
}

export function buildRecruitBgUrl(rarity) {
  const m = typeof rarity === "string" ? rarity.match(/TIER_(\d+)/) : null;
  const n = m ? Number(m[1]) : 1;
  const safe = Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
  return preferLocalAsset(`op_r${safe}.png`, `${ITEM_BG_BASE}op_r${safe}.png`);
}

export const TOKEN_ICON_BASE_POTENTIAL =
  `${buildAkAssetUrl("assets/dyn/arts/items/icons/potential")}/`;
export const TOKEN_ICON_BASE_CLASSPOTENTIAL =
  `${buildAkAssetUrl("assets/dyn/arts/items/icons/classpotential")}/`;

export function buildPotentialTokenIconUrl(iconId) {
  const key = String(iconId || "").trim();
  return key ? `${TOKEN_ICON_BASE_POTENTIAL}${key}.png` : "";
}

export function buildClassPotentialTokenIconUrl(iconId) {
  const key = String(iconId || "").trim();
  return key ? `${TOKEN_ICON_BASE_CLASSPOTENTIAL}${key}.png` : "";
}

export function buildActivityVoucherIconUrl(
  activityPotentialItemId,
  resolvedCharId,
) {
  const id = String(activityPotentialItemId || "").trim();
  if (!id) return "";

  const useActicon =
    resolvedCharId === "char_4091_ulika" || id === "voucher_ulika";
  const base = TOKEN_ICON_BASE_CLASSPOTENTIAL.replace(
    "/classpotential/",
    useActicon ? "/acticon/" : "/",
  );
  return `${base}${id}.png`;
}

export const MODULE_DIR_ICON_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/ui/uniequipdirection")}/`;
export const MODULE_DIR_ICON_ORIGINAL = getLocalAssetUrl("original.png");
export const MODULE_IMG_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/ui/uniequipimg")}/`;
export const MODULE_LEVEL_BOARD_BASE =
  `${buildAkAssetUrl("assets/dyn/ui/uniequip/uniequip_level_board")}/`;

export function getModuleDirIconUrl(iconKey) {
  const key = String(iconKey || "original").toLowerCase();
  return key === "original"
    ? MODULE_DIR_ICON_ORIGINAL
    : preferLocalAsset(`${key}.png`, `${MODULE_DIR_ICON_BASE}${key}.png`);
}

export function getModuleLevelBoardUrl(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv <= 0) return "";
  return preferLocalAsset(`img_stg${lv}.png`, `${MODULE_LEVEL_BOARD_BASE}img_stg${lv}.png`);
}

export function getDefaultModuleImgUrl() {
  return preferLocalAsset("default.png", `${MODULE_IMG_BASE}default.png`);
}

export function getModuleImageCandidates(uniequipId, uniEquipIcon) {
  const id = String(uniequipId || "");
  const icon = String(uniEquipIcon || "");

  if (id.startsWith("uniequip_001_") || icon === "original") {
    return [getDefaultModuleImgUrl()];
  }

  const arr = [];
  if (icon) arr.push(preferLocalAsset(`${icon}.png`, `${MODULE_IMG_BASE}${icon}.png`));
  if (id) arr.push(preferLocalAsset(`${id}.png`, `${MODULE_IMG_BASE}${id}.png`));

  const deduped = [...new Set(arr)].filter(Boolean);
  return deduped.length > 0 ? deduped : [getDefaultModuleImgUrl()];
}

export function getModuleWarmPreloadUrls(candidates, limit = 1) {
  const urls = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  const safeLimit = Math.max(0, Number(limit) || 0);
  return [...new Set(urls.slice(0, safeLimit))].filter(Boolean);
}

export function makeModuleCandidateOnError({
  url,
  pendingUrlRef,
  setLoaded,
  setDisplayUrl,
  setIndex,
  getCandidatesLength,
} = {}) {
  return () => {
    try {
      const pending = pendingUrlRef?.current;
      if (pending !== url) return;
      setLoaded?.(false);
      setDisplayUrl?.("");

      const len =
        typeof getCandidatesLength === "function"
          ? Number(getCandidatesLength())
          : 0;
      setIndex?.((prev) => {
        const next = prev + 1;
        return next < len ? next : prev;
      });
    } catch {}
  };
}

export const SKIN_ART_BASE =
  buildAkAssetUrl("assets/dyn/arts/characters");

export const ICON_MODEL_URL = getLocalAssetUrl("icon_model.png");
export const ICON_DRAWER_URL = getLocalAssetUrl("icon_drawer.png");

export function buildEliteArtUrl(charId, elite) {
  if (!charId) return null;
  if (elite === "E0") return `${SKIN_ART_BASE}/${charId}/${charId}_1.png`;
  if (elite === "E2") return `${SKIN_ART_BASE}/${charId}/${charId}_2.png`;
  if (elite === "E1") {
    const filename = `${charId}_1+.png`.replace("+", "%2B");
    return `${SKIN_ART_BASE}/${charId}/${filename}`;
  }
  return `${SKIN_ART_BASE}/${charId}/${charId}_1.png`;
}

export function buildSkinArtUrl(
  charId,
  skinId,
  { forceLowerTheme = false } = {},
) {
  if (!charId || !skinId) return null;

  if (typeof skinId === "string" && skinId.startsWith(`${charId}@`)) {
    const rest = skinId.slice(`${charId}@`.length);
    const hashPos = rest.lastIndexOf("#");
    const theme = hashPos >= 0 ? rest.slice(0, hashPos) : rest;
    const ver = hashPos >= 0 ? rest.slice(hashPos + 1) : "";

    const themeNorm = forceLowerTheme ? theme.toLowerCase() : theme;
    const base = `${charId}_${themeNorm}${hashPos >= 0 ? `#${ver}` : ""}`;

    return `${SKIN_ART_BASE}/${charId}/${encodeURIComponent(base)}.png`;
  }

  const file = String(skinId).replaceAll("#", "_");
  const normalized = forceLowerTheme ? file.toLowerCase() : file;
  return `${SKIN_ART_BASE}/${charId}/${encodeURIComponent(normalized)}.png`;
}

export function withSpSuffix(url) {
  if (!url) return url;
  if (/_sp\.(png|webp|jpg|jpeg)$/i.test(url)) return url;
  return url.replace(/\.(png|webp|jpg|jpeg)$/i, "_sp.$1");
}

export const CHARAVATAR_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/charavatars")}/`;

const SUMMON_AVATAR_OVERRIDE = {
  token_10012_rosmon_shield: `${SKILL_ICON_DIR}skill_icon_sktok_rosmon.png`,
};

const SUMMON_SKILL_ICON_OVERRIDE = {
  token_10005_mgllan_drone1: "skill_icon_skchr_mgllan_1",
  token_10005_mgllan_drone2: "skill_icon_skchr_mgllan_2",
  token_10005_mgllan_drone3: "skill_icon_skchr_mgllan_3",
};

function tokenToSkillIconKey(tokenId) {
  const t = String(tokenId || "");
  if (!t.startsWith("token_")) return null;
  if (SUMMON_SKILL_ICON_OVERRIDE[t]) return SUMMON_SKILL_ICON_OVERRIDE[t];
  return `skill_icon_sktok_${t.replace(/^token_\d+_/, "")}`;
}

export function getSummonAvatarUrl(tokenId) {
  const tid = String(tokenId || "");
  if (!tid) return "";
  if (SUMMON_AVATAR_OVERRIDE[tid]) return SUMMON_AVATAR_OVERRIDE[tid];
  return `${CHARAVATAR_BASE}${tid}.png`;
}

export function getSummonSkillIconUrl(tokenId) {
  const key = tokenToSkillIconKey(tokenId);
  if (!key) return "";
  return `${SKILL_ICON_DIR}${key}.png`;
}

export function makeSummonSkillIconOnError(tokenId) {
  return makeImgFallbackOnceHandler(() => getSummonAvatarUrl(tokenId));
}

export function makeSkillHeaderIconOnError({
  url,
  pendingUrlRef,
  setIsLoading,
  setSkillIconError,
  setDisplayUrl,
} = {}) {
  return (e) => {
    imgOnErrorHideVisibility(e);
    try {
      if (pendingUrlRef?.current !== url) return;
      setIsLoading?.(false);
      setSkillIconError?.(true);
      setDisplayUrl?.("");
    } catch {}
  };
}