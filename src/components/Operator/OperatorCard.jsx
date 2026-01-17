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

// ✅ Background theo rarity tier (TIER_1..TIER_6)
const MAIL_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/sprite_item_r";

// ✅ Các trường hợp ngoại lệ (key là charId trong character_table.json)
const CN_AVATAR_OVERRIDES = {
  char_271_spikes: `${CN_AVATAR_BASE}elite/char_271_spikes.png`,
};

function buildCnAvatarUrl(charId) {
  if (!charId) return null;

  const id = String(charId).trim().replace(/\.png$/i, "");
  // Chỉ build avatar cho operator thật (char_...). Trap/token thường không có ở path này
  if (!id.startsWith("char_")) return null;

  // ✅ ưu tiên ngoại lệ trước
  if (CN_AVATAR_OVERRIDES[id]) return CN_AVATAR_OVERRIDES[id];

  // mặc định
  return `${CN_AVATAR_BASE}${id}.png`;
}

// ✅ Chuẩn hóa rarity về tier 1..6 (hỗ trợ cả "TIER_6" lẫn số 0..5 / 1..6)
function getRarityTier(rarity) {
  // dạng "TIER_6"
  if (typeof rarity === "string") {
    const m = rarity.match(/TIER_(\d)/i);
    if (m) {
      const t = Number(m[1]);
      if (Number.isFinite(t)) return Math.min(6, Math.max(1, t));
    }
  }

  // dạng số: có thể là 0..5 hoặc 1..6
  if (typeof rarity === "number" && Number.isFinite(rarity)) {
    if (rarity >= 1 && rarity <= 6) return rarity; // 1..6
    if (rarity >= 0 && rarity <= 5) return rarity + 1; // 0..5 => 1..6
  }

  // fallback
  return 6;
}

const OperatorCard = ({ operator, onClick }) => {
  // tier 1..6 để dùng background sprite_item_r{tier}.png
  const tier = getRarityTier(operator?.rarity);

  // rarityClass đang map theo index 0..5 (đúng như file hiện tại của bạn)
  const rarityIndex = Math.max(0, Math.min(5, tier - 1));
  const rarityClass = rarityBorderMap[rarityIndex] || "border-gray-400";

  // ✅ background URL nằm trong Avatar box
  const bgUrl = `${MAIL_BG_BASE}${tier}.png`;

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

  const [imgSrc, setImgSrc] = useState(
    preferredAvatar || operator?.avatar || ""
  );

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
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={operator?.name || String(charId || "")}
            className="w-full h-full object-cover"
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
      <div className="mt-2 text-center">
        <div className="text-white font-semibold truncate">
          {operator?.name || String(charId || "")}
        </div>

        {/* Hiển thị ★ theo tier (1..6), ổn cho cả dữ liệu TIER_X hoặc số */}
        <div className="text-xs text-gray-400">★{tier}</div>
      </div>
    </div>
  );
};

export default OperatorCard;
