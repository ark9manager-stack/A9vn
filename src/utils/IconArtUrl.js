const __IMG_STATUS__ = new Map();

export function preloadImageCached(url) {
  if (!url) return Promise.reject(new Error("no-url"));

  const hit = __IMG_STATUS__.get(url);
  if (hit === "loaded") return Promise.resolve(url);
  if (hit && typeof hit.then === "function") return hit;

  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      __IMG_STATUS__.set(url, "loaded");
      resolve(url);
    };
    img.onerror = (e) => {
      __IMG_STATUS__.set(url, "error");
      reject(e);
    };
    img.src = url;
  });

  __IMG_STATUS__.set(url, p);
  return p;
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

export function makeImgFallbackOnceHandler(getFallbackSrc, {
  flagAttr = "data-fallback",
} = {}) {
  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;

    if (img?.dataset?.fallback === "1" || img?.getAttribute?.(flagAttr) === "1") return;
    try {
      if (img.dataset) img.dataset.fallback = "1";
      img.setAttribute?.(flagAttr, "1");
    } catch {}

    const next = typeof getFallbackSrc === "function" ? getFallbackSrc(img) : "";
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
      if (!usedFallback && typeof fallbackImgUrl === "string" && fallbackImgUrl.trim()) {
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

export const UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/[uc]common/charattrdetail/";

export const RANGE_STAND = `${UI_ICON_BASE}attack_range_stand.png`;
export const RANGE_ATTACK = `${UI_ICON_BASE}attack_range_attack.png`;

export const STAT_ICON = {
  maxHp: `${UI_ICON_BASE}icon_hp.png`,
  atk: `${UI_ICON_BASE}icon_atk.png`,
  def: `${UI_ICON_BASE}icon_def.png`,
  magicResistance: `${UI_ICON_BASE}icon_res.png`,
  respawnTime: `${UI_ICON_BASE}icon_time.png`,
  cost: `${UI_ICON_BASE}icon_cost.png`,
  blockCnt: `${UI_ICON_BASE}icon_block.png`,
  baseAttackTime: `${UI_ICON_BASE}icon_attack_speed.png`,
};

export const BATTLE_UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/[uc]battlecommon/ui_battle_new/";
export const RANGE_ATTACK_SKILL = `${BATTLE_UI_ICON_BASE}attack_range_attack.png`;

export const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/elite_hub/";

export function getEliteIconLarge(phaseIndex) {
  const i = Number(phaseIndex);
  if (!Number.isFinite(i) || i < 0) return "";
  return `${ELITE_ICON_BASE}elite_${i}_large.png`;
}

export const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/potential_hub/";

export const getPotIcon = (idx0) => `${POT_ICON_BASE}potential_${idx0}.png`;
export const getPotIconSmall = (idx1) => `${POT_ICON_BASE}potential_${idx1}_small.png`;

export const SKILL_ICON_DIR =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/skills/";
export const SKILL_ICON_BASE = `${SKILL_ICON_DIR}skill_icon_`;

export function getSkillIconUrl(skillId, iconId) {
  const iconKey = String(iconId || "").trim();
  if (iconKey) return `${SKILL_ICON_BASE}${iconKey}.png`;
  const key = String(skillId || "").trim();
  if (!key) return "";
  return `${SKILL_ICON_BASE}${key}.png`;
}

export const INIT_SP_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/init_sp.png";
export const SP_COST_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/image_sp_cost_bkg.png";

export const LEVEL_SOLID_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/number_hub/solid_";
export const LEVEL_SPECIALIZED_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/specialized_hub/specialized_";

export function getSkillLevelIconUrl(levelNum) {
  const n = Number(levelNum);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n <= 7) return `${LEVEL_SOLID_BASE}${n}.png`;
  if (n <= 10) return `${LEVEL_SPECIALIZED_BASE}${n - 7}.png`;
  return "";
}

export const BUILDING_SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/building/skills/";

export function getBuildingSkillIconUrl(iconKey) {
  const key = String(iconKey || "").trim();
  if (!key) return "";
  return `${BUILDING_SKILL_ICON_BASE}${key.toLowerCase()}.png`;
}

export const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";
export const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/items/icons/";

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
  return `${ITEM_BG_BASE}sprite_item_r${r}.png`;
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
  return `${ITEM_BG_BASE}op_r${safe}.png`;
}

export const TOKEN_ICON_BASE_POTENTIAL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/items/icons/potential/";
export const TOKEN_ICON_BASE_CLASSPOTENTIAL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/items/icons/classpotential/";

export function buildPotentialTokenIconUrl(iconId) {
  const key = String(iconId || "").trim();
  return key ? `${TOKEN_ICON_BASE_POTENTIAL}${key}.png` : "";
}

export function buildClassPotentialTokenIconUrl(iconId) {
  const key = String(iconId || "").trim();
  return key ? `${TOKEN_ICON_BASE_CLASSPOTENTIAL}${key}.png` : "";
}

export function buildActivityVoucherIconUrl(activityPotentialItemId, resolvedCharId) {
  const id = String(activityPotentialItemId || "").trim();
  if (!id) return "";

  const useActicon = resolvedCharId === "char_4091_ulika" || id === "voucher_ulika";
  const base = TOKEN_ICON_BASE_CLASSPOTENTIAL.replace(
    "/classpotential/",
    useActicon ? "/acticon/" : "/",
  );
  return `${base}${id}.png`;
}

export const MODULE_DIR_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/uniequipdirection/";
export const MODULE_DIR_ICON_ORIGINAL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/uniequiptype/original.png";
export const MODULE_IMG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/uniequipimg/";
export const MODULE_LEVEL_BOARD_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/uniequip/uniequip_level_board/";

export function getModuleDirIconUrl(iconKey) {
  const key = String(iconKey || "original").toLowerCase();
  return key === "original"
    ? MODULE_DIR_ICON_ORIGINAL
    : `${MODULE_DIR_ICON_BASE}${key}.png`;
}

export function getModuleLevelBoardUrl(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv <= 0) return "";
  return `${MODULE_LEVEL_BOARD_BASE}img_stg${lv}.png`;
}

export function getDefaultModuleImgUrl() {
  return `${MODULE_IMG_BASE}default.png`;
}

export function getModuleImageCandidates(uniequipId, uniEquipIcon) {
  const id = String(uniequipId || "");
  const icon = String(uniEquipIcon || "");

  if (id.startsWith("uniequip_001_") || icon === "original") {
    return [getDefaultModuleImgUrl()];
  }

  const arr = [];
  if (icon) arr.push(`${MODULE_IMG_BASE}${icon}.png`);
  if (id) arr.push(`${MODULE_IMG_BASE}${id}.png`);
  arr.push(getDefaultModuleImgUrl());
  return [...new Set(arr)];
}

export function getModuleWarmPreloadUrls(candidates) {
  const urls = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  const warm = [getDefaultModuleImgUrl(), ...urls.slice(0, 2)];
  return [...new Set(warm)].filter(Boolean);
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

      const len = typeof getCandidatesLength === "function" ? Number(getCandidatesLength()) : 0;
      setIndex?.((prev) => {
        const next = prev + 1;
        return next < len ? next : prev;
      });
    } catch {}
  };
}

export const SKIN_ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/characters";

export const ICON_MODEL_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_model.png";
export const ICON_DRAWER_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_drawer.png";

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

export function buildSkinArtUrl(charId, skinId, { forceLowerTheme = false } = {}) {
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
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/charavatars/";

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
