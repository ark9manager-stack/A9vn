// src/utils/operatorAvatar.js

const AK_ASSET_BRANCH = "cn";
const AK_ASSET_RAW_BASE = `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/${AK_ASSET_BRANCH}`;
const AK_ASSET_JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/ArknightsAssets/ArknightsAssets2@${AK_ASSET_BRANCH}`;

function buildAkAssetUrl(path = "") {
  const clean = String(path || "").replace(/^\/+/, "");
  return `${AK_ASSET_RAW_BASE}/${clean}`;
}

export function toJsDelivrAvatarUrl(url) {
  const rawPrefix = `${AK_ASSET_RAW_BASE}/`;
  const value = String(url || "");
  if (!value.startsWith(rawPrefix)) return value;
  return `${AK_ASSET_JSDELIVR_BASE}/${value.slice(rawPrefix.length)}`;
}

export function makeAvatarCdnFallbackHandler({ onFallback } = {}) {
  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;
    const current = String(img.currentSrc || img.src || "");
    const next = toJsDelivrAvatarUrl(current);
    if (!next || next === current || img?.dataset?.avatarCdnFallback === "1") return;
    try {
      if (img.dataset) img.dataset.avatarCdnFallback = "1";
    } catch {}
    onFallback?.(next, img);
    img.src = next;
  };
}

export const CN_AVATAR_BASE =
  `${buildAkAssetUrl("assets/dyn/arts/charavatars")}/`;

export const CN_AVATAR_OVERRIDES = {
  char_271_spikes: `${CN_AVATAR_BASE}elite/char_271_spikes.png`,
  char_1037_amiya3: `${CN_AVATAR_BASE}elite/char_1037_amiya3_2.png`,
};

export function normalizeCharId(charId) {
  if (!charId) return "";
  return String(charId)
    .trim()
    .replace(/\.png$/i, "");
}

export function getOperatorCharId(operator) {
  return (
    operator?.charId ||
    operator?.id ||
    operator?.characterPrefabKey ||
    operator?.char_id ||
    operator?.code ||
    ""
  );
}

export function buildCnAvatarUrl(charId) {
  const id = normalizeCharId(charId);
  if (!id || !id.startsWith("char_")) return null;

  if (CN_AVATAR_OVERRIDES[id]) return CN_AVATAR_OVERRIDES[id];
  return `${CN_AVATAR_BASE}${id}.png`;
}
