import { useEffect, useState } from "react";

function parseLrc(text) {
  const lines = text.split(/\r?\n/);
  let offset = 0; // ms
  const entries = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // metadata: [ar:..], [ti:..], [offset:123]
    const meta = line.match(/^\[(ar|ti|al|by|offset):(.+)\]$/i);
    if (meta) {
      if (meta[1].toLowerCase() === "offset") {
        const v = Number(meta[2]);
        if (!Number.isNaN(v)) offset = v;
      }
      continue;
    }

    // timestamps: [mm:ss.xx] or [mm:ss.xxx] (có thể nhiều timestamp trên 1 dòng)
    const timeMatches = [
      ...line.matchAll(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g),
    ];
    if (timeMatches.length === 0) continue;

    const content = line
      .replace(/\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/g, "")
      .trim();
    // nếu dòng chỉ có timestamp mà không có chữ thì bỏ
    if (!content) continue;

    for (const m of timeMatches) {
      const mm = Number(m[1]);
      const ss = Number(m[2]);
      const frac = m[3] ? Number(m[3].padEnd(3, "0")) : 0;
      const t = mm * 60 + ss + frac / 1000 + offset / 1000;
      entries.push({ time: Math.max(0, t), text: content });
    }
  }

  entries.sort((a, b) => a.time - b.time);
  return entries;
}

export function useLyrics(url) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!url) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Không thể tải lyrics từ URL.");

        const text = await res.text();
        const parsed = parseLrc(text);

        if (!cancelled) setEntries(parsed);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { entries, loading, error };
}
