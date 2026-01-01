import { useEffect, useState } from "react";

export function useMusic(albumId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // chưa chọn album -> không load songs
    if (!albumId) {
      setSongs([]);
      setLoading(false);
      setError(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/songs?albumId=${encodeURIComponent(albumId)}`);
        if (!res.ok) throw new Error(`Fetch songs failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setSongs(json?.songs ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [albumId]);

  return { songs, loading, error };
}
