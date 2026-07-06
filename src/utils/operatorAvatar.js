// src/utils/operatorAvatar.js

import { makeRawGithubImageFallbackHandler, rawGithubToJsDelivr } from "./githubCdnFallback";

const AK_ASSET_BRANCH = "cn";
const AK_ASSET_RAW_BASE = `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/${AK_ASSET_BRANCH}`;
function buildAkAssetUrl(path = "") {
  const clean = String(path || "").replace(/^\/+/, "");
  return `${AK_ASSET_RAW_BASE}/${clean}`;
}

export function toJsDelivrAvatarUrl(url) {
  return rawGithubToJsDelivr(url);
}

export function makeAvatarCdnFallbackHandler({ onFallback } = {}) {
  return makeRawGithubImageFallbackHandler({ onFallback });
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
