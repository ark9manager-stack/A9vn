import React from "react";
import { createPortal } from "react-dom";
import statHoverVN from "../data/stathover_vn.json";
import gameDataConst from "../data/gamedata_const.json";
import gameDataConstEN from "../data/gamedata_const_en.json";

const TOOLTIP_Z_INDEX = 999999;

export const NOTEKEY_LABEL_TEMPLATES = {
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
  "rolv.rem": "<color=#F49800>{0}</color>",
  "ba.steal": "<color=#0098DC>{0}</color>",
};

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeNewlines(text) {
  // Avoid regex literals here to prevent CR/LF copy issues in some editors.
  return String(text ?? "")
    .split("\r\n")
    .join("\n")
    .split("\r")
    .join("\n")
    // Some localized strings contain literal "\n"
    .split("\\n")
    .join("\n");
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

function renderInlineMarkup(str, keyPrefix = "t") {
  if (!isNonEmptyString(str)) return [str ?? ""];

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
  if (text == null) return null;
  const lines = normalizeNewlines(text).split("\n");
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

export function NoteKeyStyle({ noteKey, children, keyPrefix = "nks" }) {
  return applyNoteKeyStyle(children, noteKey, keyPrefix);
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

function getTerm(termId) {
  if (!isNonEmptyString(termId)) return null;

  const key = String(termId).trim();
  const lower = key.toLowerCase();

  const dictEn = gameDataConstEN?.termDescriptionDict || {};
  const dictCn = gameDataConst?.termDescriptionDict || {};

  return dictEn[key] || dictEn[lower] || dictCn[key] || dictCn[lower] || null;
}

function getTemplateForNoteKey(noteKey) {
  if (!isNonEmptyString(noteKey)) return null;
  const direct = NOTEKEY_LABEL_TEMPLATES?.[noteKey];
  if (direct) return direct;

  const lower = noteKey.toLowerCase();
  if (NOTEKEY_LABEL_TEMPLATES?.[lower]) return NOTEKEY_LABEL_TEMPLATES[lower];

  const keys = Object.keys(NOTEKEY_LABEL_TEMPLATES || {});
  const found = keys.find((k) => k.toLowerCase() === lower);
  return found ? NOTEKEY_LABEL_TEMPLATES[found] : null;
}

function getNoteKeyStyle(noteKey) {
  const tpl = getTemplateForNoteKey(noteKey);
  if (!isNonEmptyString(tpl)) return null;

  const italic = /<\s*i\s*>/i.test(tpl);
  const m = /<\s*color\s*=\s*#([0-9a-fA-F]{6,8})\s*>/i.exec(tpl);
  const colorStyle = m ? parseUnityHexColor(m[1]) : null;

  if (!italic && !colorStyle) return null;
  return { italic, colorStyle };
}

function applyNoteKeyStyle(nodes, noteKey, keyPrefix) {
  const style = getNoteKeyStyle(noteKey);
  const base = <React.Fragment key={`${keyPrefix}-base`}>{nodes}</React.Fragment>;

  if (!style) return base;

  const inner = style.italic ? <i key={`${keyPrefix}-it`}>{base}</i> : base;

  if (style.colorStyle?.color) {
    const st = {
      color: style.colorStyle.color,
      ...(style.colorStyle.opacity < 1 ? { opacity: style.colorStyle.opacity } : null),
    };
    return (
      <span key={`${keyPrefix}-c`} style={st}>
        {inner}
      </span>
    );
  }

  return inner;
}

function resolveHoverTarget(keyRaw) {
  const key = String(keyRaw || "").trim();
  if (!isNonEmptyString(key)) return { kind: null, key: "" };
  const term = getTerm(key);
  if (term) return { kind: "term", key };
  const note = getNote(key);
  if (note) return { kind: "note", key };
  // Unknown: treat as noteKey (StatHover will render plain children if no tooltip)
  return { kind: "note", key };
}

/**
 * Parse text with:
 * - [[label|hoverKey]]  -> creates StatHover (noteKey or termId)
 * - <@noteKey>...</>    -> apply highlight style from NOTEKEY_LABEL_TEMPLATES
 * - <$termId>...</>     -> creates StatHover for termId
 * Also preserves stray </> by consuming it (never printing it).
 *
 * This parser intentionally does NOT rely on regex for nested tags.
 */
function parseRichNodes(str, state, keyPrefix, opts = {}, stopAtClose = false) {
  const nodes = [];
  let buf = "";

  const flushBuf = () => {
    if (buf.length === 0) return;
    const cur = buf;
    buf = "";

    // Preserve whitespace-only segments (important to avoid "Steals70" issues)
    if (cur.trim().length === 0) {
      nodes.push(cur);
      return;
    }

    const rendered = renderInlineMarkup(cur, `${keyPrefix}-tx-${state.k++}`);
    nodes.push(...rendered);
  };

  const pushBr = () => {
    nodes.push(<br key={`${keyPrefix}-br-${state.k++}`} />);
  };

  while (state.i < str.length) {
    // Close tag </> (for @/$ blocks)
    if (str.startsWith("</>", state.i)) {
      if (stopAtClose) {
        flushBuf();
        state.i += 3;
        return nodes;
      }
      // stray close => swallow
      state.i += 3;
      continue;
    }

    // Newline
    if (opts.allowNewlines && str[state.i] === "\n") {
      flushBuf();
      state.i += 1;
      pushBr();
      continue;
    }

    // [[label|key]] (treat key as noteKey; consistent with section renderers)
if (str.startsWith("[[", state.i)) {
  const end = str.indexOf("]]", state.i + 2);
  if (end !== -1) {
    const inside = str.slice(state.i + 2, end);
    const bar = inside.indexOf("|");
    if (bar !== -1) {
      flushBuf();
      const labelPart = inside.slice(0, bar);
      const keyPart = inside.slice(bar + 1).trim();

      const subState = { i: 0, k: 0 };
      const labelNodes = parseRichNodes(
        labelPart,
        subState,
        `${keyPrefix}-wl-${state.k++}`,
        { ...opts, allowNewlines: false },
        false
      );

      const compKey = `${keyPrefix}-hv-${state.k++}-${state.i}-${end}`;

      if (isNonEmptyString(keyPart)) {
        nodes.push(
          <StatHover key={compKey} noteKey={keyPart}>
            {labelNodes}
          </StatHover>
        );
      } else {
        nodes.push(labelNodes);
      }

      state.i = end + 2;
      continue;
    }
  }
  // Not a valid pattern => treat as text
}

// <@noteKey>...</> or <$termId>...</>
    if (str[state.i] === "<" && (str[state.i + 1] === "@" || str[state.i + 1] === "$")) {
      // parse key until '>'
      const sigil = str[state.i + 1];
      const gt = str.indexOf(">", state.i + 2);
      if (gt !== -1) {
        const key = str.slice(state.i + 2, gt).trim();
        flushBuf();
        state.i = gt + 1;

        const inner = parseRichNodes(str, state, `${keyPrefix}-in-${state.k++}`, opts, true);
        const wrapKey = `${keyPrefix}-w-${sigil}-${key}-${state.k++}`;

        if (sigil === "@") {
          nodes.push(applyNoteKeyStyle(inner, key, wrapKey));
} else {
  // '$' hover: by default shows term from gamedata_const(_en).
  // If preferNoteForDollar is enabled (VN UI), and a VN note exists, use note instead.
  const preferNote = !!opts?.preferNoteForDollar;
  const vnNote = preferNote ? getNote(key) : null;

  nodes.push(
    vnNote ? (
      <StatHover key={wrapKey} noteKey={key}>
        {inner}
      </StatHover>
    ) : (
      <StatHover key={wrapKey} termId={key}>
        {inner}
      </StatHover>
    )
  );
}
        continue;
      }
    }

    // Otherwise, append char
    buf += str[state.i];
    state.i += 1;
  }

  flushBuf();
  return nodes;
}

export function renderRich(text, keyPrefix, opts = {}) {
  const normalized = normalizeNewlines(text);
  const state = { i: 0, k: 0 };
  return parseRichNodes(normalized, state, keyPrefix, { allowNewlines: true, ...opts }, false);
}

export function renderRichInline(text, keyPrefix, opts = {}) {
  const normalized = normalizeNewlines(text).split("\n").join(" ");
  const state = { i: 0, k: 0 };
  return parseRichNodes(normalized, state, keyPrefix, { ...opts, allowNewlines: false }, false);
}

export function renderAKText(text, keyPrefix = "ak", options = {}) {
  const { inline = false, preferNoteForDollar = false } = options || {};
  return inline
    ? renderRichInline(text, keyPrefix, { preferNoteForDollar })
    : renderRich(text, keyPrefix, { preferNoteForDollar });
}

export default function StatHover({ label, noteKey, termId, children }) {
  const anchorRef = React.useRef(null);
  const tooltipRef = React.useRef(null);
  const hoveringRef = React.useRef(false);

  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, place: "bottom" });

  // Desktop uses hover; mobile uses tap/click (no hover).
  const [canHover, setCanHover] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    try {
      setCanHover(window.matchMedia("(hover: hover)").matches);
    } catch {
      // ignore
    }
  }, []);

  const term = getTerm(termId);
  const note = getNote(noteKey);

  const title = term?.termName || note?.title || "";
  const text = term?.description || note?.text || "";

  const hasTooltip = isNonEmptyString(title) || isNonEmptyString(text);
  const visible = hasTooltip && (open || pinned);

  const hasChildren = children !== undefined && children !== null;

  // If we have no children and no label text, nothing to render
  if (!hasChildren && !isNonEmptyString(label)) return null;

  // Build anchor content:
  // - If children are provided, render them as-is.
  // - If label is provided:
  //    - parse shared tags ([[|]], <@>, <$>) and apply NOTEKEY template style if noteKey matches a template.
  let anchorContent = null;

  if (hasChildren) {
    anchorContent = children;
  } else {
    const parsed = renderRichInline(String(label || ""), "sh-lbl");
    const tpl = getTemplateForNoteKey(noteKey);
    anchorContent = tpl ? applyNoteKeyStyle(parsed, noteKey, "sh-lblwrap") : parsed;
  }

  // If there is no tooltip data, just render label/children without underline or handlers.
  if (!hasTooltip) {
    return <>{anchorContent}</>;
  }

  const updatePos = React.useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tooltipEl = tooltipRef.current;
    const tipW = tooltipEl?.offsetWidth || 280;
    const tipH = tooltipEl?.offsetHeight || 140;

    const gap = 8;

    const spaceTop = rect.top;
    const spaceBottom = vh - rect.bottom;

    const place = spaceBottom >= tipH + gap || spaceBottom >= spaceTop ? "bottom" : "top";

    const top =
      place === "bottom"
        ? rect.bottom + gap + window.scrollY
        : rect.top - gap - tipH + window.scrollY;

    let left = rect.left + rect.width / 2 - tipW / 2 + window.scrollX;
    left = Math.max(8 + window.scrollX, Math.min(left, vw - tipW - 8 + window.scrollX));

    setPos({ top, left, place });
  }, []);

  React.useEffect(() => {
    if (!visible) return;

    updatePos();

    const onScrollOrResize = () => updatePos();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [visible, updatePos]);

  const closeSoon = React.useCallback(() => {
    window.setTimeout(() => {
      if (hoveringRef.current) return;
      if (!pinned) setOpen(false);
    }, 120);
  }, [pinned]);

  const onEnter = () => {
    if (!canHover) return;
    hoveringRef.current = true;
    if (!pinned) setOpen(true);
  };

  const onLeave = () => {
    if (!canHover) return;
    hoveringRef.current = false;
    closeSoon();
  };

  const onClick = (e) => {
    // Only enable click-to-pin on devices without hover (mobile/tablet).
    if (canHover) return;
    e.stopPropagation();
    if (!hasTooltip) return;

    setPinned(true);
    setOpen(true);
    updatePos();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick(e);
    } else if (e.key === "Escape") {
      setPinned(false);
      setOpen(false);
    }
  };

  // Close pinned tooltip when clicking/tapping outside (mobile-friendly)
  React.useEffect(() => {
    if (!pinned) return;

    const onPointerDown = (ev) => {
      const a = anchorRef.current;
      const t = tooltipRef.current;
      const target = ev.target;

      if (a && a.contains(target)) return;
      if (t && t.contains(target)) return;

      setPinned(false);
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pinned]);

  const tooltipNode = visible ? (
    <div
      ref={tooltipRef}
      className="fixed z-[999999] inline-block w-fit max-w-[300px] rounded-lg border border-white/10 bg-black/90 p-3 text-sm text-white shadow-xl"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {isNonEmptyString(title) ? (
        <div className="text-center text-white font-semibold">
          {renderRich(title, "sh-ttl", { allowNewlines: true })}
        </div>
      ) : null}

      {isNonEmptyString(title) && isNonEmptyString(text) ? (
        <div className="h-px bg-white/10 my-3" />
      ) : null}

      {isNonEmptyString(text) ? (
        <div className="text-white/90 whitespace-pre-wrap break-words leading-relaxed">
          {renderRich(text, "sh-txt", { allowNewlines: true })}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <>
      <span
        ref={anchorRef}
        className="cursor-pointer select-text inline-block border-b border-dashed border-white/70 pb-[1px] hover:border-white"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={visible}
      >
        {anchorContent}
      </span>

      {tooltipNode ? createPortal(tooltipNode, document.body) : null}
    </>
  );
}
