import React, { useMemo } from "react";

import profileVN from "../../../../data/operators/profile_vn.json";
import characterTable from "../../../../data/operators/character_table.json";
import itemTable from "../../../../data/operators/item_table.json";

import {
  buildCnAvatarUrl,
  getOperatorCharId,
  normalizeCharId,
} from "../../../../utils/operatorAvatar";

// Recruit panel bg (rarity-based)
const RECRUIT_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";

// Token icon (potential item)
const TOKEN_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/potential/";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (isNonEmptyString(v)) return v;
  }
  return "";
}

function renderMultiline(text) {
  if (!isNonEmptyString(text)) return null;
  const parts = String(text).replace(/\r\n/g, "\n").split("\n");
  return parts.map((part, idx) => (
    <React.Fragment key={idx}>
      {part}
      {idx < parts.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

function rarityToRecruitBg(rarity) {
  // rarity: "TIER_1" -> op_r1.png ... "TIER_6" -> op_r6.png
  const m = typeof rarity === "string" ? rarity.match(/TIER_(\d+)/) : null;
  const n = m ? Number(m[1]) : 1;
  const safe = Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
  return `${RECRUIT_BG_BASE}op_r${safe}.png`;
}

function getItemEntryById(id) {
  if (!id) return null;
  // item_table.json can be either { items: { ... } } or direct map
  if (itemTable?.items && itemTable.items[id]) return itemTable.items[id];
  if (itemTable?.[id]) return itemTable[id];
  return null;
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
      {children}
    </div>
  );
}

function TextBody({ text }) {
  if (!isNonEmptyString(text)) return null;
  return (
    <div style={{ lineHeight: 1.5, fontSize: 14, opacity: 0.95 }}>
      {renderMultiline(text)}
    </div>
  );
}

function ImageTextPanel({ title, imgUrl, imgAlt, overlayUrl, text, id }) {
  return (
    <div
      id={id}
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.18)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          position: "relative",
          flex: "0 0 auto",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={imgAlt || title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}

        {overlayUrl ? (
          <img
            src={overlayUrl}
            alt=""
            style={{
              position: "absolute",
              left: 8,
              bottom: 8,
              width: 44,
              height: 44,
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.25)",
            }}
          />
        ) : null}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <SectionTitle>{title}</SectionTitle>
        <TextBody text={text} />
      </div>
    </div>
  );
}

function TextPanel({ title, text, id }) {
  return (
    <div
      id={id}
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.18)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <SectionTitle>{title}</SectionTitle>
      <TextBody text={text} />
    </div>
  );
}

export default function ProfileSection({ operator, charId }) {
  const resolvedCharId = useMemo(() => {
    const fromProp = isNonEmptyString(charId) ? charId : null;
    const fromOperator = operator ? getOperatorCharId(operator) : null;
    return normalizeCharId(fromProp || fromOperator || "");
  }, [operator, charId]);

  const { transText, getText, recruitBgUrl, avatarUrl, tokenIconUrl } =
    useMemo(() => {
      const profileEntry = resolvedCharId ? profileVN?.[resolvedCharId] : null;

      const vn = profileEntry?.vn || {};
      const en = profileEntry?.en || {};
      const cn = profileEntry?.cn || {};

      const _getText = (key) =>
        pickFirstNonEmpty(vn?.[key], en?.[key], cn?.[key]);

      const trans = pickFirstNonEmpty(vn?.trans);

      const charData = resolvedCharId ? characterTable?.[resolvedCharId] : null;

      const rarity = charData?.rarity;
      const recruitBg = rarityToRecruitBg(rarity);

      const _avatarUrl = resolvedCharId ? buildCnAvatarUrl(resolvedCharId) : "";

      const potentialItemId =
        charData?.potentialItemId ||
        charData?.activityPotentialItemId ||
        charData?.classicPotentialItemId ||
        "";

      const itemEntry = getItemEntryById(potentialItemId);
      const iconId = pickFirstNonEmpty(itemEntry?.iconId, potentialItemId);
      const tokenUrl = isNonEmptyString(iconId)
        ? `${TOKEN_ICON_BASE}${iconId}.png`
        : "";

      return {
        transText: trans,
        getText: _getText,
        recruitBgUrl: recruitBg,
        avatarUrl: _avatarUrl,
        tokenIconUrl: tokenUrl,
      };
    }, [resolvedCharId]);

  // Optional sections to hide if empty (as requested)
  const optionalIfEmpty = new Set(["file_4", "promotion_record", "paradox"]);

  const singleSections = [
    { id: "profile", key: "profile", title: "Hồ sơ" },
    {
      id: "clinicalanalysis",
      key: "clinical_analysis",
      title: "Phân tích y tế",
    },
    { id: "file_1", key: "file_1", title: "Tài liệu lưu trữ 1" },
    { id: "file_2", key: "file_2", title: "Tài liệu lưu trữ 2" },
    { id: "file_3", key: "file_3", title: "Tài liệu lưu trữ 3" },
    { id: "file_4", key: "file_4", title: "Tài liệu lưu trữ 4" },
    { id: "promotion", key: "promotion_record", title: "Bản ghi thăng tiến" },
    {
      id: "paradox",
      key: "paradox",
      title: "Giả thuyết/Paradox Simulation",
    },
  ];

  const recuitText = getText("recuit");
  const tokenText = getText("token");

  const basicInfoText = getText("basic_info");
  const physicalExamText = getText("physical_exam");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Translator line (only VN has "trans"). Hide if empty. */}
      {isNonEmptyString(transText) ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.12)",
            fontSize: 13,
            opacity: 0.95,
          }}
        >
          {renderMultiline(transText)}
        </div>
      ) : null}

      {/* Row 1: Recruit (left) + Token (right) */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ImageTextPanel
          id="recuit"
          title="Hợp đồng tuyển dụng"
          imgUrl={recruitBgUrl}
          imgAlt="Recruit Contract"
          overlayUrl={avatarUrl}
          text={recuitText}
        />
        <ImageTextPanel
          id="token"
          title="Tín vật"
          imgUrl={tokenIconUrl}
          imgAlt="Token"
          overlayUrl=""
          text={tokenText}
        />
      </div>

      {/* Row 2: Basic Info (left) + Physical Exam (right) */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <TextPanel
          id="basicinfo"
          title="Thông tin cơ bản"
          text={basicInfoText}
        />
        <TextPanel
          id="physicalexam"
          title="Kiểm tra sức khỏe"
          text={physicalExamText}
        />
      </div>

      {/* Rows below: single-column */}
      {singleSections.map((s) => {
        const text = getText(s.key);

        if (optionalIfEmpty.has(s.key) && !isNonEmptyString(text)) return null;

        return (
          <TextPanel key={s.id} id={s.id} title={s.title} text={text} />
        );
      })}
    </div>
  );
}
