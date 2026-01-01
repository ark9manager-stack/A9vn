import { useEffect, useState } from "react";

export function useAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/albums");
        if (!res.ok) throw new Error(`Fetch albums failed: ${res.status}`);

        const json = await res.json();
        if (!cancelled) setAlbums(json?.albums ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { albums, loading, error };
}
