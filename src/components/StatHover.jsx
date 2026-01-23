import React from "react";
import statHoverVN from "../data/stathover_vn.json";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
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

function StatHover({ label, noteKey }) {
  const ref = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);

  const note = getNote(noteKey);
  const title = note?.title || "";
  const text = note?.text || "";

  const visible = open || pinned;

  React.useEffect(() => {
    if (!visible) return;

    const onPointerDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setPinned(false);
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [visible]);

  if (!isNonEmptyString(label)) return null;

  if (!note || (!isNonEmptyString(title) && !isNonEmptyString(text))) {
    return <>{label}</>;
  }

  const onEnter = () => setOpen(true);
  const onLeave = () => {
    if (!pinned) setOpen(false);
  };

  const togglePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPinned((v) => {
      const next = !v;
      setOpen(true);
      return next;
    });
  };

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-open={visible ? "true" : "false"}
    >
      {/* highlighted word */}
      <span
        className="
          stathover
          cursor-pointer select-none
          underline decoration-dotted underline-offset-4
          decoration-white/40 hover:decoration-white/70
        "
        onClick={togglePin}
        role="button"
        tabIndex={0}
      >
        {label}
      </span>

      {visible ? (
        <div
          className="
            absolute z-50 mt-2
            left-1/2 -translate-x-1/2
            w-[320px] max-w-[82vw]
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-lg border border-white/15 bg-black/90 shadow-lg overflow-hidden">
            {isNonEmptyString(title) ? (
              <div className="px-3 py-2 bg-white/10 border-b border-white/10 font-semibold">
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
      ) : null}
    </span>
  );
}

export default StatHover;
