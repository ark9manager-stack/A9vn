import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { renderAKText } from "../../../StatHover";
import TranslatorCredit from "./TranslatorCredit";
import charwordTable from "../../../../data/voiceline/charword_table.json";
import charwordVn from "../../../../data/voiceline/charword_vn.json";
import charwordTableEn from "../../../../data/voiceline/charword_table_en.json";
import {
  buildCnAvatarUrl,
  CN_AVATAR_BASE,
  getOperatorCharId,
} from "../../../../utils/operatorAvatar";
import { getPatchMainCharId } from "../../../../utils/operatorPatchResolver";

const VOICE_ASSET_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/voice/assets/dyn/audio/sound_beta_2";

const VOICE_TITLE_VI = {
  任命助理: "Bổ nhiệm làm trợ lý",
  交谈1: "Trò chuyện 1",
  交谈2: "Trò chuyện 2",
  交谈3: "Trò chuyện 3",
  晋升后交谈1: "Trò chuyện sau khi thăng hạng 1",
  晋升后交谈2: "Trò chuyện sau khi thăng hạng 2",
  信赖提升后交谈1: "Trò chuyện sau khi tăng tin tưởng 1",
  信赖提升后交谈2: "Trò chuyện sau khi tăng tin tưởng 2",
  信赖提升后交谈3: "Trò chuyện sau khi tăng tin tưởng 3",
  闲置: "Treo máy",
  干员报到: "Báo danh",
  观看作战记录: "Xem Battle Record (Tăng exp OP)",
  精英化晋升1: "Thăng tiến 1",
  精英化晋升2: "Thăng tiến 2",
  编入队伍: "Xếp vào đội hình",
  任命队长: "Bổ nhiệm làm đội trưởng",
  行动出发: "Khởi hành nhiệm vụ",
  行动开始: "Bắt đầu chiến dịch",
  选中干员1: "Lựa chọn 1",
  选中干员2: "Lựa chọn 2",
  部署1: "Triển khai 1",
  部署2: "Triển khai 2",
  作战中1: "Đang giao chiến 1",
  作战中2: "Đang giao chiến 2",
  作战中3: "Đang giao chiến 3",
  作战中4: "Đang giao chiến 4",
  完成高难行动: "Hoàn thành nhiệm vụ 4*",
  "3星结束行动": "Hoàn thành nhiệm vụ 3*",
  非3星结束行动: "Hoàn thành nhiệm vụ 2*",
  行动失败: "Nhiệm vụ thất bại",
  进驻设施: "Vào căn cứ (base)",
  戳一下: "Chạm",
  信赖触摸: "Chạm (với độ tin tưởng cao)",
  标题: "Tiêu đề game (khi login)",
  新年祝福: "Chúc năm mới",
  问候: "Hỏi thăm (Sau khi login vào game)",
  生日: "Chúc mừng sinh nhật",
  周年庆典: "Kỷ niệm hàng năm",
};

function translateVoiceTitle(voiceTitle) {
  if (!voiceTitle) return "";
  return VOICE_TITLE_VI[voiceTitle] || voiceTitle;
}

function getPrefixFromWordKey(charId, wordKey, forceExactCharPrefix = false) {
  if (!wordKey || !charId) return "";
  const wk = String(wordKey);
  const cid = String(charId);
  if (wk === cid) return forceExactCharPrefix ? cid : "";
  if (wk.startsWith(`${cid}_`)) return wk.slice(`${cid}_`.length);
  if (wk.startsWith(`${cid}#`)) return wk.slice(cid.length);
  if (wk.startsWith(cid)) {
    let rest = wk.slice(cid.length);
    if (rest.startsWith("_")) rest = rest.slice(1);
    return rest;
  }

  if (wk.startsWith("char_")) return wk;

  return "";
}

function buildCnSkinAvatarUrl(wordKey) {
  if (!wordKey) return null;
  return `${CN_AVATAR_BASE}skins/${encodeURIComponent(wordKey)}.png`;
}

function getGroupTypeByLangType(langType) {
  return charwordTable?.voiceLangTypeDict?.[langType]?.groupType || langType;
}

function getAudioFolderTypeByLangType(langType) {
  const groupType = getGroupTypeByLangType(langType);
  if (groupType === "JP" || groupType === "LINKAGE") return "voice";
  if (groupType === "CN_MANDARIN") return "voice_cn";
  if (groupType === "EN") return "voice_en";
  if (groupType === "KR") return "voice_kr";
  if (groupType === "CUSTOM") return "voice_custom";
  return "voice_custom";
}

function buildVoiceAudioUrl(voiceAsset, voiceId, langType) {
  const folderType = getAudioFolderTypeByLangType(langType);

  let folder = "";
  let vid = voiceId;

  if (typeof voiceAsset === "string" && voiceAsset.includes("/")) {
    const [f, v] = voiceAsset.split("/");
    folder = f || "";
    vid = v || voiceId;
  } else {
    folder = voiceAsset || "";
    vid = voiceId;
  }

  if (!folder || !vid) return null;

  const normalizedFolder =
    folderType === "voice_custom"
      ? String(folder).trim().toLowerCase()
      : String(folder).trim();

  const safeFolder = encodeURIComponent(normalizedFolder);
  const safeFile = `${String(vid).trim().toLowerCase()}.mp3`;

  return `${VOICE_ASSET_BASE}/${folderType}/${safeFolder}/${safeFile}`;
}

function normalizeCvNames(cvName) {
  if (!cvName) return [];
  if (Array.isArray(cvName)) {
    return cvName
      .filter((x) => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => x !== "");
  }
  if (typeof cvName === "string") {
    const s = cvName.trim();
    return s ? [s] : [];
  }
  return [];
}

function buildLangCvLabel(langType, cvNames) {
  const tag = langType;
  const names = normalizeCvNames(cvNames).join(", ");
  return names ? `${tag} - ${names}` : tag;
}

function getCvNamesFromTable(table, variantKey, charId, langType) {
  const entry =
    table?.voiceLangDict?.[variantKey] || table?.voiceLangDict?.[charId];
  return entry?.dict?.[langType]?.cvName;
}

function getLangLabel(vnObj, skinPrefix, langType, variantKey, charId, isEnglishUI) {
  const key = skinPrefix
    ? `${skinPrefix}_${langType}_voice`
    : `${langType}_voice`;

  if (!isEnglishUI) {
    const vnVal = vnObj?.[key];
    if (typeof vnVal === "string" && vnVal.trim() !== "") return vnVal;
  }

  const enCvNames = getCvNamesFromTable(
    charwordTableEn,
    variantKey,
    charId,
    langType,
  );
  if (normalizeCvNames(enCvNames).length)
    return buildLangCvLabel(langType, enCvNames);

  const baseCvNames = getCvNamesFromTable(
    charwordTable,
    variantKey,
    charId,
    langType,
  );
  if (normalizeCvNames(baseCvNames).length)
    return buildLangCvLabel(langType, baseCvNames);

  return langType;
}

function getVoiceText({ vnObj, activePrefix, voiceId, enText, cnText, isEnglishUI }) {
  const safeEn = typeof enText === "string" && enText.trim() !== "" && enText.trim() !== "/" ? enText : "";
  const safeCn = typeof cnText === "string" && cnText.trim() !== "" && cnText.trim() !== "/" ? cnText : "";

  if (isEnglishUI) return safeEn || safeCn || "";

  const key = activePrefix ? `${activePrefix}_${voiceId}` : voiceId;
  const vnText = vnObj?.[key];
  if (typeof vnText === "string" && vnText.trim() !== "") return vnText;
  return safeEn || safeCn || "";
}

function getVariantWordKeys(charId) {
  if (!charId) return [];
  const dict = charwordTable?.voiceLangDict || {};
  const list = [];
  const seen = new Set();

  const push = (key) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    list.push(key);
  };

  for (const k of Object.keys(dict)) {
    const entry = dict[k];
    if (!entry) continue;
    if (k === charId || entry.charId === charId) push(k);
  }

  list.sort((a, b) => {
    if (a === charId) return -1;
    if (b === charId) return 1;
    return a.localeCompare(b);
  });
  return list;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isNonEmptyNoteValue(v) {
  if (isNonEmptyString(v)) return true;
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === "object") return Object.keys(v).length > 0;
  return false;
}

function normalizeNewlines(text) {
  return String(text ?? "")
    .split("\r\n")
    .join("\n")
    .split("\r")
    .join("\n")
    .split("\\n")
    .join("\n");
}

function getScopedVnValue(
  vnObj,
  { baseKey, charId, selectedVariantKey, activePrefix, skinPrefix },
) {
  if (!vnObj || !baseKey) return "";

  const hasScopedPrefix = isNonEmptyString(activePrefix) || isNonEmptyString(skinPrefix);
  const isBaseVariant =
    (!selectedVariantKey || !charId || String(selectedVariantKey) === String(charId)) &&
    !hasScopedPrefix;

  const candidates = [];
  const push = (key) => {
    if (!key || candidates.includes(key)) return;
    candidates.push(key);
  };

  if (isBaseVariant) {
    push(baseKey);
  } else {
    push(`${selectedVariantKey}_${baseKey}`);
    push(activePrefix ? `${activePrefix}_${baseKey}` : "");
    push(skinPrefix ? `${skinPrefix}_${baseKey}` : "");
  }

  for (const key of candidates) {
    const val = vnObj?.[key];
    if (isNonEmptyNoteValue(val)) return val;
  }

  return "";
}

function normalizeNoteId(raw, fallback) {
  const s = String(raw ?? "").trim();
  const cleaned = s
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/^note[_-]?/i, "")
    .trim();
  return cleaned || String(fallback || "");
}

function getNoteTextFromValue(value) {
  if (isNonEmptyString(value)) return value.trim();
  if (!value || typeof value !== "object") return "";
  return (
    value.text ||
    value.note ||
    value.content ||
    value.description ||
    value.value ||
    ""
  );
}

function parseTranslatorNotes(raw) {
  if (!isNonEmptyNoteValue(raw)) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => {
        const id = normalizeNoteId(item?.id ?? item?.key ?? item?.noteId, idx + 1);
        const text = getNoteTextFromValue(item);
        return isNonEmptyString(text) ? { id, text: String(text).trim() } : null;
      })
      .filter(Boolean);
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw)
      .map(([key, value], idx) => {
        const id = normalizeNoteId(key, idx + 1);
        const text = getNoteTextFromValue(value);
        return isNonEmptyString(text) ? { id, text: String(text).trim() } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const an = Number(a.id);
        const bn = Number(b.id);
        if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
        return String(a.id).localeCompare(String(b.id));
      });
  }

  const lines = normalizeNewlines(raw)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const parsed = lines
    .map((line, idx) => {
      const m = /^(?:\[([^\]]+)\]|(\d+))[\s:.)-]+([\s\S]+)$/.exec(line);
      if (m) {
        return { id: normalizeNoteId(m[1] || m[2], idx + 1), text: m[3].trim() };
      }
      return { id: String(idx + 1), text: line };
    })
    .filter((note) => isNonEmptyString(note.text));

  return parsed;
}

function makeDomId(raw) {
  return String(raw || "note")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "note";
}

function getNoteRefDomId(scopeId, noteId) {
  return `voice-note-ref-${scopeId}-${makeDomId(noteId)}`;
}

function getNoteItemDomId(scopeId, noteId) {
  return `voice-trans-note-${scopeId}-${makeDomId(noteId)}`;
}

function scrollToDomId(id) {
  if (typeof document === "undefined" || !id) return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

const SUPERSCRIPT_DIGITS = {
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹",
};

function toSuperscriptNoteId(noteId) {
  return String(noteId ?? "")
    .split("")
    .map((ch) => SUPERSCRIPT_DIGITS[ch] || ch)
    .join("");
}

function TranslatorNoteLink({
  id,
  label,
  keyPrefix,
  start,
  noteIds,
  scopeId,
  seenRefIds,
}) {
  if (!noteIds?.has(id)) return label ? `{'${label}'[${id}]}` : `[${id}]`;

  const refId = getNoteRefDomId(scopeId, id);
  const itemId = getNoteItemDomId(scopeId, id);
  const isFirstRef = !seenRefIds?.has(id);
  seenRefIds?.add(id);
  const superscriptId = toSuperscriptNoteId(id);

  if (label) {
    return (
      <button
        key={`${keyPrefix}-note-label-${id}-${start}`}
        id={isFirstRef ? refId : undefined}
        type="button"
        onClick={() => scrollToDomId(itemId)}
        className="inline align-baseline font-semibold text-[#22BBFF] underline decoration-[#22BBFF]/70 decoration-dotted underline-offset-2 transition hover:text-white hover:decoration-white"
        title={`Xem ghi chú của dịch giả [${id}]`}
      >
        <span>{label}</span>
        <sup className="ml-0.5 align-super text-[0.72em] font-bold leading-none">
          {superscriptId}
        </sup>
      </button>
    );
  }

  return (
    <sup
      key={`${keyPrefix}-note-${id}-${start}`}
      className="ml-0.5 align-super text-[0.72em] leading-none"
    >
      <button
        id={isFirstRef ? refId : undefined}
        type="button"
        onClick={() => scrollToDomId(itemId)}
        className="font-bold text-[#22BBFF] underline decoration-[#22BBFF]/70 underline-offset-2 transition hover:text-white hover:decoration-white"
        title={`Xem ghi chú của dịch giả [${id}]`}
      >
        {superscriptId}
      </button>
    </sup>
  );
}

function renderVoiceTextWithTranslatorNotes({
  text,
  keyPrefix,
  noteIds,
  scopeId,
  seenRefIds,
}) {
  const value = String(text ?? "");
  if (!value) return null;

  const re = /\{\s*'([^']+)'\s*\[(\d+)\]\s*\}|\[(\d+)\]/g;
  const nodes = [];
  let last = 0;
  let match;

  while ((match = re.exec(value)) !== null) {
    const label = match[1] || "";
    const id = normalizeNoteId(match[2] || match[3]);
    const start = match.index;
    const end = re.lastIndex;

    if (start > last) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-text-${last}-${start}`}>
          {renderAKText(value.slice(last, start), `${keyPrefix}-ak-${last}`, {
            preferNoteForDollar: true,
          })}
        </React.Fragment>,
      );
    }

    nodes.push(
      <TranslatorNoteLink
        key={`${keyPrefix}-note-link-${id}-${start}`}
        id={id}
        label={label}
        keyPrefix={keyPrefix}
        start={start}
        noteIds={noteIds}
        scopeId={scopeId}
        seenRefIds={seenRefIds}
      />,
    );

    last = end;
  }

  if (last < value.length) {
    nodes.push(
      <React.Fragment key={`${keyPrefix}-text-tail-${last}`}>
        {renderAKText(value.slice(last), `${keyPrefix}-ak-tail-${last}`, {
          preferNoteForDollar: true,
        })}
      </React.Fragment>,
    );
  }

  return nodes.length ? nodes : renderAKText(value, keyPrefix, { preferNoteForDollar: true });
}

function TranslatorNotesBlock({ notes, scopeId }) {
  if (!Array.isArray(notes) || notes.length === 0) return null;

  return (
    <div className="ak-steel-card rounded-xl border border-[#22BBFF]/25 bg-[#0b5f85]/10 px-4 py-4">
      <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
        <span className="h-2 w-2 rounded-full bg-[#22BBFF] shadow-[0_0_10px_rgba(34,187,255,0.85)]" />
        Ghi chú của dịch giả
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-[#dceefa]">
        {notes.map((note) => {
          const refId = getNoteRefDomId(scopeId, note.id);
          const itemId = getNoteItemDomId(scopeId, note.id);
          return (
            <div key={note.id} id={itemId} className="flex gap-3 scroll-mt-24">
              <button
                type="button"
                onClick={() => scrollToDomId(refId)}
                className="shrink-0 font-bold text-[#22BBFF] underline decoration-[#22BBFF]/70 underline-offset-2 transition hover:text-white hover:decoration-white"
                title={`Quay lại voiceline [${note.id}]`}
                aria-label={`Quay lại voiceline ghi chú ${note.id}`}
              >
                <sup className="align-super text-[0.8em] leading-none">
                  {toSuperscriptNoteId(note.id)}
                </sup>
              </button>
              <div className="min-w-0 flex-1 text-gray-100">
                {renderAKText(note.text, `translator-note-${scopeId}-${note.id}`, {
                  preferNoteForDollar: true,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const VoiceSection = ({ operator, lang = "VN" }) => {
  const charId = useMemo(() => getOperatorCharId(operator), [operator]);
  const isEnglishUI = String(lang || "VN").toUpperCase() === "EN";
  const vnObj = useMemo(() => {
    if (!charId) return null;
    return (
      charwordVn?.[charId] || charwordVn?.[getPatchMainCharId(charId)] || null
    );
  }, [charId]);

  const vnObjUsesPatchMain = useMemo(
    () =>
      !!charId &&
      !charwordVn?.[charId] &&
      !!charwordVn?.[getPatchMainCharId(charId)],
    [charId],
  );

  const variants = useMemo(() => getVariantWordKeys(charId), [charId]);

  const [selectedVariantKey, setSelectedVariantKey] = useState(charId || "");

  const audioRefs = useRef(new Map());

  const stopAllAudios = useCallback(() => {
    audioRefs.current.forEach((audio) => {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_err) {
        void _err;
      }
    });
  }, []);

  const stopOtherAudios = useCallback((keepId) => {
    audioRefs.current.forEach((audio, id) => {
      if (!audio || id === keepId) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_err) {
        void _err;
      }
    });
  }, []);

  useEffect(() => {
    if (!charId) return;
    setSelectedVariantKey((prev) => {
      if (!prev) return charId;
      if (prev === charId) return prev;
      if (variants.includes(prev)) return prev;
      return charId;
    });
  }, [charId, variants]);

  const skinPrefix = useMemo(
    () => getPrefixFromWordKey(charId, selectedVariantKey, vnObjUsesPatchMain),
    [charId, selectedVariantKey, vnObjUsesPatchMain],
  );

  const availableLangTypes = useMemo(() => {
    const entry =
      charwordTable?.voiceLangDict?.[selectedVariantKey] ||
      charwordTable?.voiceLangDict?.[charId];
    const dict = entry?.dict || {};
    return Object.keys(dict);
  }, [charId, selectedVariantKey]);

  const preferredDefaultLang = useMemo(() => {
    return (
      charwordTable?.charDefaultTypeDict?.[charId] ||
      charwordTable?.charDefaultTypeDict?.[getPatchMainCharId(charId)] ||
      charwordTable?.defaultLangType ||
      "CN_MANDARIN"
    );
  }, [charId]);

  const [selectedLangType, setSelectedLangType] =
    useState(preferredDefaultLang);

  useEffect(() => {
    if (!availableLangTypes.length) return;
    setSelectedLangType((prev) => {
      if (availableLangTypes.includes(prev)) return prev;
      if (availableLangTypes.includes(preferredDefaultLang))
        return preferredDefaultLang;
      return availableLangTypes[0];
    });
  }, [availableLangTypes, preferredDefaultLang]);

  const activeWordKey = useMemo(() => {
    const entry =
      charwordTable?.voiceLangDict?.[selectedVariantKey] ||
      charwordTable?.voiceLangDict?.[charId];
    const langInfo = entry?.dict?.[selectedLangType];
    return langInfo?.wordkey || selectedVariantKey || charId || "";
  }, [charId, selectedVariantKey, selectedLangType]);

  const activePrefix = useMemo(
    () => getPrefixFromWordKey(charId, activeWordKey, vnObjUsesPatchMain),
    [charId, activeWordKey, vnObjUsesPatchMain],
  );

  const voiceLines = useMemo(() => {
    const words = charwordTable?.charWords || {};
    if (!activeWordKey) return [];

    const list = [];

    for (const v of Object.values(words)) {
      if (!v) continue;
      if (v.wordKey === activeWordKey) list.push(v);
    }

    if (!list.length) {
      const prefix = `${activeWordKey}_`;
      for (const [k, v] of Object.entries(words)) {
        if (k.startsWith(prefix)) list.push(v);
      }
    }

    list.sort((a, b) => {
      const ai = typeof a.voiceIndex === "number" ? a.voiceIndex : 9999;
      const bi = typeof b.voiceIndex === "number" ? b.voiceIndex : 9999;
      if (ai !== bi) return ai - bi;
      return String(a.voiceId || "").localeCompare(String(b.voiceId || ""));
    });

    return list;
  }, [activeWordKey]);

  useEffect(() => {
    stopAllAudios();
  }, [selectedVariantKey, selectedLangType, activeWordKey, stopAllAudios]);

  const transText = useMemo(() => {
    if (isEnglishUI) return "";
    const t = getScopedVnValue(vnObj, {
      baseKey: "trans",
      charId,
      selectedVariantKey,
      activePrefix,
      skinPrefix,
    });
    return typeof t === "string" ? t.trim() : "";
  }, [vnObj, isEnglishUI, charId, selectedVariantKey, activePrefix, skinPrefix]);

  const translatorNotes = useMemo(() => {
    if (isEnglishUI) return [];
    const raw = getScopedVnValue(vnObj, {
      baseKey: "trans_note",
      charId,
      selectedVariantKey,
      activePrefix,
      skinPrefix,
    });
    return parseTranslatorNotes(raw);
  }, [vnObj, isEnglishUI, charId, selectedVariantKey, activePrefix, skinPrefix]);

  const translatorNoteIds = useMemo(
    () => new Set(translatorNotes.map((note) => String(note.id))),
    [translatorNotes],
  );

  const translatorNoteScopeId = useMemo(
    () => makeDomId(`${charId || "voice"}-${selectedVariantKey || activeWordKey || "base"}`),
    [charId, selectedVariantKey, activeWordKey],
  );

  const defaultAvatarUrl = useMemo(() => buildCnAvatarUrl(charId), [charId]);
  const noteRefSeenInRender = new Set();

  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full items-center gap-2 overflow-x-auto">
          {variants.map((wk) => {
            const isSelected = wk === selectedVariantKey;
            const isDefault = wk === charId;
            const imgUrl = isDefault
              ? defaultAvatarUrl
              : buildCnSkinAvatarUrl(wk);

            return (
              <button
                key={wk}
                type="button"
                onClick={() => {
                  stopAllAudios();
                  setSelectedVariantKey(wk);
                }}
                className={`shrink-0 rounded-xl border transition ${
                  isSelected
                    ? "border-[#d7e0e8] shadow-[0_0_16px_rgba(215,224,232,0.20)]"
                    : "border-[#6f7b86]/35 hover:border-[#d7e0e8]/55"
                }`}
                style={{ padding: 0 }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-[68px] w-[68px] rounded-xl object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="h-[68px] w-[68px] rounded-xl ak-steel-subcard" />
                )}
              </button>
            );
          })}
          {!variants.length ? (
            <div className="text-base text-[#cdd6de]">No voice data.</div>
          ) : null}
        </div>

        {/* Right: language dropdown */}
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <span className="text-base text-gray-300">Voice:</span>
          <select
            value={selectedLangType}
            onChange={(e) => {
              stopAllAudios();
              setSelectedLangType(e.target.value);
            }}
            className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-[#1a1a1a] px-3 py-1 text-sm text-white sm:max-w-[220px] sm:flex-none truncate"
          >
            {availableLangTypes.map((lt) => (
              <option key={lt} value={lt}>
                {getLangLabel(
                  vnObj,
                  skinPrefix,
                  lt,
                  selectedVariantKey,
                  charId,
                  isEnglishUI,
                )}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TranslatorCredit text={transText} links={vnObj} className="mb-4" />

      {/* Voice list */}
      <div className="space-y-4">
        {voiceLines.map((v) => {
          const title = translateVoiceTitle(v.voiceTitle);
          const audioUrl = buildVoiceAudioUrl(
            v.voiceAsset,
            v.voiceId,
            selectedLangType,
          );
          const enText = charwordTableEn?.charWords?.[v.charWordId]?.voiceText;
          const text = getVoiceText({
            vnObj,
            activePrefix,
            voiceId: v.voiceId,
            enText,
            cnText: v.voiceText,
            isEnglishUI,
          });

          return (
            <div
              key={v.charWordId}
              className="ak-steel-card overflow-hidden rounded-xl"
            >
              {/* Title (bigger) */}
              <div className="ak-steel-voice-title px-4 py-3 text-lg font-semibold">
                <span className="text-[#cdd6de]">{v.voiceId}</span>
                <span className="mx-2 text-[#68737f]">•</span>
                <span>{title}</span>
              </div>

              {/* Audio */}
              <div className="ak-steel-voice-audio px-4 py-3">
                {audioUrl ? (
                  <audio
                    controls
                    preload="none"
                    src={audioUrl}
                    className="w-full"
                    ref={(el) => {
                      if (el) audioRefs.current.set(v.charWordId, el);
                      else audioRefs.current.delete(v.charWordId);
                    }}
                    onPlay={() => stopOtherAudios(v.charWordId)}
                  />
                ) : (
                  <div className="text-base text-[#9faab6]">No audio.</div>
                )}
              </div>

              {/* Text (bigger) */}
              <div className="bg-[#2a2a2a] px-4 py-4 text-base text-gray-100 whitespace-pre-wrap">
                {renderVoiceTextWithTranslatorNotes({
                  text,
                  keyPrefix: `voice-text-${v.charWordId}`,
                  noteIds: translatorNoteIds,
                  scopeId: translatorNoteScopeId,
                  seenRefIds: noteRefSeenInRender,
                })}
              </div>
            </div>
          );
        })}

        {!voiceLines.length ? (
          <div className="text-base text-[#cdd6de]">
            No voice lines for this Operator.
          </div>
        ) : null}

        <TranslatorNotesBlock notes={translatorNotes} scopeId={translatorNoteScopeId} />
      </div>
    </div>
  );
};

export default VoiceSection;
