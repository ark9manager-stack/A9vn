import React, { useEffect, useMemo, useState } from "react";

const rarityBorderMap = {
  5: "border-orange-500 shadow-orange-500/40", // 6★
  4: "border-yellow-400 shadow-yellow-400/40", // 5★
  3: "border-purple-400",
  2: "border-blue-400",
  1: "border-green-400",
  0: "border-gray-400",
};

const CN_AVATAR_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/charavatars/";

// ✅ Các trường hợp ngoại lệ (key là charId trong character_table.json)
const CN_AVATAR_OVERRIDES = {
  char_271_spikes: `${CN_AVATAR_BASE}elite/char_271_spikes.png`,
};

function buildCnAvatarUrl(charId) {
  if (!charId) return null;

  const id = String(charId).trim().replace(/\.png$/i, "");
  // Chỉ build avatar cho operator thật (char_.). Trap/token thường không có ở path này
  if (!id.startsWith("char_")) return null;

  // ✅ ưu tiên ngoại lệ trước
  if (CN_AVATAR_OVERRIDES[id]) return CN_AVATAR_OVERRIDES[id];

  // mặc định
  return `${CN_AVATAR_BASE}${id}.png`;
}

// Chuẩn hóa rarity về index 0..5 để dùng cho border + tier
function normalizeRarityIndex(rarity) {
  if (rarity == null) return null;

  // Nếu là number:
  // - dạng 0..5 (thường gặp) => giữ nguyên
  // - dạng 1..6 (nếu bạn đã convert) => trừ 1
  if (typeof rarity === "number" && Number.isFinite(rarity)) {
    if (rarity >= 0 && rarity <= 5) return rarity;
    if (rarity >= 1 && rarity <= 6) return rarity - 1;
    return null;
  }

  // Nếu là string kiểu "TIER_3"
  const s = String(rarity).trim().toUpperCase();
  const m = s.match(/TIER_(\d+)/) || s.match(/(\d+)/);
  if (!m) return null;

  const tier = Number(m[1] ?? m[0]);
  if (!Number.isFinite(tier)) return null;

  // tier 1..6 => index 0..5
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
    [operator?.rarity]
  );
  const tier = rarityIdx != null ? rarityIdx + 1 : "?";
  const rarityClass = rarityBorderMap[rarityIdx] || "border-gray-400";

  // Ưu tiên lấy id/key đúng kiểu char_285_medic2
  const charId = useMemo(() => {
    return (
      operator?.charId ||
      operator?.id ||
      operator?.characterPrefabKey ||
      operator?.code // nếu bạn đặt tên field khác
    );
  }, [operator]);

  const preferredAvatar = useMemo(() => buildCnAvatarUrl(charId), [charId]);

  const [imgSrc, setImgSrc] = useState(preferredAvatar || operator?.avatar || "");

  // Khi operator đổi -> reset ảnh theo preferredAvatar
  useEffect(() => {
    setImgSrc(preferredAvatar || operator?.avatar || "");
  }, [preferredAvatar, operator?.avatar]);

  const handleImgError = () => {
    // Fallback về avatar cũ nếu có
    if (operator?.avatar && imgSrc !== operator.avatar) {
      setImgSrc(operator.avatar);
      return;
    }
    // Nếu vẫn lỗi thì bỏ ảnh (hiện placeholder)
    if (imgSrc) setImgSrc("");
  };

  const infoBg = useMemo(() => getInfoGradient(tier), [tier]);

  return (
    <div
      onClick={() => onClick?.(operator)}
      className="
        cursor-pointer rounded-xl bg-[#1b1b1b]
        hover:scale-105 transition p-3
      "
    >
      {/* Avatar */}
      <div
        className={`
          relative rounded-lg overflow-hidden
          border-2 ${rarityClass}
        `}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={operator?.name || String(charId || "")}
            className="w-full h-full object-cover scale-[1.08]"
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-xs text-gray-400 bg-black/30">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="mt-2 text-center rounded-lg px-2 py-2"
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
