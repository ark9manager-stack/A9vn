import { useEffect, useMemo, useState } from "react";
import { makeMusicTrackId } from "../utils/musicTrackIds";

function decodeSongId(songId) {
  try {
    return decodeURIComponent(String(songId ?? ""));
  } catch {
    return String(songId ?? "");
  }
}

function normalizeSong(song, index) {
  const idList = song?.id_list ?? song?.idList ?? index + 1;
  const albumId = song?.albumId ?? song?.album_id ?? null;

  return {
    id: makeMusicTrackId(albumId, idList, song?.id),
    id_list: idList,
    title: song?.title ?? song?.name ?? song?.song_name ?? "UNKNOWN TRACK",
    name: song?.name ?? song?.title ?? song?.song_name ?? "UNKNOWN TRACK",
    albumId,
    albumName: song?.albumName ?? song?.album_name ?? "",
    cover: song?.cover ?? song?.album_cover ?? "",
    audio: song?.audio ?? song?.url_song ?? song?.urlSong ?? "",
    lyrics: song?.lyrics ?? song?.url_lyric ?? song?.urlLyric ?? null,
  };
}

export function useSongDetail(songId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resolvedSongId = decodeSongId(songId);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/songs?scope=all");
        if (!response.ok) {
          throw new Error(`Fetch songs failed: ${response.status}`);
        }

        const json = await response.json();
        const nextSongs = (json?.songs ?? []).map(normalizeSong);
        if (!cancelled) setSongs(nextSongs);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "Fetch songs failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const song = useMemo(() => {
    if (!resolvedSongId) return null;

    const byStableId = songs.find((item) => String(item.id) === resolvedSongId);
    if (byStableId) return byStableId;

    const [albumId, idList] = resolvedSongId.split("-");
    if (albumId && idList) {
      const byParts = songs.find(
        (item) =>
          String(item.albumId) === String(albumId) &&
          String(item.id_list) === String(idList),
      );
      if (byParts) return byParts;
    }

    return (
      songs.find((item) => String(item.id_list) === resolvedSongId) ?? null
    );
  }, [resolvedSongId, songs]);

  const albumTracks = useMemo(() => {
    if (!song) return [];

    return songs.filter(
      (item) =>
        song.albumId != null && String(item.albumId) === String(song.albumId),
    );
  }, [song, songs]);

  return {
    song,
    songs,
    albumTracks,
    loading,
    error,
  };
}
