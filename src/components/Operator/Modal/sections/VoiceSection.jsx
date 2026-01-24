import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItalicText } from "../../../StatHover";
import charwordTable from "../../../../data/voiceline/charword_table.json";
import charwordVn from "../../../../data/voiceline/charword_vn.json";
import { buildCnAvatarUrl, CN_AVATAR_BASE, getOperatorCharId } from "../../../../utils/operatorAvatar";

const VOICE_ASSET_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/voice/assets/dyn/audio/sound_beta_2";

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
  进驻设施: "Vào base",
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

function getPrefixFromWordKey(charId, wordKey) {
  if (!wordKey || !charId || wordKey === charId) return "";
  if (wordKey.startsWith(`${charId}_`)) return wordKey.slice(`${charId}_`.length);
  if (wordKey.startsWith(`${charId}#`)) return wordKey.slice(charId.length);
  if (wordKey.startsWith(charId)) {
    let rest = wordKey.slice(charId.length);
    if (rest.startsWith("_")) rest = rest.slice(1);
    return rest;
  }
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

function getLangLabel(vnObj, skinPrefix, langType) {
  if (!vnObj) return langType;
  const key = skinPrefix ? `${skinPrefix}_${langType}_voice` : `${langType}_voice`;
  return vnObj[key] || langType;
}

function getVoiceText(vnObj, activePrefix, voiceId, fallbackText) {
  if (!vnObj) return fallbackText || "";
  const key = activePrefix ? `${activePrefix}_${voiceId}` : voiceId;
  const t = vnObj[key];
  if (typeof t === "string" && t.trim() !== "") return t;
  return fallbackText || "";
}

function getVariantWordKeys(charId) {
  if (!charId) return [];
  const dict = charwordTable?.voiceLangDict || {};
  const list = [];
  for (const k of Object.keys(dict)) {
    const entry = dict[k];
    if (!entry || entry.charId !== charId) continue;
    if (k === charId) list.push(k);
    else if (k.includes("#")) list.push(k);
  }

  list.sort((a, b) => {
    if (a === charId) return -1;
    if (b === charId) return 1;
    return a.localeCompare(b);
  });
  return list;
}

const VoiceSection = ({ operator }) => {
  const charId = useMemo(() => getOperatorCharId(operator), [operator]);
  const vnObj = useMemo(() => (charId ? charwordVn?.[charId] : null), [charId]);

  const variants = useMemo(() => getVariantWordKeys(charId), [charId]);

  const [selectedVariantKey, setSelectedVariantKey] = useState(charId || "");

  const audioRefs = useRef(new Map());

  const stopAllAudios = useCallback(() => {
    audioRefs.current.forEach((audio) => {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {

      }
    });
  }, []);

  const stopOtherAudios = useCallback((keepId) => {
    audioRefs.current.forEach((audio, id) => {
      if (!audio || id === keepId) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {

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
    () => getPrefixFromWordKey(charId, selectedVariantKey),
    [charId, selectedVariantKey]
  );

  const availableLangTypes = useMemo(() => {
    const entry = charwordTable?.voiceLangDict?.[selectedVariantKey] || charwordTable?.voiceLangDict?.[charId];
    const dict = entry?.dict || {};
    return Object.keys(dict);
  }, [charId, selectedVariantKey]);

  const preferredDefaultLang = useMemo(() => {
    return charwordTable?.charDefaultTypeDict?.[charId] || charwordTable?.defaultLangType || "CN_MANDARIN";
  }, [charId]);

  const [selectedLangType, setSelectedLangType] = useState(preferredDefaultLang);

  useEffect(() => {
    if (!availableLangTypes.length) return;
    setSelectedLangType((prev) => {
      if (availableLangTypes.includes(prev)) return prev;
      if (availableLangTypes.includes(preferredDefaultLang)) return preferredDefaultLang;
      return availableLangTypes[0];
    });
  }, [availableLangTypes, preferredDefaultLang]);

  const activeWordKey = useMemo(() => {
    const entry = charwordTable?.voiceLangDict?.[selectedVariantKey] || charwordTable?.voiceLangDict?.[charId];
    const langInfo = entry?.dict?.[selectedLangType];
    return langInfo?.wordkey || selectedVariantKey || charId || "";
  }, [charId, selectedVariantKey, selectedLangType]);

  const activePrefix = useMemo(
    () => getPrefixFromWordKey(charId, activeWordKey),
    [charId, activeWordKey]
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
    const t = vnObj?.trans;
    return typeof t === "string" ? t.trim() : "";
  }, [vnObj]);

  const defaultAvatarUrl = useMemo(() => buildCnAvatarUrl(charId), [charId]);

  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      {transText ? (
        <div className="mb-4 rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-gray-200">
          {transText}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {variants.map((wk) => {
            const isSelected = wk === selectedVariantKey;
            const isDefault = wk === charId;
            const imgUrl = isDefault ? defaultAvatarUrl : buildCnSkinAvatarUrl(wk);

            return (
              <button
                key={wk}
                type="button"
                onClick={() => {
                  stopAllAudios();
                  setSelectedVariantKey(wk);
                }}
                className={`shrink-0 rounded-xl border transition ${
                  isSelected ? "border-white" : "border-gray-700 hover:border-gray-400"
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
                  <div className="h-[68px] w-[68px] rounded-xl bg-[#2a2a2a]" />
                )}
              </button>
            );
          })}
          {!variants.length ? <div className="text-base text-gray-300">No voice data.</div> : null}
        </div>

        {/* Right: language dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-base text-gray-300">Voice:</span>
          <select
            value={selectedLangType}
            onChange={(e) => {
              stopAllAudios();
              setSelectedLangType(e.target.value);
            }}
            className="rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-base text-white outline-none"
          >
            {availableLangTypes.map((lt) => (
              <option key={lt} value={lt}>
                {getLangLabel(vnObj, skinPrefix, lt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voice list */}
      <div className="space-y-4">
        {voiceLines.map((v) => {
          const title = translateVoiceTitle(v.voiceTitle);
          const audioUrl = buildVoiceAudioUrl(v.voiceAsset, v.voiceId, selectedLangType);
          const text = getVoiceText(vnObj, activePrefix, v.voiceId, v.voiceText);

          return (
            <div key={v.charWordId} className="overflow-hidden rounded-xl border border-gray-800">
              {/* Title (bigger) */}
              <div className="bg-black px-4 py-3 text-lg font-semibold">
                <span className="text-gray-300">{v.voiceId}</span>
                <span className="mx-2 text-gray-600">•</span>
                <span>{title}</span>
              </div>

              {/* Audio */}
              <div className="bg-[#141414] px-4 py-3">
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
                  <div className="text-base text-gray-400">No audio.</div>
                )}
              </div>

              {/* Text (bigger) */}
              <div className="bg-[#2a2a2a] px-4 py-4 text-base text-gray-100 whitespace-pre-wrap">
                <ItalicText text={text} keyPrefix={`voice-text-${v.charWordId}`} />
              </div>
            </div>
          );
        })}

        {!voiceLines.length ? (
          <div className="text-base text-gray-300">No voice lines for this operator.</div>
        ) : null}
      </div>
    </div>
  );
};

export default VoiceSection;
