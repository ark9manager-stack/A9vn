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

function buildCnAvatarUrl(charId) {
  if (!charId) return null;

  const id = String(charId).trim().replace(/\.png$/i, "");
  // Chỉ build avatar cho operator thật (char_...). Trap/token thường không có ở path này
  if (!id.startsWith("char_")) return null;

  return `${CN_AVATAR_BASE}${id}.png`;
}

const OperatorCard = ({ operator, onClick }) => {
  const rarityClass = rarityBorderMap[operator?.rarity] || "border-gray-400";

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
        <div className="text-xs text-gray-400">★{operator?.rarity ?? "?"}</div>
      </div>
    </div>
  );
};

export default OperatorCard;
