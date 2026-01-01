import mysql from "mysql2/promise";

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      ssl: { rejectUnauthorized: false },

      waitForConnections: true,
      connectionLimit: 2,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  try {
    const albumId = req.query?.albumId;
    if (!albumId) {
      return res.status(400).json({ error: "Missing albumId" });
    }

    const p = getPool();

    // Thử query với album_id trước, nếu fail thì fallback sang id
    let rows;
    try {
      [rows] = await p.query(
        `
        SELECT id_list, name, url_song, url_lyric
        FROM song
        WHERE album_id = ?
        ORDER BY id_list
        `,
        [albumId]
      );
    } catch (e) {
      // Fallback schema: song.id là albumId
      [rows] = await p.query(
        `
        SELECT id_list, name, url_song, url_lyric
        FROM song
        WHERE id = ?
        ORDER BY id_list
        `,
        [albumId]
      );
    }

    const songs = rows.map((r) => ({
      id_list: r.id_list,
      name: r.name,
      audio: r.url_song,
      lyrics: r.url_lyric ?? null,
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ songs });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "DB query failed", detail: String(e?.message || e) });
  }
}
