// src/utils/operatorAvatar.js

export const CN_AVATAR_BASE =
  "https://cdn.jsdelivr.net/gh/ArknightsAssets/ArknightsAssets2@cn/assets/dyn/arts/charavatars/";

export const CN_AVATAR_OVERRIDES = {
  char_271_spikes: `${CN_AVATAR_BASE}elite/char_271_spikes.png`,
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
