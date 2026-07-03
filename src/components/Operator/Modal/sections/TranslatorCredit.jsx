import React from "react";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeNewlines(text) {
  return String(text ?? "")
    .split("\r\n")
    .join("\n")
    .split("\r")
    .join("\n")
    .split("\\n")
    .join("\n");
}

function normalizeLinkToken(raw) {
  return String(raw || "").trim();
}

function normalizeHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return "";
}

function collectLinkMap(links) {
  const map = new Map();
  const sources = Array.isArray(links) ? links : [links];

  const add = (key, value) => {
    const k = normalizeLinkToken(key);
    const href = normalizeHref(value);
    if (!k || !href) return;
    map.set(k, href);
    map.set(k.toLowerCase(), href);
  };

  const walk = (obj, prefix = "") => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        add(key, value);
        add(fullKey, value);
      } else if (
        value &&
        typeof value === "object" &&
        (key === "trans_links" || key === "links" || key === "credit_links")
      ) {
        walk(value, fullKey);
      }
    }
  };

  for (const src of sources) walk(src);
  return map;
}

function resolveHref(token, links) {
  const direct = normalizeHref(token);
  if (direct) return direct;

  const key = normalizeLinkToken(token);
  if (!key) return "";

  const map = collectLinkMap(links);
  return map.get(key) || map.get(key.toLowerCase()) || "";
}

function renderCreditInline(text, links, keyPrefix = "credit") {
  const value = String(text ?? "");
  const re = /<([^<>]+)>([\s\S]*?)(?:<>|<\/?>)/g;
  const nodes = [];
  let last = 0;
  let match;

  while ((match = re.exec(value)) !== null) {
    const [full, rawToken, label] = match;
    const start = match.index;
    const end = start + full.length;

    if (start > last) nodes.push(value.slice(last, start));

    const href = resolveHref(rawToken, links);
    const labelText = isNonEmptyString(label) ? label : rawToken;

    if (href) {
      nodes.push(
        <a
          key={`${keyPrefix}-link-${start}-${end}`}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-[#8fe3ff] underline decoration-[#22BBFF]/70 underline-offset-4 transition hover:text-white hover:decoration-white"
        >
          {labelText}
        </a>,
      );
    } else {
      nodes.push(
        <span
          key={`${keyPrefix}-nolink-${start}-${end}`}
          className="font-semibold text-[#bceeff] underline decoration-[#22BBFF]/50 underline-offset-4"
          title={`Chưa tìm thấy URL cho khóa: ${rawToken}`}
        >
          {labelText}
        </span>,
      );
    }

    last = end;
  }

  if (last < value.length) nodes.push(value.slice(last));
  return nodes;
}

function renderCreditText(text, links, keyPrefix = "credit") {
  const lines = normalizeNewlines(text).split("\n");
  return lines.map((line, idx) => (
    <React.Fragment key={`${keyPrefix}-line-${idx}`}>
      {renderCreditInline(line, links, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

export default function TranslatorCredit({ text, links, className = "" }) {
  if (!isNonEmptyString(text)) return null;

  return (
    <div
      className={`rounded-xl border border-[#22BBFF]/35 bg-[#0b5f85]/20 px-4 py-3 text-sm text-[#e8f8ff] shadow-[0_0_24px_rgba(34,187,255,0.10)] ${className}`}
    >
      <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#8fe3ff]">
        [Credit bản dịch]
      </div>
      <div className="leading-relaxed text-[#f4fbff]">
        {renderCreditText(text, links, "translator-credit")}
      </div>
    </div>
  );
}
