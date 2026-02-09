import React, { useEffect, useMemo, useRef, useState } from "react";
import skinTable from "../../../../data/skins/skin_table.json";
import skinTableEn from "../../../../data/skins/skin_table_en.json";

const ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters";

const ICON_MODEL_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_model.png";
const ICON_DRAWER_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres/icon_drawer.png";

const SP_DYN_SKINS = skinTable?.spDynSkins || {};

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


function buildSkinUrl(charId, skinId, { forceLowerTheme = false } = {}) {
  if (!charId || !skinId) return null;

  // Most extra skins are: char_xxx@theme#n
  if (typeof skinId === "string" && skinId.startsWith(`${charId}@`)) {
    const rest = skinId.slice(`${charId}@`.length); // "ambienceSynesthesia#3"
    const hashPos = rest.lastIndexOf("#");
    const theme = hashPos >= 0 ? rest.slice(0, hashPos) : rest;
    const ver = hashPos >= 0 ? rest.slice(hashPos + 1) : "";

    const themeNorm = forceLowerTheme ? theme.toLowerCase() : theme;
    const base = `${charId}_${themeNorm}${hashPos >= 0 ? `#${ver}` : ""}`;

    return `${ART_BASE}/${charId}/${encodeURIComponent(base)}.png`;
  }

  // Fallback (should rarely be used for extra skins)
  const file = String(skinId).replaceAll("#", "_");
  const normalized = forceLowerTheme ? file.toLowerCase() : file;
  return `${ART_BASE}/${charId}/${encodeURIComponent(normalized)}.png`;
}

function withSpSuffix(url) {
  if (!url) return url;
  // avoid double "_sp"
  if (/_sp\.(png|webp|jpg|jpeg)$/i.test(url)) return url;
  return url.replace(/\.(png|webp|jpg|jpeg)$/i, "_sp.$1");
}


function pickDisplaySkin(obj) {
  return obj?.displaySkin || obj?.skin || obj || null;
}

export default function SkinsSection({ operator, className = "" }) {
  const charId = operator?.id || operator?.charId || operator?.char_id || "";

  const skinsDict = useMemo(
    () => skinTable?.charSkins || skinTable?.skins || {},
    [],
  );

  const skinsDictEn = useMemo(
    () => skinTableEn?.charSkins || skinTableEn?.skins || {},
    [],
  );

  // Elite metadata
  const eliteMeta = useMemo(() => {
    const e0Key = `${charId}#1`;
    const e1Key = `${charId}#1+`;
    const e2Key = `${charId}#2`;

    const e0 = skinsDict?.[e0Key];
    const e1 = skinsDict?.[e1Key];
    const e2 = skinsDict?.[e2Key];

    const e0En = skinsDictEn?.[e0Key];
    const e1En = skinsDictEn?.[e1Key];
    const e2En = skinsDictEn?.[e2Key];

    const d0 = pickDisplaySkin(e0);
    const d1 = pickDisplaySkin(e1);
    const d2 = pickDisplaySkin(e2);

    const d0En = pickDisplaySkin(e0En);
    const d1En = pickDisplaySkin(e1En);
    const d2En = pickDisplaySkin(e2En);

    return {
      e0: d0 ? { ...d0, skinName: d0En?.skinName ?? d0?.skinName ?? null } : null,
      e1: d1 ? { ...d1, skinName: d1En?.skinName ?? d1?.skinName ?? null } : null,
      e2: d2 ? { ...d2, skinName: d2En?.skinName ?? d2?.skinName ?? null } : null,
      hasE1: !!e1,
      hasE2: !!e2,
    };
  }, [charId, skinsDict, skinsDictEn]);

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
        const enEntry = skinsDictEn?.[s.skinId];
        const displayEn = pickDisplaySkin(enEntry);
        const primaryUrl = buildSkinUrl(charId, s.skinId);
        const fallbackUrl = buildSkinUrl(charId, s.skinId, {
          forceLowerTheme: true,
        });

        return {
          key: s.skinId,
          kind: "skin",
          skinId: s.skinId,
          skinName: displayEn?.skinName ?? display?.skinName ?? null,
          drawerList: display?.drawerList ?? [],
          designerList: display?.designerList ?? null,
          url: primaryUrl,
          fallbackUrl: fallbackUrl !== primaryUrl ? fallbackUrl : null,
        };
      })
      .filter((x) => !!x.url);
  }, [charId, skinsDict, skinsDictEn]);

  const options = useMemo(() => {
    if (!charId) return [];

    const out = [];

    out.push({
      key: "E0",
      kind: "elite",
      label: "Elite 0",
      url: buildEliteUrl(charId, "E0"),
      fallbackUrl: null,
      skinName: eliteMeta?.e0?.skinName ?? null,
      drawerList: eliteMeta?.e0?.drawerList ?? [],
      designerList: eliteMeta?.e0?.designerList ?? null,
      hasSp: false,
      skinId: null,
      order: 0,
    });

    if (eliteMeta?.hasE1) {
      out.push({
        key: "E1",
        kind: "elite",
        label: "Elite 1",
        url: buildEliteUrl(charId, "E1"),
        fallbackUrl: null,
        skinName: eliteMeta?.e1?.skinName ?? null,
        drawerList: eliteMeta?.e1?.drawerList ?? [],
        designerList: eliteMeta?.e1?.designerList ?? null,
        hasSp: false,
        skinId: null,
        order: 1,
      });
    }

    if (eliteMeta?.hasE2) {
      out.push({
        key: "E2",
        kind: "elite",
        label: "Elite 2",
        url: buildEliteUrl(charId, "E2"),
        fallbackUrl: null,
        skinName: eliteMeta?.e2?.skinName ?? null,
        drawerList: eliteMeta?.e2?.drawerList ?? [],
        designerList: eliteMeta?.e2?.designerList ?? null,
        hasSp: false,
        skinId: null,
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
        fallbackUrl: s.fallbackUrl || null,
        skinName: s.skinName,
        drawerList: s.drawerList || [],
        designerList: s.designerList ?? null,
        skinId: s.skinId,
        hasSp: !!SP_DYN_SKINS?.[s.skinId],
        order: 100 + idx,
      }));

    return [...out, ...skins].sort((a, b) => a.order - b.order);
  }, [charId, eliteMeta, skinsForChar]);

  const [selectedKey, setSelectedKey] = useState(options?.[0]?.key || "E0");
  const [spMode, setSpMode] = useState(false);

  // image state (supports fallback retry)
  const [imgError, setImgError] = useState(false);
  const [isLoadingImg, setIsLoadingImg] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(null);
  const skipSpResetRef = useRef(false);

  useEffect(() => {
    if (!options.length) return;
    const exists = options.some((o) => o.key === selectedKey);
    if (!exists) setSelectedKey(options[0].key);
  }, [charId, options, selectedKey]);

  useEffect(() => {
    if (skipSpResetRef.current) {
      skipSpResetRef.current = false;
      return;
    }
    setSpMode(false);
  }, [selectedKey, charId]);

  const selectedOption = useMemo(() => {
    return options.find((x) => x.key === selectedKey) || options[0];
  }, [options, selectedKey]);

  const selectedHasSp = useMemo(() => {
    if (!selectedOption) return false;
    if (selectedOption.kind !== "skin") return false;
    const sid = selectedOption.skinId || selectedOption.key;
    return !!SP_DYN_SKINS?.[sid];
  }, [selectedOption]);

  const effectiveUrl = useMemo(() => {
    const u = selectedOption?.url || null;
    return selectedHasSp && spMode ? withSpSuffix(u) : u;
  }, [selectedOption, selectedHasSp, spMode]);

  const effectiveFallbackUrl = useMemo(() => {
    const u = selectedOption?.fallbackUrl || null;
    return selectedHasSp && spMode ? withSpSuffix(u) : u;
  }, [selectedOption, selectedHasSp, spMode]);

  useEffect(() => {
    let cancelled = false;

    const primary = effectiveUrl || null;
    const fallback = effectiveFallbackUrl || null;

    setImgError(false);
    setIsLoadingImg(!!primary);
    setDisplaySrc(null);

    const load = (src) =>
      new Promise((resolve, reject) => {
        if (!src) return reject(new Error("no-src"));
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });

    (async () => {
      try {
        const ok = await load(primary);
        if (cancelled) return;
        setDisplaySrc(ok);
        setIsLoadingImg(false);
      } catch {
        if (fallback) {
          try {
            const ok2 = await load(fallback);
            if (cancelled) return;
            setDisplaySrc(ok2);
            setIsLoadingImg(false);
            return;
          } catch (error) {
            console.error("Error loading fallback image:", error);
          }
        }
        if (cancelled) return;
        setImgError(true);
        setIsLoadingImg(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveUrl, effectiveFallbackUrl, charId, selectedKey, spMode, selectedHasSp]);

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


  const displayDesigner = useMemo(() => {
    const list = selectedOption?.designerList;
    const arr = Array.isArray(list) ? list.filter(Boolean) : [];
    return arr.length ? arr.join(", ") : "";
  }, [selectedOption]);

  if (!operator) return null;

  return (
    <div
      className={`relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden bg-black/20 ${className}`}
    >
      <div className="relative h-full w-full">
        {/* Art */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLoadingImg && (
            <div className="rounded-lg bg-black/70 px-3 py-2 text-white/90 text-sm backdrop-blur">
              Loading...
            </div>
          )}

          {!isLoadingImg && imgError && (
            <div className="rounded-lg bg-black/70 px-3 py-2 text-white/90 text-sm backdrop-blur">
              Failed to load
            </div>
          )}

          {!isLoadingImg && !imgError && displaySrc && (
            <img
              src={displaySrc}
              alt={operator?.name || charId}
              className="max-h-full max-w-full object-contain"
              loading="eager"
              draggable={false}
            />
          )}
        </div>

        {/* Bottom-left: Skin name + drawer */}
        <div className="absolute bottom-3 left-3 z-20 w-[180px] max-w-[calc(100%-24px)] rounded-xl bg-black/55 p-3 text-white backdrop-blur">
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
              <span>Họa sĩ:</span> {displayDrawer}
            </div>

            {/* Row 3: designer */}
            {displayDesigner ? (
              <>
                <div className="h-4 w-6" />
                <div className="text-xs text-white/85 leading-snug truncate">
                  <span>Thiết kế:</span> {displayDesigner}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Bottom-right: options */}
        {options.length > 1 && (
          <div className="absolute right-3 bottom-3 z-20 w-[160px] rounded-xl bg-black/55 p-2 text-white backdrop-blur">
            <div className="flex flex-col gap-1">

              {options.map((opt) => {
                const active = selectedKey === opt.key;
                const canToggleSp = !!opt.hasSp;

                return (
                  <div key={opt.key} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(opt.key)}
                      className={`w-full text-left rounded-lg pl-2 pr-10 py-1.5 text-xs font-semibold transition
                        ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white/90"
                        }`}
                      title={opt.label}
                    >
                      <div className="truncate">{opt.label}</div>
                    </button>

                    {canToggleSp ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (selectedKey !== opt.key) {
                            skipSpResetRef.current = true;
                            setSelectedKey(opt.key);
                            setSpMode(true);
                            return;
                          }

                          setSpMode((v) => !v);
                        }}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-bold transition
                          ${
                            active && spMode
                              ? "bg-amber-500 text-black"
                              : "bg-white/15 hover:bg-white/25 text-white/90"
                          }`}
                        title="Chuyển dạng art (thường ↔ _sp)"
                      >
                        SP
                      </button>
                    ) : null}
                  </div>

                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
