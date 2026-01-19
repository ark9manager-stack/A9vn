import React, { useEffect, useMemo, useState } from "react";

const BG_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]packed/bg_img.png";

const ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters";

const ICON_MODEL_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[pack]skinres/icon_model.png";
const ICON_DRAWER_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[pack]skinres/icon_drawer.png";

function getEliteLabelFromSkinId(skinId) {
  if (!skinId) return "Elite 0";
  if (skinId.endsWith("#1+")) return "Elite 1";
  if (skinId.endsWith("#2")) return "Elite 2";
  return "Elite 0";
}

function getCharIdPrefixFromKey(key) {
  if (!key) return "";
  const at = key.indexOf("@");
  const hash = key.indexOf("#");
  const cut = at !== -1 ? at : hash !== -1 ? hash : key.length;
  return key.slice(0, cut);
}

function buildArtUrl(charId, skinId, skinsMap) {
  if (!charId || !skinId) return null;
  const entry = skinsMap?.[skinId];
  if (!entry) return null;

  // Prefer illustId (more accurate)
  const illustId = entry.illustId;
  let suffix = null;

  const prefix = `illust_${charId}_`;
  if (typeof illustId === "string" && illustId.startsWith(prefix)) {
    suffix = illustId.slice(prefix.length);
  }

  if (!suffix) {
    if (skinId.includes("@")) {
      suffix = skinId.split("@")[1] || "";
    } else if (skinId.includes("#")) {
      suffix = skinId.split("#")[1] || "1";
    } else {
      suffix = "1";
    }
  }

  const safeSuffix = String(suffix).replace(/#/g, "%23");
  return `${ART_BASE}/${charId}/${charId}_${safeSuffix}.png`;
}

export default function OperatorModal({ isOpen, operator, onClose }) {
  const charId = operator?.charId || operator?.id || operator?.char_id;

  const [skinTable, setSkinTable] = useState(null);
  const [skinLoadError, setSkinLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!isOpen) return;
    if (skinTable) return;

    (async () => {
      try {
        const mod = await import("../../data/skins/skin_table.json");
        if (cancelled) return;
        setSkinTable(mod?.default ?? mod);
      } catch (e) {
        if (cancelled) return;
        setSkinLoadError(e?.message || String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, skinTable]);

  const skinsMap = skinTable?.charSkins || {};

  const allKeysForThisChar = useMemo(() => {
    if (!charId) return [];
    return Object.keys(skinsMap).filter((k) => getCharIdPrefixFromKey(k) === charId);
  }, [charId, skinsMap]);

  const options = useMemo(() => {
    if (!charId) return [];

    const e0Key = `${charId}#1`;
    const e1Key = `${charId}#1+`;
    const e2Key = `${charId}#2`;

    const out = [];

    if (skinsMap[e0Key]) out.push({ skinId: e0Key, label: "Elite 0", order: 0 });

    if (skinsMap[e1Key] && charId === "char_002_amiya")
      out.push({ skinId: e1Key, label: "Elite 1", order: 1 });

    if (skinsMap[e2Key]) out.push({ skinId: e2Key, label: "Elite 2", order: 2 });

    const skinKeys = allKeysForThisChar.filter((k) => k.startsWith(`${charId}@`));
    skinKeys.sort((a, b) => a.localeCompare(b));

    skinKeys.forEach((k, idx) => {
      const meta = skinsMap[k]?.displaySkin || {};
      const skinName = meta?.skinName;
      out.push({
        skinId: k,
        label: skinName || k.split("@")[1] || "Skin",
        order: 100 + idx,
      });
    });

    return out.sort((a, b) => a.order - b.order);
  }, [charId, skinsMap, allKeysForThisChar]);

  const [selectedSkinId, setSelectedSkinId] = useState(null);
  const [artError, setArtError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!options.length) return;

    if (!selectedSkinId) {
      setSelectedSkinId(options[0].skinId);
      return;
    }

    const stillExists = options.some((o) => o.skinId === selectedSkinId);
    if (!stillExists) setSelectedSkinId(options[0].skinId);
  }, [isOpen, options, selectedSkinId]);

  useEffect(() => {
    if (!isOpen) return;
    setArtError(false);
  }, [isOpen, selectedSkinId]);

  const selectedMeta = useMemo(() => {
    const entry = skinsMap?.[selectedSkinId];
    const display = entry?.displaySkin || {};
    const skinName = display?.skinName;

    const fallbackName = selectedSkinId
      ? selectedSkinId.includes("@")
        ? selectedSkinId.split("@")[1] || "Skin"
        : getEliteLabelFromSkinId(selectedSkinId)
      : "Elite 0";

    const drawer = Array.isArray(display?.drawerList) ? display.drawerList.filter(Boolean) : [];
    return {
      skinName: skinName || fallbackName,
      drawer: drawer.length ? drawer.join(", ") : "-",
    };
  }, [skinsMap, selectedSkinId]);

  const artUrl = useMemo(() => {
    if (!charId || !selectedSkinId) return null;
    return buildArtUrl(charId, selectedSkinId, skinsMap);
  }, [charId, selectedSkinId, skinsMap]);

  if (!isOpen || !operator) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => onClose?.()}
    >
      <div
        className="relative w-[min(1280px,96vw)] aspect-[16/9] max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BG */}
        <img
          src={BG_URL}
          alt="bg"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* slight dark overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.12)" }} />

        {/* EXACT 680 + 600 */}
        <div className="relative z-10 grid h-full w-full grid-cols-1 md:grid-cols-[680px_600px]">
          {/* LEFT */}
          <div className="relative h-full w-full">
            <div className="absolute inset-0">
              {/* Loading / Error for skin table */}
              {!skinTable && !skinLoadError ? (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <div className="rounded-xl bg-black/55 px-4 py-3 text-sm backdrop-blur">
                    Loading skins...
                  </div>
                </div>
              ) : skinLoadError ? (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <div className="rounded-xl bg-black/55 px-4 py-3 text-sm backdrop-blur">
                    Skin table load failed: {skinLoadError}
                  </div>
                </div>
              ) : artUrl && !artError ? (
                <img
                  src={artUrl}
                  alt="art"
                  className="h-full w-full object-contain"
                  draggable={false}
                  onError={() => {
                    setArtError(true);
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <div className="rounded-xl bg-black/55 px-4 py-3 text-sm backdrop-blur">
                    load
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-left: ONE LINE info */}
            <div className="absolute bottom-3 left-3 z-10 w-[420px] max-w-[calc(100%-24px)] rounded-xl bg-black/55 p-3 text-white backdrop-blur">
              <div className="flex items-center gap-2 text-sm leading-snug">
                <img src={ICON_MODEL_URL} alt="skin" className="h-5 w-5 opacity-90" draggable={false} />
                <span className="min-w-0 flex-1 truncate font-semibold">{selectedMeta.skinName}</span>
                <span className="text-white/45">•</span>
                <img src={ICON_DRAWER_URL} alt="drawer" className="h-5 w-5 opacity-90" draggable={false} />
                <span className="min-w-0 flex-1 truncate text-white/85">{selectedMeta.drawer}</span>
              </div>
            </div>

            {/* Bottom-right: options (no scroll, no title) */}
            <div className="absolute bottom-3 right-2 z-10 w-[220px] rounded-xl bg-black/55 p-2 text-white backdrop-blur">
              <div className="flex flex-col gap-1">
                {options.length ? (
                  options.map((o) => {
                    const isSelected = o.skinId === selectedSkinId;
                    return (
                      <button
                        key={o.skinId}
                        type="button"
                        onClick={() => setSelectedSkinId(o.skinId)}
                        className={[
                          "w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition",
                          "hover:bg-white/15",
                          isSelected ? "bg-white/20" : "bg-white/5",
                        ].join(" ")}
                        title={o.label}
                      >
                        <div className="truncate">{o.label}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-white/70">No arts/skins.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative h-full w-full p-4">
            <div className="mb-3">
              <div className="text-2xl font-extrabold text-white">{operator.name}</div>
              <div className="text-xs text-white/70">{operator.charId || operator.id}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-2">Stats (Base)</h3>
              <ul className="text-sm space-y-1">
                <li>HP: {operator.stats?.maxHp}</li>
                <li>ATK: {operator.stats?.atk}</li>
                <li>DEF: {operator.stats?.def}</li>
                <li>RES: {operator.stats?.magicResistance}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/20 hover:text-white"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
