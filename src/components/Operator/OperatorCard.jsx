import React, { useEffect, useMemo, useState } from "react";
import {
  buildCnAvatarUrl,
  getOperatorCharId,
} from "../../utils/operatorAvatar";

const rarityBorderMap = {
  5: "border-orange-500 shadow-orange-500/40", // 6★
  4: "border-yellow-400 shadow-yellow-400/40", // 5★
  3: "border-purple-400",
  2: "border-blue-400",
  1: "border-green-400",
  0: "border-gray-400",
};

// Chuẩn hóa rarity về index 0..5 để dùng cho border + tier
function normalizeRarityIndex(rarity) {
  if (rarity == null) return null;

  if (typeof rarity === "number" && Number.isFinite(rarity)) {
    if (rarity >= 0 && rarity <= 5) return rarity;
    if (rarity >= 1 && rarity <= 6) return rarity - 1;
    return null;
  }

  const s = String(rarity).trim().toUpperCase();
  const m = s.match(/TIER_(\d+)/) || s.match(/(\d+)/);
  if (!m) return null;

  const tier = Number(m[1] ?? m[0]);
  if (!Number.isFinite(tier)) return null;

  const idx = tier - 1;
  if (idx < 0 || idx > 5) return null;
  return idx;
}

function getInfoGradient(tier) {
  switch (tier) {
    case 6:
      return "linear-gradient(to top, rgba(255,200,0,1), rgba(255,200,0,0))";
    case 5:
      return "linear-gradient(to top, rgba(255,255,169,1), rgba(255,255,169,0))";
    case 4:
      return "linear-gradient(to top, rgba(214,197,214,1), rgba(214,197,214,0))";
    case 3:
      return "linear-gradient(to top, rgba(0,170,238,1), rgba(0,170,238,0))";
    case 2:
      return "linear-gradient(to top, rgba(220,220,0,1), rgba(220,220,0,0))";
    case 1:
      return "linear-gradient(to top, rgba(160,160,160,1), rgba(160,160,160,0))";
    default:
      return "transparent";
  }
}

const OperatorCard = ({ operator, onClick }) => {
  const rarityIdx = useMemo(
    () => normalizeRarityIndex(operator?.rarity),
    [operator?.rarity],
  );
  const tier = rarityIdx != null ? rarityIdx + 1 : "?";
  const rarityClass = rarityBorderMap[rarityIdx] || "border-gray-400";

  const charId = useMemo(() => getOperatorCharId(operator), [operator]);

  // ✅ candidates theo thứ tự ưu tiên: CN avatar -> operator.avatar -> operator.image
  const avatarCandidates = useMemo(() => {
    const arr = [
      buildCnAvatarUrl(charId),
      operator?.avatar,
      operator?.image,
    ].filter(Boolean);

    // dedupe
    return Array.from(new Set(arr));
  }, [charId, operator?.avatar, operator?.image]);

  const [avatarIdx, setAvatarIdx] = useState(0);

  // reset khi operator / candidates đổi
  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarCandidates.join("|")]);

  const imgSrc = avatarCandidates[avatarIdx] || "";

  const handleImgError = () => {
    const next = avatarIdx + 1;
    if (next < avatarCandidates.length) {
      setAvatarIdx(next);
    } else {
      setAvatarIdx(avatarCandidates.length); // -> imgSrc rỗng => placeholder
    }
  };

  const infoBg = useMemo(() => getInfoGradient(tier), [tier]);

  return (
    <div
      onClick={() => onClick?.(operator)}
      className="cursor-pointer rounded-xl bg-[#1b1b1b] p-1 sm:p-2 transition hover:scale-[1.03]"
    >
      {/* Avatar */}
      <div
        className={`relative rounded-lg overflow-hidden border-2 ${rarityClass} aspect-square`}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={operator?.name || String(charId || "")}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
            onError={handleImgError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 bg-black/30">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="hidden md:block mt-2 text-center rounded-lg  px-2 py-2"
        style={{ background: infoBg }}
      >
        <div className="text-white font-semibold truncate">
          {operator?.name || String(charId || "")}
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
