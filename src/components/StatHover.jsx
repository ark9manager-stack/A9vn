import React from "react";
import { createPortal } from "react-dom";
import statHoverVN from "../data/stathover_vn.json";

const TOOLTIP_Z_INDEX = 999999;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// Whitelist ONLY <i>...</i>
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

function renderMultiline(text, keyPrefix = "ml") {
  if (!isNonEmptyString(text)) return null;
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  return lines.map((line, idx) => (
    <React.Fragment key={`${keyPrefix}-${idx}`}>
      {renderInlineItalic(line, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
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
  if (!note || (!isNonEmptyString(title) && !isNonEmptyString(text))) {
    return <>{label}</>;
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
        transform:
          pos.place === "bottom"
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
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

  return (
    <>
      <span
        ref={anchorRef}
        className="
          stathover
          cursor-pointer select-none
          font-semibold
          text-cyan-300 hover:text-cyan-200
          underline decoration-cyan-300/60 hover:decoration-cyan-200/70
          underline-offset-4
        "
        style={{
            fontFamily: "inherit",
            textDecorationThickness: "2px",
            }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={togglePin}
        role="button"
        tabIndex={0}
      >
        {label}
      </span>

      {visible ? createPortal(tooltipNode, document.body) : null}
    </>
  );
}
