import { useState, useEffect } from "react";

export function useMusic() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/songs");
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json = await res.json();
        const list = json?.songs ?? [];

        if (!cancelled) setSongs(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { songs, loading, error };
}
