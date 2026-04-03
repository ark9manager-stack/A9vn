import React, { useEffect, useMemo, useState } from "react";
import {
  buildCnAvatarUrl,
  getOperatorCharId,
} from "../../utils/operatorAvatar";
import {
  professionLabel,
  subProfIconUrl,
  subProfLabel,
} from "../../utils/operatorUtils";

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

  const avatarCandidatesKey = avatarCandidates.join("|");

  // reset khi operator / candidates đổi
  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarCandidatesKey]);

  const imgSrc = avatarCandidates[avatarIdx] || "";

  const handleImgError = () => {
    const next = avatarIdx + 1;
    if (next < avatarCandidates.length) {
      setAvatarIdx(next);
    } else {
      setAvatarIdx(avatarCandidates.length); // -> imgSrc rỗng => placeholder
    }
  };

  return (
    <div
      onClick={() => onClick?.(operator)}
      className="group cursor-pointer p-1 sm:p-2 transition hover:scale-[1.05]"
    >
      {/* ===== CARD ===== */}
      <div className="ark-card p-2 text-center">
        {/* ===== AVATAR ===== */}
        <div
          className={`relative mx-auto mb-2 rounded-md overflow-hidden border ${rarityClass} w-18 h-18 sm:w-20 sm:h-20`}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={operator?.name || ""}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              onError={handleImgError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 bg-black/30">
              Lost
            </div>
          )}

          {/* Subclass icon overlay + main class text */}
          <div className="absolute bottom-0 right-0 flex items-center gap-1 bg-black/70 px-1 py-0.5 rounded-tl">
            {operator?.subProfession ? (
              <img
                src={subProfIconUrl(operator.subProfession)}
                alt={subProfLabel(operator.subProfession)}
                className="w-4 h-4 object-contain"
                loading="lazy"
              />
            ) : (
              <span className="w-4 h-4 text-[10px] text-gray-300">?</span>
            )}
          </div>
        </div>

        {/* ===== NAME ===== */}
        <h3 className="text-xs font-semibold text-white truncate">
          {operator?.name}
        </h3>

        {/* ===== RARITY ===== */}
        <p className="text-[10px] text-yellow-400">{"★".repeat(tier)}</p>

        {/* ===== CLASS TEXT ===== */}
        <p className="text-[10px] text-gray-400">
          {professionLabel(operator?.profession)}
        </p>
      </div>
    </div>
  );
};

export default React.memo(OperatorCard);
