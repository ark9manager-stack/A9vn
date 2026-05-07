export function normalizeMusicIdPart(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function makeMusicTrackId(albumId, idList, fallbackId) {
  const existing = normalizeMusicIdPart(fallbackId);
  if (/^[^-\s]+-.+$/.test(existing)) return existing;

  const album = normalizeMusicIdPart(albumId);
  const list = normalizeMusicIdPart(idList);
  if (album && list) return `${album}-${list}`;
  return existing || list || "";
}

export function getMusicTrackRouteId(track) {
  return makeMusicTrackId(
    track?.albumId ?? track?.album_id,
    track?.id_list ?? track?.idList,
    track?.id,
  );
}

export function sameMusicTrack(a, b) {
  if (!a || !b) return false;

  const aId = getMusicTrackRouteId(a);
  const bId = getMusicTrackRouteId(b);
  if (aId && bId && aId === bId) return true;

  const aAlbum = normalizeMusicIdPart(a.albumId ?? a.album_id);
  const bAlbum = normalizeMusicIdPart(b.albumId ?? b.album_id);
  const aList = normalizeMusicIdPart(a.id_list ?? a.idList);
  const bList = normalizeMusicIdPart(b.id_list ?? b.idList);
  if (aAlbum && bAlbum && aList && bList) {
    return aAlbum === bAlbum && aList === bList;
  }

  const aAudio = normalizeMusicIdPart(a.audio ?? a.url_song ?? a.urlSong);
  const bAudio = normalizeMusicIdPart(b.audio ?? b.url_song ?? b.urlSong);
  return !!aAudio && !!bAudio && aAudio === bAudio;
}
