import React from "react";
import { createPortal } from "react-dom";
import statHoverVN from "../data/stathover_vn.json";

const TOOLTIP_Z_INDEX = 999999;

const NOTEKEY_LABEL_TEMPLATES = {
  "mission.levelname": "<color=#FFDE00>{0}</color>",
  "mission.number": "<color=#FFDE00>{0}</color>",
  "tu.kw": "<color=#0098DC>{0}</color>",
  "tu.imp": "<color=#FF0000>{0}</color>",
  "cc.vup": "<color=#0098DC>{0}</color>",
  "cc.vdown": "<color=#FF6237>{0}</color>",
  "cc.rem": "<color=#F49800>{0}</color>",
  "cc.kw": "<color=#00B0FF>{0}</color>",
  "cc.pn": "<i>{0}</i>",
  "cc.talpu": "{0}",
  "ba.vup": "<color=#0098DC>{0}</color>",
  "ba.vdown": "<color=#FF6237>{0}</color>",
  "ba.rem": "<color=#F49800>{0}</color>",
  "ba.kw": "<color=#00B0FF>{0}</color>",
  "ba.pn": "<i>{0}</i>",
  "ba.talpu": "<color=#0098DC>{0}</color>",
  "ba.xa": "<color=#FF0000>{0}</color>",
  "ba.xb": "<color=#FF7D00>{0}</color>",
  "ba.xc": "<color=#FFFF00>{0}</color>",
  "ba.xd": "<color=#00FF00>{0}</color>",
  "ba.xe": "<color=#00FFFF>{0}</color>",
  "ba.xf": "<color=#0291FF>{0}</color>",
  "ba.xg": "<color=#FF00FF>{0}</color>",
  "ba.gild": "<color=#2FAC78>{0}</color>",
  "ba.enemy": "<color=#D83C3C>{0}</color>",
  "ba.drop": "<color=#36ACFF>{0}</color>",
  "ba.acrem": "<color=#727272>{0}</color>",
  "eb.key": "<color=#00FFFF>{0}</color>",
  "eb.danger": "<color=#FF0000>{0}</color>",
  "ro.get": "<color=#0098DC>{0}</color>",
  "ro.lose": "<color=#C82A36>{0}</color>",
  "rolv.rem": "<color=#FF4C22>{0}</color>",
  "lv.description": "<color=#d8d769>{0}</color>",
  "lv.extrades": "<color=#d8d769>{0}</color>",
  "lv.item": "<color=#FFFFFF>{0}</color>",
  "lv.rem": "<color=#FFFFFF>{0}</color>",
  "lv.fs": "<color=#FF0000>{0}</color>",
  "lv.sp": "<color=#fd4600>{0}</color>",
  "lv.ez": "<color=#0098dc>{0}</color>",
  "recalrune.nag": "<color=#c9001c>{0}</color>",
  "recalrune.pos": "<color=#0098dc>{0}</color>",
  "crisisv2.nag": "<color=#ea9818>{0}</color>",
  "crisisv2.pos": "<color=#16acaa>{0}</color>",
  "crisisv2.cra": "<color=#d7181c>{0}</color>",
  "ro1.get": "<color=#E5B684>{0}</color>",
  "ro2.lose": "<color=#FF6E6E>{0}</color>",
  "ro2.get": "<color=#59DDDC>{0}</color>",
  "ro2.virtue": "<color=#0098dc>{0}</color>",
  "ro2.mutation": "<color=#9266b2>{0}</color>",
  "ro2.desc": "<color=#6d6d6d>{0}</color>",
  "ro3.lose": "<color=#FF6E6E>{0}</color>",
  "ro3.get": "<color=#9ed9fd>{0}</color>",
  "ro3.redt": "<color=#ff4532>{0}</color>",
  "ro3.greent": "<color=#4ffaa5>{0}</color>",
  "ro3.bluet": "<color=#0085ff>{0}</color>",
  "ro3.bosst": "<color=#ffffff>{0}</color>",
  "ro4.lose": "<color=#FF6E6E>{0}</color>",
  "ro4.get": "<color=#28bfe5>{0}</color>",
  "ro5.lose": "<color=#FF6E6E>{0}</color>",
  "ro5.get": "<color=#28bfe5>{0}</color>",
  "rc.title": "<color=#FFFFFF>{0}</color>",
  "rc.subtitle": "<color=#FFC90E>{0}</color>",
  "rc.em": "<color=#FF7F27>{0}</color>",
  "rc.eml": "<color=#32CD32>{0}</color>",
  "ga.title": "<color=#FFFFFF>{0}</color>",
  "ga.subtitle": "<color=#FFC90E>{0}</color>",
  "ga.up": "<color=#FF7F27>{0}</color>",
  "ga.adgacha": "<color=#00C8FF>{0}</color>",
  "ga.nbgacha": "<color=#00DDBB>{0}</color>",
  "ga.limadgacha": "<color=#FF7E1F>{0}</color>",
  "ga.percent": "<color=#FFD800>{0}</color>",
  "ga.attention": "<color=#FF3126>{0}</color>",
  "ga.classicgacha": "<color=#00A8FF>{0}</color>",
  "attainga.desc": "<color=#FF0000>{0}</color>",
  "attainga.desc2": "<color=#FFD800>{0}</color>",
  "attainga.attention": "<color=#E1322C>{0}</color>",
  "linkagega.charname": "<color=#FFF6A9>{0}</color>",
  "linkagega.title": "<color=#FF8A00>{0}</color>",
  "ga.spgacha": "<color=#FF8A00>{0}</color>",
  "limtedga.title": "<color=#FFFFFF>{0}</color>",
  "limtedga.subtitle": "<color=#FFC90E>{0}</color>",
  "limtedga.up": "<color=#FF7F27>{0}</color>",
  "limtedga.21": "<color=#D7BCFF>{0}</color>",
  "limtedga.percent": "<color=#FFD800>{0}</color>",
  "limtedga.attention": "<color=#E1322C>{0}</color>",
  "limtedga.lattention": "<color=#FF9E58>{0}</color>",
  "vc.newyear10": "<color=#FF3823>{0}</color>",
  "vc.adgacha": "<color=#0098DC>{0}</color>",
  "vc.attention": "<color=#FFD800>{0}</color>",
  "act.missiontips": "<color=#d9bd6a>{0}</color>",
  "lv.hdbg": "<color=#7ba61f>{0}</color>",
  "autochess.gray": "<color=#777777>{0}</color>",
  "autochess.dgreen": "<color=#40B196>{0}</color>",
  "vecbreakv2.highlight": "<color=#d8741a>{0}</color>",
  "duel.ping.low": "<color=#7fa826>{0}</color>",
  "duel.ping.medium": "<color=#ec7a00>{0}</color>",
  "duel.ping.high": "<color=#ff3d3d>{0}</color>",
  "duel.milestone": "<color=#D4133C>{0}</color>",
  "duel.dm.award": "<color=#36BBCC>{0}</color>",
  "duel.dm.condition": "<color=#C9C9C9>{0}</color>",
  "tu.ht": "<color=#ff8d00>{0}</color>",
  "multiv3.teambuff": "<color=#d0294c>{0}</color>",
  "multiv3.matchdesc": "<color=#2ea0af>{0}</color>",
  "multiv3.unlocktoast": "<color=#ff3a64>{0}</color>",
  "multiv3.photodesc": "<color=#31acbc>{0}</color>",
  "acdm.award": "<color=#04d3a3>{0}</color>",
  "acdm.milestone": "<color=#2da186>{0}</color>",
  "acdm.hudtip": "<color=#04d3a3>{0}</color>",
  "acdm.buff": "<color=#2da186>{0}</color>",
  "acdm.tracker": "<color=#2da186>{0}</color>",
  "trap.number": "<color=#018FCE>{0}</color>",
  "trap.debuff": "<color=#d83c3c>{0}</color>",
  "trap.monster": "<color=#d83c3c>{0}</color>",
  "trap.combine": "<color=#018FCE>{0}</color>",
  "trap.drop": "<color=#018FCE>{0}</color>",
  "strategy.number": "<color=#018FCE>{0}</color>",
  "strategy.text": "<color=#018FCE>{0}</color>",
  "strategy.text2": "<color=#767676>{0}</color>",
  "gacha.text": "<color=#f3e468>{0}</color>",
  "buff.number": "<color=#ede160>{0}</color>",
  "level.highlight": "<color=#ede161>{0}</color>",
  "lv.act20side": "<color=#F7BC44>{0}</color>",
  "lv.act20sre": "<color=#F7BC44>{0}</color>",
  "lv.mhitem": "<color=#A57F5B>{0}</color>",
  "lv.mhtx": "<color=#1B1B1B>{0}</color>",
  "lv.mhfs": "<color=#A57F5B>{0}</color>",
  "cc.miu": "<color=#8F7156>{0}</color>",
  "ping.low": "<color=#7fa826>{0}</color>",
  "ping.medium": "<color=#ec7a00>{0}</color>",
  "ping.high": "<color=#ff3d3d>{0}</color>",
  "match.success": "<color=#36BBCC>{0}</color>",
  "map.normal": "<color=#36BBCC>{0}</color>",
  "map.football": "<color=#36BBCC>{0}</color>",
  "map.defence": "<color=#36BBCC>{0}</color>",
  "milestone": "<color=#D4133C>{0}</color>",
  "dm.award": "<color=#36BBCC>{0}</color>",
  "dm.condition": "<color=#C9C9C9>{0}</color>",
  "tutor": "<color=#36BBCC>{0}</color>",
  "lv.muitem": "<color=#D4133C>{0}</color>",
  "token.highlight": "<color=#d8741a>{0}</color>",
  "ba.grt": "<color=#FFAB27>{0}</color>",
  "ba.exl": "<color=#14F0AF>{0}</color>",
  "ba.hrd": "<color=#DA2536>{0}</color>",
  "firework.npc": "<color=#810d17>{0}</color>",
  "act.spreward": "<color=#FF5001>{0}</color>",
  "char.oblv": "<color=#7799cc>{0}</color>",
  "char.mort": "<color=#779977>{0}</color>",
  "char.dolr": "<color=#bb9955>{0}</color>",
  "char.amor": "<color=#aa4477>{0}</color>",
  "char.tmor": "<color=#335566>{0}</color>",
  "act.timelimit": "<color=#ffe300>{0}</color>",
  "vc.text": "<color=#898989>{0}</color>",
  "vc.endtime": "<color=#ff0327>{0}</color>",
  "firework.animal": "<color=#0098dc>{0}</color>",
  "firework.animaldesc_1": "<color=#f05b6d>{0}</color>",
  "firework.animaldesc_2": "<color=#b7d888>{0}</color>",
  "firework.animaldesc_3": "<color=#ffc25e>{0}</color>",
  "firework.animaldesc_4": "<color=#70c0db>{0}</color>",
  "firework.animaldesc_all": "<color=#ffecb1>{0}</color>",
};

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function getLabelTemplate(noteKey) {
  if (!isNonEmptyString(noteKey)) return null;

  if (NOTEKEY_LABEL_TEMPLATES?.[noteKey]) return NOTEKEY_LABEL_TEMPLATES[noteKey];

  const lower = noteKey.toLowerCase();
  if (NOTEKEY_LABEL_TEMPLATES?.[lower]) return NOTEKEY_LABEL_TEMPLATES[lower];

  const keys = Object.keys(NOTEKEY_LABEL_TEMPLATES || {});
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? NOTEKEY_LABEL_TEMPLATES[found] : null;
}

function applyLabelTemplate(label, template) {
  if (!isNonEmptyString(template)) return label;
  return template.includes("{0}") ? template.replaceAll("{0}", String(label)) : String(label);
}

function parseUnityHexColor(hexRaw) {
  const hex = String(hexRaw || "").replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) return null;

  if (hex.length === 8) {
    const a = parseInt(hex.slice(0, 2), 16);
    const rgb = hex.slice(2);
    return { color: `#${rgb}`, opacity: Math.max(0, Math.min(1, a / 255)) };
  }

  return { color: `#${hex}`, opacity: 1 };
}

function extractFirstColorStyle(str) {
  if (!isNonEmptyString(str)) return null;
  const m = /<\s*color\s*=\s*#([0-9a-fA-F]{6,8})\s*>/i.exec(str);
  return m ? parseUnityHexColor(m[1]) : null;
}

function renderInlineMarkup(str, keyPrefix = "t") {
  if (!isNonEmptyString(str)) return [];

  const re = /<color=#([0-9a-fA-F]{6,8})>([\s\S]*?)<\/color>|<i>([\s\S]*?)<\/i>/gi;
  const nodes = [];
  let last = 0;
  let m;

  while ((m = re.exec(str)) !== null) {
    const start = m.index;
    const end = re.lastIndex;

    if (start > last) nodes.push(str.slice(last, start));

    if (m[1] && typeof m[2] === "string") {
      const colorStyle = parseUnityHexColor(m[1]);
      const inner = m[2];
      nodes.push(
        <span
          key={`${keyPrefix}-c-${start}-${end}-${m[1]}`}
          style={
            colorStyle
              ? {
                  color: colorStyle.color,
                  ...(colorStyle.opacity < 1 ? { opacity: colorStyle.opacity } : null),
                }
              : undefined
          }
        >
          {renderInlineMarkup(inner, `${keyPrefix}-cinner-${start}`)}
        </span>
      );
      last = end;
      continue;
    }

    if (typeof m[3] === "string") {
      const inner = m[3];
      nodes.push(
        <i key={`${keyPrefix}-i-${start}-${end}`}>{renderInlineMarkup(inner, `${keyPrefix}-iinner-${start}`)}</i>
      );
      last = end;
      continue;
    }

    nodes.push(str.slice(start, end));
    last = end;
  }

  if (last < str.length) nodes.push(str.slice(last));
  return nodes;
}

export function renderInlineItalic(str, keyPrefix = "t") {
  return renderInlineMarkup(str, keyPrefix);
}

export function renderMultiline(text, keyPrefix = "ml") {
  if (!isNonEmptyString(text)) return null;
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  return lines.map((line, idx) => (
    <React.Fragment key={`${keyPrefix}-${idx}`}>
      {renderInlineMarkup(line, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

export function ItalicText({ text, as: As = "span", className, keyPrefix = "it" }) {
  if (!isNonEmptyString(text)) return null;
  return <As className={className}>{renderMultiline(text, keyPrefix)}</As>;
}

function getNote(noteKey) {
  if (!isNonEmptyString(noteKey)) return null;

  if (statHoverVN?.[noteKey]) return statHoverVN[noteKey];

  const lower = noteKey.toLowerCase();
  if (statHoverVN?.[lower]) return statHoverVN[lower];

  const keys = Object.keys(statHoverVN || {});
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? statHoverVN[found] : null;
}

export default function StatHover({ label, noteKey }) {
  const anchorRef = React.useRef(null);
  const tooltipRef = React.useRef(null);
  const hoveringRef = React.useRef(false);

  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, place: "bottom" });

  const note = getNote(noteKey);
  const title = note?.title || "";
  const text = note?.text || "";

  const visible = open || pinned;

  const updatePos = React.useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 8;
    const estH = 170;

    const canPlaceBottom = rect.bottom + margin + estH < window.innerHeight;
    const place = canPlaceBottom ? "bottom" : "top";

    const top = place === "bottom" ? rect.bottom + margin : rect.top - margin;
    const left = rect.left + rect.width / 2;

    setPos({ top, left, place });
  }, []);

  const onEnter = () => {
    hoveringRef.current = true;
    setOpen(true);
    updatePos();
  };

  const onLeave = () => {
    hoveringRef.current = false;
    window.setTimeout(() => {
      if (!pinned && !hoveringRef.current) setOpen(false);
    }, 80);
  };

  const togglePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPinned((v) => {
      const next = !v;
      setOpen(true);
      return next;
    });
    updatePos();
  };

  React.useEffect(() => {
    if (!visible) return;

    updatePos();

    const onPointerDown = (e) => {
      const a = anchorRef.current;
      const t = tooltipRef.current;
      if (a && a.contains(e.target)) return;
      if (t && t.contains(e.target)) return;

      setPinned(false);
      setOpen(false);
    };

    const onScrollResize = () => updatePos();

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [visible, pinned, updatePos]);

  if (!isNonEmptyString(label)) return null;

  const labelTemplate = getLabelTemplate(noteKey);
  const formattedLabel = applyLabelTemplate(label, labelTemplate);
  const labelColor = extractFirstColorStyle(labelTemplate);

  if (!note || (!isNonEmptyString(title) && !isNonEmptyString(text))) {
    return <>{renderInlineMarkup(formattedLabel, `st-label-${noteKey || ""}`)}</>;
  }

  const tooltipNode = (
    <div
      ref={tooltipRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: pos.place === "bottom" ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: TOOLTIP_Z_INDEX,
        pointerEvents: "auto",
        width: "320px",
        maxWidth: "82vw",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rounded-lg border border-white/15 bg-black/90 shadow-lg overflow-hidden">
        {isNonEmptyString(title) ? (
          <div className="px-3 py-2 bg-white/10 border-b border-white/10 font-semibold text-white">
            {renderMultiline(title, `st-title-${noteKey}`)}
          </div>
        ) : null}

        {isNonEmptyString(text) ? (
          <div className="px-3 py-2 text-sm leading-relaxed text-white/90">
            {renderMultiline(text, `st-body-${noteKey}`)}
          </div>
        ) : null}
      </div>
    </div>
  );

  const anchorBaseColor = labelColor?.color || "#0098DC";

  return (
    <>
      <span
        ref={anchorRef}
        className="
          stathover
          cursor-pointer select-none
          font-semibold
          underline-offset-4
        "
        style={{
          fontFamily: "inherit",
          color: anchorBaseColor,
          ...(labelColor?.opacity != null && labelColor.opacity < 1 ? { opacity: labelColor.opacity } : null),
          textDecorationColor: anchorBaseColor,
          textDecorationThickness: "2px",
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={togglePin}
        role="button"
        tabIndex={0}
      >
        {renderInlineMarkup(formattedLabel, `st-label-${noteKey || ""}`)}
      </span>

      {visible ? createPortal(tooltipNode, document.body) : null}
    </>
  );
}
