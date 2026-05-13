import {
  RARITY_ORDER,
  SUBPROF_LABELS_I18N,
  PROF_ICON_BASE,
  PROFESSION_ICON_MAP,
  CLASS_LABELS_I18N,
} from "../config/operatorConfig";

const AK_ASSET_BRANCH = "cn";
const AK_ASSET_RAW_BASE = `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/${AK_ASSET_BRANCH}`;
const AK_ASSET_JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/ArknightsAssets/ArknightsAssets2@${AK_ASSET_BRANCH}`;

function buildAkAssetUrl(path = "") {
  const clean = String(path || "").replace(/^\/+/, "");
  return `${AK_ASSET_RAW_BASE}/${clean}`;
}

export function toJsDelivrOperatorAssetUrl(url) {
  const rawPrefix = `${AK_ASSET_RAW_BASE}/`;
  const value = String(url || "");
  if (!value.startsWith(rawPrefix)) return value;
  return `${AK_ASSET_JSDELIVR_BASE}/${value.slice(rawPrefix.length)}`;
}

export function makeOperatorAssetFallbackHandler({ onFallback } = {}) {
  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;
    const current = String(img.currentSrc || img.src || "");
    const next = toJsDelivrOperatorAssetUrl(current);
    if (!next || next === current || img?.dataset?.operatorCdnFallback === "1") return;
    try {
      if (img.dataset) img.dataset.operatorCdnFallback = "1";
    } catch {}
    onFallback?.(next, img);
    img.src = next;
  };
}

export function professionIconUrl(profession) {
  const file = PROFESSION_ICON_MAP[profession];
  return file ? `${PROF_ICON_BASE}/${file}` : "";
}

export function professionLabel(profession, lang = "EN") {
  const L = String(lang || "EN").toUpperCase() === "VN" ? "VN" : "EN";
  return CLASS_LABELS_I18N?.[L]?.[profession] || profession || "";
}

export function getRarityTier(rarity) {
  if (rarity == null) return 0;

  if (typeof rarity === "string") {
    const m = rarity.match(/TIER_(\d+)/i);
    if (m) return Number(m[1]) || 0;
  }

  if (typeof rarity === "number") {
    if (rarity >= 0 && rarity <= 5) return rarity + 1;
    if (rarity >= 1 && rarity <= 6) return rarity;
  }
  return 0;
}

export function rarityRank(tier) {
  const idx = RARITY_ORDER.indexOf(tier);
  return idx === -1 ? 999 : idx;
}

export function getIdWebNumber(op) {
  const raw = op?.idweb ?? op?.idWeb ?? op?.id_web;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function subProfIconUrl(id) {
  if (!id) return "";
  return `${buildAkAssetUrl("assets/dyn/arts/ui/subprofessionicon")}/sub_${id}_icon.png`;
}

export function subProfLabel(id, lang = "EN") {
  const L = String(lang || "EN").toUpperCase() === "VN" ? "VN" : "EN";
  const dict = SUBPROF_LABELS_I18N?.[L] || {};
  return dict[id] || id || "";
}
