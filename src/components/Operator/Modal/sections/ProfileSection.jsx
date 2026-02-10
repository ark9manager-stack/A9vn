import React, { useMemo } from "react";

import profileVN from "../../../../data/profile/profile_vn.json";
import handbookInfoTable from "../../../../data/profile/handbook_info_table.json";
import handbookInfoTableEn from "../../../../data/profile/handbook_info_table_en.json";
import characterTable from "../../../../data/operators/character_table.json";
import itemTable from "../../../../data/operators/item_table.json";
import characterTableEn from "../../../../data/operators/character_table_en.json";
import itemTableEn from "../../../../data/operators/item_table_en.json";

import {
  buildCnAvatarUrl,
  getOperatorCharId,
  normalizeCharId,
} from "../../../../utils/operatorAvatar";

import StatHover from "../../../StatHover";

const RECRUIT_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";

const TOKEN_ICON_BASE_POTENTIAL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/potential/";

const TOKEN_ICON_BASE_CLASSPOTENTIAL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/classpotential/";

const UI_SCALE = {
  overlayDx: -4,
  overlayDy: -4,
  titleFont: 18,
  bodyFont: 16,
  transFont: 15,
  imgBox: 112,
  imgMain: 90,
  imgOverlay: 45,
  overlayOffset: 12,

  titleFontFamily:
    '"Inter","Noto Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  dividerFontFamily:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
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

const HANDBOOK_TITLE_MAP = {
  basic_info: { en: "Basic Info", cn: "基础档案" },
  physical_exam: { en: "Physical Exam", cn: "综合体检测试" },
  profile: { en: "Profile", cn: "客观履历" },
  clinical_analysis: { en: "Clinical Analysis", cn: "临床诊断分析" },
  file_1: { en: "Archive File 1", cn: "档案资料一" },
  file_2: { en: "Archive File 2", cn: "档案资料二" },
  file_3: { en: "Archive File 3", cn: "档案资料三" },
  file_4: { en: "Archive File 4", cn: "档案资料四" },
  promotion_record: { en: "Promotion Record", cn: "晋升记录" },
};

function getHandbookStoryTextByTitle(handbookEntry, storyTitle) {
  const list = handbookEntry?.storyTextAudio;
  if (!Array.isArray(list) || !isNonEmptyString(storyTitle)) return "";

  const block = list.find((x) => x?.storyTitle === storyTitle);
  const stories = block?.stories;
  if (!Array.isArray(stories)) return "";

  const texts = stories
    .map((s) => s?.storyText)
    .filter(isNonEmptyString);

  return texts.join("\n\n");
}

function buildParadoxTextFromStage(stage) {
  if (!stage || stage.zoneId !== "storyMission") return "";
  const name = stage?.name ?? "";
  const desc = stage?.description ?? "";
  return [name, desc].filter(isNonEmptyString).join("\n\n");
}

function getHandbookText({ charId, key }) {
  if (!isNonEmptyString(charId) || !isNonEmptyString(key)) return "";

  // paradox: lấy từ handbookStageData, zoneId=storyMission
  if (key === "paradox") {
    const enStage = handbookInfoTableEn?.handbookStageData?.[charId];
    const cnStage = handbookInfoTable?.handbookStageData?.[charId];
    return pickFirstNonEmpty(
      buildParadoxTextFromStage(enStage),
      buildParadoxTextFromStage(cnStage),
    );
  }

  const map = HANDBOOK_TITLE_MAP[key];
  if (!map) return "";

  const enEntry = handbookInfoTableEn?.handbookDict?.[charId];
  const cnEntry = handbookInfoTable?.handbookDict?.[charId];

  return pickFirstNonEmpty(
    getHandbookStoryTextByTitle(enEntry, map.en),
    getHandbookStoryTextByTitle(cnEntry, map.cn),
  );
}

function renderInlineItalic(str, keyPrefix = "t") {
  const re = /<i>(.*?)<\/i>/gis;
  const nodes = [];
  let last = 0;
  let m;

  while ((m = re.exec(str)) !== null) {
    const start = m.index;
    const end = re.lastIndex;

    if (start > last) nodes.push(str.slice(last, start));
    nodes.push(<i key={`${keyPrefix}-i-${start}-${end}`}>{m[1]}</i>);
    last = end;
  }

  if (last < str.length) nodes.push(str.slice(last));
  return nodes;
}

function renderLineWithNotes(line, keyPrefix = "line") {
  if (!line.includes("[[")) {
    return renderInlineItalic(line, `${keyPrefix}-plain`);
  }

  const out = [];
  let i = 0;

  while (true) {
    const start = line.indexOf("[[", i);
    if (start === -1) break;
    if (start > i) {
      const chunk = line.slice(i, start);
      out.push(...renderInlineItalic(chunk, `${keyPrefix}-t-${i}`));
    }

    const end = line.indexOf("]]", start + 2);
    if (end === -1) {
      const tail = line.slice(start);
      out.push(...renderInlineItalic(tail, `${keyPrefix}-broken-${start}`));
      i = line.length;
      break;
    }

    const inner = line.slice(start + 2, end);
    const pipe = inner.indexOf("|");

    if (pipe === -1) {
      out.push(...renderInlineItalic(line.slice(start, end + 2), `${keyPrefix}-raw-${start}`));
    } else {
      const label = inner.slice(0, pipe);
      const noteKey = inner.slice(pipe + 1);

      out.push(
        <StatHover
          key={`${keyPrefix}-note-${start}-${end}-${noteKey}`}
          label={label}
          noteKey={noteKey}
        />
      );
    }

    i = end + 2;
  }

  if (i < line.length) {
    out.push(...renderInlineItalic(line.slice(i), `${keyPrefix}-tail-${i}`));
  }

  return out;
}

function renderMultiline(text) {
  if (!isNonEmptyString(text)) return null;

  const parts = String(text).replace(/\r\n/g, "\n").split("\n");

  return parts.map((line, idx) => (
    <React.Fragment key={`line-${idx}`}>
      {renderLineWithNotes(line, `line-${idx}`)}
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
  if (!id) return { en: null, base: null, picked: null };

  const en =
    (itemTableEn?.items && itemTableEn.items[id]) ? itemTableEn.items[id]
    : (itemTableEn?.[id] ? itemTableEn[id] : null);

  const base =
    (itemTable?.items && itemTable.items[id]) ? itemTable.items[id]
    : (itemTable?.[id] ? itemTable[id] : null);

  return { en, base, picked: en || base || null };
}

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontFamily: UI_SCALE.titleFontFamily,
          fontWeight: 700,
          lineHeight: 1.2,
          fontSize: UI_SCALE.titleFont,
          letterSpacing: 0.2,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </div>
      <div className="mt-2 w-full">
        <div className="h-[2px] w-full bg-white/10" />
      </div>
    </div>
  );
}

function TextBody({ text }) {
  if (!isNonEmptyString(text)) return null;
  return (
    <div style={{ lineHeight: 1.6, fontSize: UI_SCALE.bodyFont, opacity: 0.95 }}>
      {renderMultiline(text)}
    </div>
  );
}

function ImageTextPanel({
  title,
  imgUrl,
  fallbackImgUrl,
  imgAlt,
  overlayUrl,
  text,
  id,
  imgObjectPosition,
}) {
  const [src, setSrc] = React.useState(imgUrl || "");
  const [usedFallback, setUsedFallback] = React.useState(false);

  React.useEffect(() => {
    setSrc(imgUrl || "");
    setUsedFallback(false);
  }, [imgUrl, fallbackImgUrl]);

  const handleImgError = () => {
    if (!usedFallback && isNonEmptyString(fallbackImgUrl)) {
      setUsedFallback(true);
      setSrc(fallbackImgUrl);
      return;
    }
    setSrc("");
  };

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
        {isNonEmptyString(src) ? (
          <img
            src={src}
            onError={handleImgError}
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
              transform: `translate(-50%, -50%) translate(${UI_SCALE.overlayDx}px, ${UI_SCALE.overlayDy}px)`,
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
    tokenIconFallbackUrl,
    physicalPanel,
    recruitFallbackText,
    tokenFallbackText,
  } = useMemo(() => {
    const profileEntry = resolvedCharId ? profileVN?.[resolvedCharId] : null;

    const vn = profileEntry?.vn || {};
    const en = profileEntry?.en || {};
    const cn = profileEntry?.cn || {};

    const _getText = (key) => {
      const fromProfile = pickFirstNonEmpty(vn?.[key], en?.[key], cn?.[key]);
      if (isNonEmptyString(fromProfile)) return fromProfile;

      return getHandbookText({ charId: resolvedCharId, key });
    };
    const trans = pickFirstNonEmpty(vn?.trans);

    const charDataEn = resolvedCharId ? characterTableEn?.[resolvedCharId] : null;
    const charDataBase = resolvedCharId ? characterTable?.[resolvedCharId] : null;
    const charData = charDataEn || charDataBase;
    const recruitBg = rarityToRecruitBg(charData?.rarity);
    const _avatarUrl = resolvedCharId ? buildCnAvatarUrl(resolvedCharId) : "";

    const potentialItemId =
      charData?.potentialItemId ||
      charData?.activityPotentialItemId ||
      charData?.classicPotentialItemId ||
      "";

    const itemPack = getItemEntryById(potentialItemId);
    const iconId = pickFirstNonEmpty(
      itemPack?.en?.iconId,
      itemPack?.base?.iconId,
      potentialItemId
    );

    const tokenUrlPrimary = isNonEmptyString(iconId)
      ? `${TOKEN_ICON_BASE_POTENTIAL}${iconId}.png`
      : "";
    const tokenUrlFallback = isNonEmptyString(iconId)
      ? `${TOKEN_ICON_BASE_CLASSPOTENTIAL}${iconId}.png`
      : "";

    const _recruitFallbackText = (() => {
      const itemDesc = pickFirstNonEmpty(charDataEn?.itemDesc, charDataBase?.itemDesc, "");
      const itemUsage = pickFirstNonEmpty(charDataEn?.itemUsage, charDataBase?.itemUsage, "");
      if (isNonEmptyString(itemDesc) && isNonEmptyString(itemUsage)) return `${itemDesc}\n${itemUsage}`;
      return pickFirstNonEmpty(itemDesc, itemUsage, "");
    })();

    const _tokenFallbackText = pickFirstNonEmpty(
      itemPack?.en?.description,
      itemPack?.base?.description,
      ""
    );

    const physicalText = _getText("physical_exam");
    const performanceText = _getText("physical_exam_2");

    let _physicalPanel = null;
    if (isNonEmptyString(physicalText)) {
      _physicalPanel = { id: "physicalexam", title: "Sức khỏe tổng quát", text: physicalText };
    } else if (isNonEmptyString(performanceText)) {
      _physicalPanel = { id: "performancereview", title: "Đánh giá hiệu suất", text: performanceText };
    }

    return {
      transText: trans,
      getText: _getText,
      recruitBgUrl: recruitBg,
      avatarUrl: _avatarUrl,
      tokenIconUrl: tokenUrlPrimary,
      tokenIconFallbackUrl: tokenUrlFallback,
      physicalPanel: _physicalPanel,
      recruitFallbackText: _recruitFallbackText,
      tokenFallbackText: _tokenFallbackText,
    };
  }, [resolvedCharId]);

  const optionalKeys = new Set(["file_2", "file_3", "file_4", "promotion_record", "paradox"]);

  const recuitText = pickFirstNonEmpty(getText("recuit"), recruitFallbackText);
  const tokenText = pickFirstNonEmpty(getText("token"), tokenFallbackText);
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
          fallbackImgUrl={tokenIconFallbackUrl}
          imgAlt="Token"
          overlayUrl=""
          text={tokenText}
        />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <TextPanel id="basicinfo" title="Thông tin cơ bản" text={basicInfoText} />
        {physicalPanel ? (
          <TextPanel id={physicalPanel.id} title={physicalPanel.title} text={physicalPanel.text} />
        ) : null}
      </div>

      <TextPanel id="profile" title="Hồ sơ" text={profileText} />

      <TextPanel id="clinicalanalysis" title="Phân tích y tế" text={clinicalAnalysisText} />

      {sections.map((s) => {
        const text = getText(s.key);
        if (optionalKeys.has(s.key) && !isNonEmptyString(text)) return null;
        return <TextPanel key={s.id} id={s.id} title={s.title} text={text} />;
      })}
    </div>
  );
}
