import charPatchTable from "../data/operators/char_patch_table.json";
import charPatchTableEN from "../data/operators/char_patch_table_en.json";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function buildPatchIndex(table) {
  const infos = table?.infos || {};
  const patchChars = table?.patchChars || {};
  const out = new Map();

  for (const [mainId, info] of Object.entries(infos)) {
    const defaultId = isNonEmptyString(info?.default) ? info.default : mainId;
    const tmplIds = Array.isArray(info?.tmplIds) ? info.tmplIds : [];
    const ids = Array.from(
      new Set([mainId, defaultId, ...tmplIds].filter(isNonEmptyString)),
    );

    for (const id of ids) {
      out.set(id, {
        mainCharId: mainId,
        defaultCharId: defaultId,
        tmplIds: ids,
        isPatchForm: id !== defaultId,
      });
    }
  }

  for (const id of Object.keys(patchChars)) {
    if (out.has(id)) continue;
    out.set(id, {
      mainCharId: id,
      defaultCharId: id,
      tmplIds: [id],
      isPatchForm: false,
    });
  }

  return out;
}

const cnPatchIndex = buildPatchIndex(charPatchTable);
const enPatchIndex = buildPatchIndex(charPatchTableEN);

function getPatchInfoFromIndex(charId, index) {
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  if (!id) return null;
  return index.get(id) || null;
}

export function getPatchInfo(charId, { lang = "CN" } = {}) {
  const index =
    String(lang || "").toUpperCase() === "EN" ? enPatchIndex : cnPatchIndex;
  return (
    getPatchInfoFromIndex(charId, index) ||
    getPatchInfoFromIndex(charId, cnPatchIndex)
  );
}

export function getPatchMainCharId(charId) {
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  if (!id) return "";
  return getPatchInfo(id)?.mainCharId || id;
}

export function getPatchDefaultCharId(charId) {
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  if (!id) return "";
  return getPatchInfo(id)?.defaultCharId || id;
}

export function isPatchFormId(charId) {
  const info = getPatchInfo(charId);
  return !!info?.isPatchForm;
}

export function skinIdBelongsToChar(skinId, charId) {
  const sid = isNonEmptyString(skinId) ? String(skinId).trim() : "";
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  if (!sid || !id) return false;
  return (
    sid === `${id}#1` ||
    sid === `${id}#1+` ||
    sid === `${id}#2` ||
    sid.startsWith(`${id}@`)
  );
}

export function patchTmplMatchesChar(tmplId, charId) {
  const tmpl = isNonEmptyString(tmplId) ? String(tmplId).trim() : "";
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  return !!tmpl && !!id && tmpl === id;
}

export function storyPatchListMatchesChar(story, charId) {
  const id = isNonEmptyString(charId) ? String(charId).trim() : "";
  if (!id) return true;
  const list = story?.patchIdList;
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.includes(id);
}

export { charPatchTable, charPatchTableEN };
