import mysql from "mysql2/promise";

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 1206),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      //ssl: { rejectUnauthorized: false },

      waitForConnections: true,
      connectionLimit: 2,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  try {
    const albumId = req.query?.albumId;
    const scope = req.query?.scope;
    if (!albumId && scope !== "all") {
      return res.status(400).json({ error: "Missing albumId" });
    }

    const p = getPool();

    if (scope === "all") {
      let rows;
      try {
        [rows] = await p.query(`
          SELECT
            s.album_id AS album_id,
            a.name AS album_name,
            a.url AS album_cover,
            s.id_list,
            s.name,
            s.url_song,
            s.url_lyric
          FROM song s
          LEFT JOIN album a ON a.id = s.album_id
          ORDER BY s.album_id, s.id_list
        `);
      } catch {
        [rows] = await p.query(`
          SELECT
            s.id AS album_id,
            a.name AS album_name,
            a.url AS album_cover,
            s.id_list,
            s.name,
            s.url_song,
            s.url_lyric
          FROM song s
          LEFT JOIN album a ON a.id = s.id
          ORDER BY s.id, s.id_list
        `);
      }

      const songs = rows.map((r) => ({
        id: `${r.album_id}-${r.id_list}`,
        albumId: r.album_id,
        albumName: r.album_name ?? "",
        cover: r.album_cover ?? "",
        id_list: r.id_list,
        name: r.name,
        audio: r.url_song,
        lyrics: r.url_lyric ?? null,
      }));

      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json({ songs });
    }

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
    } catch {
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
