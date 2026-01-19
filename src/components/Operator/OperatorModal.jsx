import React, { useMemo, useState } from "react";
import skinTable from "../../data/skins/skin_table.json";

const BG_URL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Buc%5Dpacked/bg_img.png";

const ART_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters";

const SKIN_UI_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Bpack%5Dskinres";

function buildEliteUrl(charId, elite) {
  // Elite 0 => _1
  // Elite 2 => _2
  // Elite 1 special only for Amiya => _1+ (need encode +)
  if (elite === "E0") return `${ART_BASE}/${charId}/${charId}_1.png`;
  if (elite === "E2") return `${ART_BASE}/${charId}/${charId}_2.png`;
  if (elite === "E1") {
    // only Amiya uses _1+
    const filename = `${charId}_1+.png`.replace("+", "%2B");
    return `${ART_BASE}/${charId}/${filename}`;
  }
  return `${ART_BASE}/${charId}/${charId}_1.png`;
}

function buildSkinUrl(charId, skinId) {
  // Example:
  // char_002_amiya#1 -> char_002_amiya_1.png
  // char_002_amiya@winter#1 -> char_002_amiya_winter%231.png
  if (!skinId) return null;

  if (skinId.includes("@")) {
    // @ -> _ and keep # but encode as %23
    const file = skinId.replace("@", "_").replaceAll("#", "%23");
    return `${ART_BASE}/${charId}/${file}.png`;
  }

  // no @ => # -> _
  const file = skinId.replaceAll("#", "_");
  return `${ART_BASE}/${charId}/${file}.png`;
}

function pickDisplaySkin(obj) {
  // robust: skin data may sit under displaySkin or other keys
  return obj?.displaySkin || obj?.skin || obj || null;
}

const OperatorModal = ({ operator, onClose }) => {
  if (!operator) return null;

  const charId = operator?.id; // IMPORTANT: operator.id should be like "char_002_amiya"
  const hasElite1 = charId === "char_002_amiya";

  const skinsForChar = useMemo(() => {
    const dict = skinTable?.charSkins || skinTable?.skins || {};
    const all = Object.values(dict);

    const matched = all.filter((s) => s?.charId === charId);

    // only keep real skins (usually contain @...), exclude default elite-like ids if exist
    const extra = matched.filter((s) => {
      const sid = s?.skinId;
      if (!sid) return false;
      // exclude base-like ids (charId#1, charId#2) from "skin list"
      if (sid === `${charId}#1` || sid === `${charId}#2`) return false;
      return true;
    });

    // map to a clean structure
    return extra
      .map((s) => {
        const display = pickDisplaySkin(s);
        return {
          key: s.skinId,
          skinId: s.skinId,
          skinName: display?.skinName ?? null,
          drawerList: display?.drawerList ?? [],
          url: buildSkinUrl(charId, s.skinId),
        };
      })
      .filter((x) => !!x.url);
  }, [charId]);

  const options = useMemo(() => {
    const elite = [
      {
        key: "E0",
        kind: "elite",
        label: "Elite 0",
        url: buildEliteUrl(charId, "E0"),
        skinName: null,
        drawerList: [],
      },
      ...(hasElite1
        ? [
            {
              key: "E1",
              kind: "elite",
              label: "Elite 1",
              url: buildEliteUrl(charId, "E1"),
              skinName: null,
              drawerList: [],
            },
          ]
        : []),
      {
        key: "E2",
        kind: "elite",
        label: "Elite 2",
        url: buildEliteUrl(charId, "E2"),
        skinName: null,
        drawerList: [],
      },
    ];

    const skins = skinsForChar.map((s) => ({
      key: s.key,
      kind: "skin",
      label: s.skinName || s.skinId,
      url: s.url,
      skinName: s.skinName,
      drawerList: s.drawerList || [],
    }));

    // Order: E0 > E1 > E2 > skins
    return [...elite, ...skins];
  }, [charId, hasElite1, skinsForChar]);

  const [selectedKey, setSelectedKey] = useState(options?.[0]?.key || "E0");

  const selectedOption = useMemo(() => {
    return options.find((x) => x.key === selectedKey) || options[0];
  }, [options, selectedKey]);

  const displaySkinName = useMemo(() => {
    if (!selectedOption) return "";
    // If skinName is null => use Elite name
    if (!selectedOption.skinName) return selectedOption.label;
    return selectedOption.skinName;
  }, [selectedOption]);

  const displayDrawer = useMemo(() => {
    const list = selectedOption?.drawerList || [];
    if (!list.length) return "";
    return Array.isArray(list) ? list.join(", ") : String(list);
  }, [selectedOption]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* 1280x720 canvas (scaled) */}
      <div className="relative w-[95vw] max-w-[1280px] aspect-[16/9] rounded-2xl overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg px-3 py-2"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Content grid: LEFT ~580, RIGHT ~700 (as in 1280 design) */}
        <div className="relative z-10 h-full w-full grid grid-cols-1 md:grid-cols-[580px_700px]">
          {/* LEFT */}
          <div className="relative h-full p-4">
            {/* Character art area */}
            <div className="relative h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedOption?.url ? (
                  <img
                    src={selectedOption.url}
                    alt={operator?.name || charId}
                    className="max-h-full max-w-full object-contain"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-white/70 text-sm">No Image</div>
                )}
              </div>

              {/* Bottom-left info: skin name + drawer */}
              <div className="absolute left-3 bottom-3 z-20 bg-black/55 backdrop-blur rounded-xl px-3 py-2 max-w-[360px]">
                <div className="flex items-center gap-2">
                  <img
                    src={`${SKIN_UI_BASE}/icon_model.png`}
                    alt="Skin"
                    className="w-5 h-5 object-contain"
                  />
                  <div className="text-white text-sm font-semibold truncate">
                    {displaySkinName || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={`${SKIN_UI_BASE}/icon_drawer.png`}
                    alt="Drawer"
                    className="w-5 h-5 object-contain"
                  />
                  <div className="text-white/80 text-xs truncate">
                    {displayDrawer || "—"}
                  </div>
                </div>
              </div>

              {/* Bottom-right list: elite + skins (do not cross into RIGHT area) */}
              <div className="absolute right-3 bottom-3 z-20 bg-black/55 backdrop-blur rounded-xl p-2 w-[210px] max-h-[260px] overflow-auto">
                <div className="text-white/80 text-xs font-semibold mb-2">
                  Select Art / Skin
                </div>

                <div className="flex flex-col gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedKey(opt.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                        ${
                          selectedKey === opt.key
                            ? "bg-emerald-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white/90"
                        }`}
                      title={opt.label}
                    >
                      <div className="truncate">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="h-full p-4">
            {/* giữ nguyên block này theo yêu cầu của bạn */}
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

        {/* Optional text overlay (name/desc) - stays on left only */}
        <div className="absolute left-4 top-4 z-20 max-w-[520px]">
          <h2 className="text-2xl font-bold text-white drop-shadow">
            {operator.name}
          </h2>
          <p className="text-white/80 text-sm mt-1 whitespace-pre-line drop-shadow">
            {operator.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorModal;
