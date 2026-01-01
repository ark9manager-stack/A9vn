const albumId = req.query.albumId;

let rows;
if (albumId) {
  [rows] = await p.query(
    `SELECT id_list, name AS song_name, url_song, url_lyric
     FROM song
     WHERE album_id = ?
     ORDER BY id_list`,
    [albumId]
  );
} else {
  [rows] = await p.query(
    `SELECT album_id, id_list, name AS song_name, url_song, url_lyric
     FROM song
     ORDER BY album_id, id_list`
  );
}

const songs = rows.map(r => ({
  id_list: r.id_list,
  name: r.song_name,
  audio: r.url_song,
  lyrics: r.url_lyric,
}));

res.status(200).json({ songs });
