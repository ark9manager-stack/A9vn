import React, { useEffect, useMemo, useState } from "react";
import charwordTable from "../../../../data/voiceline/charword_table.json";
import charwordVn from "../../../../data/voiceline/charword_vn.json";
import { buildCnAvatarUrl, CN_AVATAR_BASE, getOperatorCharId } from "../../../../utils/operatorAvatar";

const VOICE_ASSET_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/voice/assets/dyn/audio/sound_beta_2";

const VOICE_TITLE_VI = {
  "任命助理": "Bổ nhiệm làm trợ lý",
  "交谈1": "Trò chuyện 1",
  "交谈2": "Trò chuyện 2",
  "交谈3": "Trò chuyện 3",
  "晋升后交谈1": "Trò chuyện sau khi thăng hạng 1",
  "晋升后交谈2": "Trò chuyện sau khi thăng hạng 2",
  "信赖提升后交谈1": "Trò chuyện sau khi tăng tin tưởng 1",
  "信赖提升后交谈2": "Trò chuyện sau khi tăng tin tưởng 2",
  "信赖提升后交谈3": "Trò chuyện sau khi tăng tin tưởng 3",
  "闲置": "Treo máy",
  "干员报到": "Báo danh",
  "观看作战记录": "Xem Battle Record (Tăng exp OP)",
  "精英化晋升1": "Thăng tiến 1",
  "精英化晋升2": "Thăng tiến 2",
  "编入队伍": "Xếp vào đội hình",
  "任命队长": "Bổ nhiệm làm đội trưởng",
  "行动出发": "Khởi hành nhiệm vụ",
  "行动开始": "Bắt đầu chiến dịch",
  "选中干员1": "Lựa chọn 1",
  "选中干员2": "Lựa chọn 2",
  "部署1": "Triển khai 1",
  "部署2": "Triển khai 2",
  "作战中1": "Đang giao chiến 1",
  "作战中2": "Đang giao chiến 2",
  "作战中3": "Đang giao chiến 3",
  "作战中4": "Đang giao chiến 4",
  "完成高难行动": "Hoàn thành nhiệm vụ 4*",
  "3星结束行动": "Hoàn thành nhiệm vụ 3*",
  "非3星结束行动": "Hoàn thành nhiệm vụ 2*",
  "行动失败": "Nhiệm vụ thất bại",
  "进驻设施": "Vào base",
  "戳一下": "Chạm",
  "信赖触摸": "Chạm (với độ tin tưởng cao)",
  "标题": "Tiêu đề game (khi login)",
  "新年祝福": "Chúc năm mới",
  "问候": "Hỏi thăm (Sau khi login vào game)",
  "生日": "Chúc mừng sinh nhật",
  "周年庆典": "Kỷ niệm hàng năm",
};

function getVariantPrefix(charId, wordKey) {
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

function getLangGroupType(langType) {
  return charwordTable?.voiceLangTypeDict?.[langType]?.groupType || langType;
}

function getAudioFolderByLang(langType) {
  const groupType = getLangGroupType(langType);
  return groupType === "JP" || groupType === "LINKAGE" ? "voice" : "voice_cn";
}

function buildVoiceAudioUrl(voiceAssetOrWordKey, voiceId, langType) {
  const folderType = getAudioFolderByLang(langType);
  let folder = voiceAssetOrWordKey;
  let vid = voiceId;

  if (typeof voiceAssetOrWordKey === "string" && voiceAssetOrWordKey.includes("/")) {
    const [f, v] = voiceAssetOrWordKey.split("/");
    folder = f;
    vid = v || voiceId;
  }

  const safeFolder = encodeURIComponent(String(folder || "").trim());
  const safeFile = `${String(vid || voiceId || "")
    .trim()
    .toLowerCase()}.mp3`;

  if (!safeFolder || safeFile === ".mp3") return null;
  return `${VOICE_ASSET_BASE}/${folderType}/${safeFolder}/${safeFile}`;
}

function getDisplayLangLabel(vnObj, variantPrefix, langType) {
  if (!vnObj) return langType;
  const key = variantPrefix ? `${variantPrefix}_${langType}_voice` : `${langType}_voice`;
  return vnObj[key] || langType;
}

function getVoiceText(vnObj, variantPrefix, voiceId, fallbackText) {
  if (!vnObj) return fallbackText || "";
  const key = variantPrefix ? `${variantPrefix}_${voiceId}` : voiceId;
  const t = vnObj[key];
  if (typeof t === "string" && t.trim() !== "") return t;
  return fallbackText || "";
}

function translateVoiceTitle(voiceTitle) {
  if (!voiceTitle) return "";
  return VOICE_TITLE_VI[voiceTitle] || voiceTitle;
}

const VoiceSection = ({ operator }) => {
  const charId = useMemo(() => getOperatorCharId(operator), [operator]);
  const vnObj = useMemo(() => (charId ? charwordVn?.[charId] : null), [charId]);

  const variants = useMemo(() => {
    if (!charId) return [];
    const dict = charwordTable?.voiceLangDict || {};
    const list = [];

    if (dict[charId]) list.push(charId);

    for (const k of Object.keys(dict)) {
      if (k === charId) continue;
      if (k.startsWith(`${charId}_`) || k.startsWith(`${charId}#`)) list.push(k);
    }

    list.sort((a, b) => {
      if (a === charId) return -1;
      if (b === charId) return 1;
      return a.localeCompare(b);
    });

    return list;
  }, [charId]);

  const [selectedWordKey, setSelectedWordKey] = useState(charId || "");
  useEffect(() => {
    if (!charId) return;
    setSelectedWordKey((prev) => {
      if (!prev) return charId;
      if (prev === charId) return prev;
      if (variants.includes(prev)) return prev;
      return charId;
    });
  }, [charId, variants]);

  const variantPrefix = useMemo(
    () => getVariantPrefix(charId, selectedWordKey),
    [charId, selectedWordKey]
  );

  const availableLangTypes = useMemo(() => {
    const entry =
      charwordTable?.voiceLangDict?.[selectedWordKey] || charwordTable?.voiceLangDict?.[charId];
    const dict = entry?.dict || {};
    return Object.keys(dict);
  }, [charId, selectedWordKey]);

  const preferredDefaultLang = useMemo(() => {
    const prefer =
      charwordTable?.charDefaultTypeDict?.[charId] ||
      charwordTable?.defaultLangType ||
      "CN_MANDARIN";
    return prefer;
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

  const voiceLines = useMemo(() => {
    const words = charwordTable?.charWords || {};
    if (!selectedWordKey) return [];

    const prefix = `${selectedWordKey}_`;
    const list = [];

    for (const [k, v] of Object.entries(words)) {
      if (k.startsWith(prefix)) list.push(v);
    }

    list.sort((a, b) => {
      const ai = typeof a.voiceIndex === "number" ? a.voiceIndex : 9999;
      const bi = typeof b.voiceIndex === "number" ? b.voiceIndex : 9999;
      if (ai !== bi) return ai - bi;
      return String(a.voiceId || "").localeCompare(String(b.voiceId || ""));
    });

    return list;
  }, [selectedWordKey]);

  const transText = useMemo(() => {
    const t = vnObj?.trans;
    return typeof t === "string" ? t.trim() : "";
  }, [vnObj]);

  const defaultAvatarUrl = useMemo(() => buildCnAvatarUrl(charId), [charId]);

  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      {transText ? (
        <div className="mb-4 rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-xs text-gray-300">
          {transText}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {variants.map((wk) => {
            const isSelected = wk === selectedWordKey;
            const isDefault = wk === charId;
            const imgUrl = isDefault ? defaultAvatarUrl : buildCnSkinAvatarUrl(wk);
            const label = isDefault ? "Default" : getVariantPrefix(charId, wk) || "Skin";

            return (
              <button
                key={wk}
                type="button"
                onClick={() => setSelectedWordKey(wk)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1 transition ${
                  isSelected ? "border-white" : "border-gray-700 hover:border-gray-400"
                }`}
                title={label}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={label}
                    className="h-10 w-10 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-[#2a2a2a]" />
                )}
                <span className="whitespace-nowrap text-xs text-gray-200">{label}</span>
              </button>
            );
          })}
          {!variants.length ? <div className="text-sm text-gray-300">No voice data.</div> : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Voice:</span>
          <select
            value={selectedLangType}
            onChange={(e) => setSelectedLangType(e.target.value)}
            className="rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none"
          >
            {availableLangTypes.map((lt) => (
              <option key={lt} value={lt}>
                {getDisplayLangLabel(vnObj, variantPrefix, lt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {voiceLines.map((v) => {
          const title = translateVoiceTitle(v.voiceTitle);
          const audioUrl = buildVoiceAudioUrl(v.voiceAsset || v.wordKey, v.voiceId, selectedLangType);
          const text = getVoiceText(vnObj, variantPrefix, v.voiceId, v.voiceText);

          return (
            <div key={v.charWordId} className="overflow-hidden rounded-xl border border-gray-800">
              <div className="bg-black px-3 py-2 text-base font-semibold">
                <span className="text-gray-300">{v.voiceId}</span>
                <span className="mx-2 text-gray-600">•</span>
                <span>{title}</span>
              </div>

              <div className="bg-[#141414] px-3 py-3">
                {audioUrl ? (
                  <audio controls preload="none" src={audioUrl} className="w-full" />
                ) : (
                  <div className="text-sm text-gray-400">No audio.</div>
                )}
              </div>

              <div className="bg-[#2a2a2a] px-3 py-3 text-sm text-gray-100 whitespace-pre-wrap">
                {text}
              </div>
            </div>
          );
        })}

        {!voiceLines.length ? (
          <div className="text-sm text-gray-300">No voice lines for this operator.</div>
        ) : null}
      </div>
    </div>
  );
};

export default VoiceSection;
