export function adaptOperator(raw) {
  if (!raw) return null;

  return {
    id: raw.charId,
    name: raw.name,
    rarity: raw.rarity + 1, // Arknights dùng 0–5
    profession: raw.profession,
    subProfession: raw.subProfessionId,

    avatar: raw?.charPic
      ? `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/main/assets/char/${raw.charId}.png`
      : null,

    stats: {
      hp: raw.phases?.[0]?.attributesKeyFrames?.[0]?.data?.maxHp ?? 0,
      atk: raw.phases?.[0]?.attributesKeyFrames?.[0]?.data?.atk ?? 0,
      def: raw.phases?.[0]?.attributesKeyFrames?.[0]?.data?.def ?? 0,
      res:
        raw.phases?.[0]?.attributesKeyFrames?.[0]?.data?.magicResistance ?? 0,
    },

    talents: raw.talents ?? [],
    skills: raw.skills ?? [],
  };
}
