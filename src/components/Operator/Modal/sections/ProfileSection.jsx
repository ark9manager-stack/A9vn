import React, { useMemo } from "react";

import profileVN from "../../../../data/operators/profile_vn.json";
import characterTable from "../../../../data/operators/character_table.json";
import itemTable from "../../../../data/operators/item_table.json";

import {
  buildCnAvatarUrl,
  getOperatorCharId,
  normalizeCharId,
} from "../../../../utils/operatorAvatar";

const RECRUIT_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";

const TOKEN_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/potential/";

const UI_SCALE = {
  imgOverlay: 40,
  overlayDx: 0,
  overlayDy: 0,

  // image block size
  imgBox: 112, // was 92
  imgMain: 90, // was 72
  imgOverlay: 40, // was 32
  overlayOffset: 12, // was 10
};

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
  const m = typeof rarity === "string" ? rarity.match(/TIER_(\d+)/) : null;
  const n = m ? Number(m[1]) : 1;
  const safe = Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
  return `${RECRUIT_BG_BASE}op_r${safe}.png`;
}

function getItemEntryById(id) {
  if (!id) return null;
  if (itemTable?.items && itemTable.items[id]) return itemTable.items[id];
  if (itemTable?.[id]) return itemTable[id];
  return null;
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontWeight: 800,
        marginBottom: 8,
        lineHeight: 1.2,
        fontSize: UI_SCALE.titleFont,
      }}
    >
      {children}
    </div>
  );
}

function TextBody({ text }) {
  if (!isNonEmptyString(text)) return null;
  return (
    <div
      style={{
        lineHeight: 1.6,
        fontSize: UI_SCALE.bodyFont,
        opacity: 0.95,
      }}
    >
      {renderMultiline(text)}
    </div>
  );
}

function ImageTextPanel({
  title,
  imgUrl,
  imgAlt,
  overlayUrl,
  text,
  id,
  imgObjectPosition,
}) {
  return (
    <div
      id={id}
      style={{
        display: "flex",
        gap: 14,
        padding: 14,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.18)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: UI_SCALE.imgBox,
          height: UI_SCALE.imgBox,
          position: "relative",
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          borderRadius: 0,
          overflow: "visible",
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={imgAlt || title}
            style={{
              width: UI_SCALE.imgMain,
              height: UI_SCALE.imgMain,
              objectFit: "contain",
              objectPosition: imgObjectPosition || "50% 50%",
              display: "block",
              borderRadius: 0,
              background: "transparent",
            }}
          />
        ) : null}

        {overlayUrl ? (
          <img
            src={overlayUrl}
            alt=""
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: UI_SCALE.imgOverlay,
              height: UI_SCALE.imgOverlay,
              objectFit: "cover",
              borderRadius: 0,
              boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "transparent",
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
  if (!isNonEmptyString(text)) return null;
  return (
    <div
      id={id}
      style={{
        padding: 14,
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

  const {
    transText,
    getText,
    recruitBgUrl,
    avatarUrl,
    tokenIconUrl,
    physicalPanel,
  } = useMemo(() => {
    const profileEntry = resolvedCharId ? profileVN?.[resolvedCharId] : null;

    const vn = profileEntry?.vn || {};
    const en = profileEntry?.en || {};
    const cn = profileEntry?.cn || {};

    const _getText = (key) => pickFirstNonEmpty(vn?.[key], en?.[key], cn?.[key]);
    const trans = pickFirstNonEmpty(vn?.trans);

    const charData = resolvedCharId ? characterTable?.[resolvedCharId] : null;
    const recruitBg = rarityToRecruitBg(charData?.rarity);
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

    // Right slot row 2: physical_exam OR physical_exam_2 (Performance Review)
    const physicalText = _getText("physical_exam");
    const performanceText = _getText("physical_exam_2");

    let _physicalPanel = null;
    if (isNonEmptyString(physicalText)) {
      _physicalPanel = {
        id: "physicalexam",
        title: "Kiểm tra sức khỏe",
        text: physicalText,
      };
    } else if (isNonEmptyString(performanceText)) {
      _physicalPanel = {
        id: "performancereview",
        title: "Đánh giá hiệu suất",
        text: performanceText,
      };
    }

    return {
      transText: trans,
      getText: _getText,
      recruitBgUrl: recruitBg,
      avatarUrl: _avatarUrl,
      tokenIconUrl: tokenUrl,
      physicalPanel: _physicalPanel,
    };
  }, [resolvedCharId]);

  const optionalKeys = new Set([
    "file_2",
    "file_3",
    "file_4",
    "promotion_record",
    "paradox",
  ]);

  const recuitText = getText("recuit");
  const tokenText = getText("token");
  const basicInfoText = getText("basic_info");

  const profileText = getText("profile");
  const clinicalAnalysisText = getText("clinical_analysis");

  const sections = [
    { id: "file_1", key: "file_1", title: "Tài liệu lưu trữ 1" },
    { id: "file_2", key: "file_2", title: "Tài liệu lưu trữ 2" },
    { id: "file_3", key: "file_3", title: "Tài liệu lưu trữ 3" },
    { id: "file_4", key: "file_4", title: "Tài liệu lưu trữ 4" },
    { id: "promotion", key: "promotion_record", title: "Bản ghi thăng tiến" },
    { id: "paradox", key: "paradox", title: "Giả thuyết/Paradox Simulation" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {isNonEmptyString(transText) ? (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.12)",
            fontSize: UI_SCALE.transFont,
            lineHeight: 1.6,
            opacity: 0.95,
          }}
        >
          {renderMultiline(transText)}
        </div>
      ) : null}

      {/* Row 1 */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ImageTextPanel
          id="recuit"
          title="Hợp đồng tuyển dụng"
          imgUrl={recruitBgUrl}
          imgAlt="Recruit Contract"
          overlayUrl={avatarUrl}
          text={recuitText}
          imgObjectPosition="50% 55%"
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

      {/* Row 2 */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <TextPanel id="basicinfo" title="Thông tin cơ bản" text={basicInfoText} />

        {physicalPanel ? (
          <TextPanel
            id={physicalPanel.id}
            title={physicalPanel.title}
            text={physicalPanel.text}
          />
        ) : null}
      </div>

      {/* Single column */}
      <TextPanel id="profile" title="Hồ sơ" text={profileText} />

      <TextPanel
        id="clinicalanalysis"
        title="Phân tích y tế"
        text={clinicalAnalysisText}
      />

      {sections.map((s) => {
        const text = getText(s.key);
        if (optionalKeys.has(s.key) && !isNonEmptyString(text)) return null;
        return <TextPanel key={s.id} id={s.id} title={s.title} text={text} />;
      })}
    </div>
  );
}
