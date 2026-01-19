import { useEffect, useMemo, useState } from "react";
import skinTable from "../../data/skins/skin_table.json";

const BG_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]packed/bg_img.png";

const ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters";

const ICON_DRAWER_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[pack]skinres/icon_drawer.png";

const ICON_MODEL_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[pack]skinres/icon_model.png";

function safeGetCharSkins() {
  return skinTable?.charSkins && typeof skinTable.charSkins === "object"
    ? skinTable.charSkins
    : {};
}

function getSkinMeta(charSkins, skinId) {
  const entry = charSkins?.[skinId];
  const display = entry?.displaySkin || {};
  return {
    skinName: display?.skinName ?? null,
    drawerList: Array.isArray(display?.drawerList) ? display.drawerList : [],
  };
}

function buildArtUrl(charId, skinId) {
  if (!charId || !skinId) return "";
  if (skinId.includes("@")) {
    const suffixRaw = skinId.split("@")[1] || "";
    const suffix = suffixRaw.replaceAll("#", "%23");
    return `${ART_BASE}/${charId}/${charId}_${suffix}.png`;
  }

  if (skinId.includes("#")) {
    const suffix = skinId.split("#")[1] || "";
    return `${ART_BASE}/${charId}/${charId}_${suffix}.png`;
  }

  return `${ART_BASE}/${charId}/${charId}.png`;
}

export default function OperatorModal({ operator, onClose }) {
  const charId = operator?.id || operator?.charId || "";

  const charSkins = useMemo(() => safeGetCharSkins(), []);

  const { eliteOptions, skinOptions } = useMemo(() => {
    if (!charId) {
      return { eliteOptions: [], skinOptions: [] };
    }

    const baseIds = new Set([`${charId}#1`, `${charId}#1+`, `${charId}#2`]);

    const elite = [];
    if (charSkins[`${charId}#1`]) {
      elite.push({
        skinId: `${charId}#1`,
        kind: "elite",
        label: "Elite 0",
        url: buildArtUrl(charId, `${charId}#1`),
        meta: getSkinMeta(charSkins, `${charId}#1`),
      });
    }

    if (charSkins[`${charId}#1+`]) {
      elite.push({
        skinId: `${charId}#1+`,
        kind: "elite",
        label: "Elite 1",
        url: buildArtUrl(charId, `${charId}#1+`),
        meta: getSkinMeta(charSkins, `${charId}#1+`),
      });
    }

    if (charSkins[`${charId}#2`]) {
      elite.push({
        skinId: `${charId}#2`,
        kind: "elite",
        label: "Elite 2",
        url: buildArtUrl(charId, `${charId}#2`),
        meta: getSkinMeta(charSkins, `${charId}#2`),
      });
    }

    const skinsMap = new Map();
    for (const [skinId, entry] of Object.entries(charSkins)) {
      if (!skinId.startsWith(charId)) continue;
      if (baseIds.has(skinId)) continue;
      if (!entry) continue;

      const meta = getSkinMeta(charSkins, skinId);
      const url = buildArtUrl(charId, skinId);
      const label = meta.skinName || "(No Name)";

      skinsMap.set(skinId, {
        skinId,
        kind: "skin",
        label,
        url,
        meta,
      });
    }

    const skins = Array.from(skinsMap.values());

    return { eliteOptions: elite, skinOptions: skins };
  }, [charId, charSkins]);

  const [eliteAvailability, setEliteAvailability] = useState({});

  useEffect(() => {
    if (!charId) return;

    setEliteAvailability({});

    const elites = eliteOptions.map((o) => ({ skinId: o.skinId, url: o.url }));
    elites.forEach(({ skinId, url }) => {
      const img = new Image();
      img.onload = () =>
        setEliteAvailability((prev) => ({ ...prev, [skinId]: true }));
      img.onerror = () =>
        setEliteAvailability((prev) => ({ ...prev, [skinId]: false }));
      img.src = url;
    });
  }, [charId, eliteOptions]);

  const effectiveEliteOptions = useMemo(() => {
    return eliteOptions.filter((o) => eliteAvailability[o.skinId] !== false);
  }, [eliteOptions, eliteAvailability]);

  const effectiveOptions = useMemo(() => {
    // Elite 0 > 1 > 2 then skins
    return [...effectiveEliteOptions, ...skinOptions];
  }, [effectiveEliteOptions, skinOptions]);

  const [selectedSkinId, setSelectedSkinId] = useState("");

  useEffect(() => {
    if (!effectiveOptions.length) {
      setSelectedSkinId("");
      return;
    }

    const stillExists = effectiveOptions.some((o) => o.skinId === selectedSkinId);
    if (!stillExists) {
      setSelectedSkinId(effectiveOptions[0].skinId);
    }
  }, [charId, effectiveOptions, selectedSkinId]);

  const selectedOption =
    effectiveOptions.find((o) => o.skinId === selectedSkinId) ||
    effectiveOptions[0] ||
    null;

  const selectedMeta = selectedOption
    ? getSkinMeta(charSkins, selectedOption.skinId)
    : { skinName: null, drawerList: [] };

  const displaySkinName =
    selectedMeta.skinName || selectedOption?.label || "(Unknown)";

  const displayDrawer =
    selectedMeta.drawerList && selectedMeta.drawerList.length
      ? selectedMeta.drawerList.join(", ")
      : "-";

  const titleText = operator?.name_vn || operator?.name || charId;

  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-[1280px] h-[720px] max-w-[96vw] max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-lg bg-black/50 px-3 py-1 text-sm text-white hover:bg-black/70"
        >
          ✕
        </button>

        <div className="relative z-10 h-full w-full p-4">
          <div className="grid h-full grid-cols-[680px_600px] gap-4">
            {/* LEFT (Art area 680x720) */}
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              {/* Name (top-right of the art area) */}
              <div
                className="absolute right-3 top-3 z-10 text-right"
                style={{
                  WebkitTextStroke: "1px rgba(0,0,0,0.85)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                }}
              >
                <div className="text-2xl font-extrabold text-white leading-tight">
                  {titleText}
                </div>
                <div className="text-xs font-semibold text-white/90">{charId}</div>
              </div>

              {/* Art */}
              <div className="absolute inset-0">
                {selectedOption?.url ? (
                  <img
                    src={selectedOption.url}
                    alt={displaySkinName}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={() => {
                      if (effectiveOptions?.[0]?.skinId) {
                        setSelectedSkinId(effectiveOptions[0].skinId);
                      }
                    }}
                  />
                ) : null}
              </div>

              {/* Bottom-left: Skin name + drawer */}
              <div className="absolute bottom-3 left-3 z-10 w-[360px] rounded-xl bg-black/55 p-3 text-white backdrop-blur">
                <div className="flex items-start gap-3">
                  <img
                    src={ICON_MODEL_URL}
                    alt="skin"
                    className="h-6 w-6 opacity-90"
                    draggable={false}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug">
                      {displaySkinName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/85">
                      <img
                        src={ICON_DRAWER_URL}
                        alt="drawer"
                        className="h-4 w-4 opacity-90"
                        draggable={false}
                      />
                      <span className="truncate">{displayDrawer}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom-right: Art/Skin list (no title, no scroll) */}
              {effectiveOptions.length > 1 && (
                <div className="absolute bottom-3 right-1 z-10 w-48 rounded-xl bg-black/55 p-2 text-white backdrop-blur">
                  <div className="space-y-1">
                    {effectiveOptions.map((o) => {
                      const isActive = o.skinId === selectedSkinId;
                      const meta = getSkinMeta(charSkins, o.skinId);

                      const label = meta.skinName ? meta.skinName : o.label;

                      return (
                        <button
                          key={o.skinId}
                          onClick={() => setSelectedSkinId(o.skinId)}
                          className={
                            "w-full rounded-lg px-2 py-1.5 text-left text-xs transition " +
                            (isActive ? "bg-white/20" : "hover:bg-white/10")
                          }
                          title={label}
                        >
                          <div className="truncate font-medium">{label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT (Stats area 600x720) */}
            <div className="h-full w-full">
              {/* RIGHT */}
              <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
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
        </div>
      </div>
    </div>
  );
}
