import React, { useEffect, useMemo, useState } from "react";
import skinTable from "../../data/skins/skin_table.json";

const BG_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Buc%5Dpacked/bg_img.png";

const ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters";

const ICON_MODEL_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_model.png";
const ICON_DRAWER_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_drawer.png";

function buildEliteUrl(charId, elite) {
  if (!charId) return null;
  if (elite === "E0") return `${ART_BASE}/${charId}/${charId}_1.png`;
  if (elite === "E2") return `${ART_BASE}/${charId}/${charId}_2.png`;
  if (elite === "E1") {
    const filename = `${charId}_1+.png`.replace("+", "%2B");
    return `${ART_BASE}/${charId}/${filename}`;
  }
  return `${ART_BASE}/${charId}/${charId}_1.png`;
}

function buildSkinUrl(charId, skinOrId) {
  if (!charId || !skinOrId) return null;
  const rawId =
    typeof skinOrId === "string"
      ? skinOrId
      : skinOrId.portraitId || skinOrId.avatarId || skinOrId.skinId;

  if (!rawId) return null;
  const base = String(rawId).replace(/\.png$/i, "").replace("@", "_");
  return `${ART_BASE}/${charId}/${encodeURIComponent(base)}.png`;
}


function pickDisplaySkin(obj) {
  return obj?.displaySkin || obj?.skin || obj || null;
}

export default function OperatorModal({ operator, onClose }) {
  if (!operator) return null;

  const charId = operator?.id || operator?.charId || operator?.char_id || "";
  const titleText = operator?.name_vn || operator?.name || charId;

  const phaseCount = operator?.phases?.length ?? 1;
  const hasElite2 = phaseCount >= 3;
  const hasElite1Art = charId === "char_002_amiya";

  const skinsDict = skinTable?.charSkins || skinTable?.skins || {};

  const eliteMeta = useMemo(() => {
    const e0Key = `${charId}#1`;
    const e1Key = `${charId}#1+`;
    const e2Key = `${charId}#2`;

    const e0 = skinsDict?.[e0Key];
    const e1 = skinsDict?.[e1Key];
    const e2 = skinsDict?.[e2Key];

    return {
      e0: pickDisplaySkin(e0),
      e1: pickDisplaySkin(e1),
      e2: pickDisplaySkin(e2),
    };
  }, [charId, skinsDict]);

  // Only list true skins (charId@xxxx...), exclude elite keys (#1, #1+, #2)
  const skinsForChar = useMemo(() => {
    const dict = skinsDict || {};
    const all = Object.values(dict);

    const matched = all.filter((s) => s?.charId === charId);

    const extra = matched.filter((s) => {
      const sid = s?.skinId;
      if (!sid) return false;
      if (sid === `${charId}#1`) return false;
      if (sid === `${charId}#2`) return false;
      if (sid === `${charId}#1+`) return false;
      return sid.startsWith(`${charId}@`);
    });

    return extra
      .map((s) => {
        const display = pickDisplaySkin(s);
        return {
          key: s.skinId,
          kind: "skin",
          skinId: s.skinId,
          skinName: display?.skinName ?? null,
          drawerList: display?.drawerList ?? [],
          url: buildSkinUrl(charId, s),
        };
      })
      .filter((x) => !!x.url);
  }, [charId, skinsDict]);

  const options = useMemo(() => {
    if (!charId) return [];

    const out = [];

    out.push({
      key: "E0",
      kind: "elite",
      label: "Elite 0",
      url: buildEliteUrl(charId, "E0"),
      skinName: eliteMeta?.e0?.skinName ?? null,
      drawerList: eliteMeta?.e0?.drawerList ?? [],
      order: 0,
    });

    if (hasElite1Art) {
      out.push({
        key: "E1",
        kind: "elite",
        label: "Elite 1",
        url: buildEliteUrl(charId, "E1"),
        skinName: eliteMeta?.e1?.skinName ?? null,
        drawerList: eliteMeta?.e1?.drawerList ?? [],
        order: 1,
      });
    }

    if (hasElite2) {
      out.push({
        key: "E2",
        kind: "elite",
        label: "Elite 2",
        url: buildEliteUrl(charId, "E2"),
        skinName: eliteMeta?.e2?.skinName ?? null,
        drawerList: eliteMeta?.e2?.drawerList ?? [],
        order: 2,
      });
    }

    const skins = skinsForChar
      .slice()
      .sort((a, b) => String(a.skinId).localeCompare(String(b.skinId)))
      .map((s, idx) => ({
        key: s.key,
        kind: "skin",
        label: s.skinName || s.skinId,
        url: s.url,
        skinName: s.skinName,
        drawerList: s.drawerList || [],
        order: 100 + idx,
      }));

    return [...out, ...skins].sort((a, b) => a.order - b.order);
  }, [charId, eliteMeta, hasElite1Art, hasElite2, skinsForChar]);

  const [selectedKey, setSelectedKey] = useState(options?.[0]?.key || "E0");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!options.length) return;
    const exists = options.some((o) => o.key === selectedKey);
    if (!exists) setSelectedKey(options[0].key);
  }, [charId, options.length]);

  useEffect(() => {
    setImgError(false);
  }, [selectedKey, charId]);

  const selectedOption = useMemo(() => {
    return options.find((x) => x.key === selectedKey) || options[0];
  }, [options, selectedKey]);

  const displaySkinName = useMemo(() => {
    if (!selectedOption) return "";
    if (!selectedOption.skinName) return selectedOption.label;
    return selectedOption.skinName;
  }, [selectedOption]);

  const displayDrawer = useMemo(() => {
    const list = selectedOption?.drawerList || [];
    const arr = Array.isArray(list) ? list.filter(Boolean) : [];
    return arr.length ? arr.join(", ") : "-";
  }, [selectedOption]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={() => onClose?.()}
    >
      <div
        className="relative w-[95vw] max-w-[1280px] aspect-[16/9] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BG */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />
        {/* ✅ dark overlay 5-10% */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.10)" }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg px-3 py-2"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="relative z-10 h-full w-full grid grid-cols-1 md:grid-cols-[680px_600px]">
          {/* LEFT */}
          <div className="relative h-full p-4">
            <div className="relative h-full">
              {/* Name (top-right of LEFT area) */}
              <div className="absolute right-3 top-3 z-20 text-right">
                <div className="text-2xl font-extrabold text-white leading-tight drop-shadow">
                  {titleText}
                </div>
                <div className="text-xs font-semibold text-white/85 drop-shadow">
                  {charId}
                </div>
              </div>

              {/* Art */}
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedOption?.url && !imgError ? (
                  <img
                    src={selectedOption.url}
                    alt={operator?.name || charId}
                    className="max-h-full max-w-full object-contain"
                    loading="eager"
                    draggable={false}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="text-white/70 text-sm">No Image</div>
                )}
              </div>

              {/* Bottom-left: Skin name + drawer */}
              <div className="absolute bottom-3 left-3 z-20 w-[145px] max-w-[calc(100%-24px)] rounded-xl bg-black/55 p-3 text-white backdrop-blur">
                <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-1">
                  {/* Row 1: skin */}
                  <img
                    src={ICON_MODEL_URL}
                    alt="skin"
                    className="h-4 w-6 object-contain opacity-90 mt-[2px] shrink-0"
                    draggable={false}
                  />
                  <div className="text-sm font-semibold leading-snug truncate">
                    {displaySkinName || "—"}
                  </div>

                  {/* Row 2: drawer */}
                  <img
                    src={ICON_DRAWER_URL}
                    alt="drawer"
                    className="h-4 w-6 object-contain opacity-90 mt-[1px] shrink-0"
                    draggable={false}
                  />
                  <div className="text-xs text-white/85 leading-snug truncate">
                    {displayDrawer}
                  </div>
                </div>
              </div>


              {/* Bottom-right: options (like draw_model, no title, no scroll, wider/closer) */}
              {options.length > 1 && (
                <div className="absolute right-1 bottom-3 z-20 w-[140px] rounded-xl bg-black/55 p-2 text-white backdrop-blur">
                  <div className="flex flex-col gap-1">
                    {options.map((opt) => {
                      const active = selectedKey === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedKey(opt.key)}
                          className={`w-full text-left rounded-lg px-2 py-1.5 text-xs font-semibold transition
                            ${
                              active
                                ? "bg-emerald-600 text-white"
                                : "bg-white/10 hover:bg-white/20 text-white/90"
                            }`}
                          title={opt.label}
                        >
                          <div className="truncate">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT (600x720) */}
          <div className="h-full p-4">
            {/* RIGHT */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-white h-full">
              <h3 className="font-semibold mb-2">Stats (Base)</h3>
              <ul className="text-sm space-y-1">
                <li>HP: {operator.stats?.maxHp}</li>
                <li>ATK: {operator.stats?.atk}</li>
                <li>DEF: {operator.stats?.def}</li>
                <li>RES: {operator.stats?.magicResistance}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* (Giữ chỗ đoạn RIGHT theo yêu cầu của bạn — đã giữ nguyên nội dung) */}
      </div>
    </div>
  );
}
