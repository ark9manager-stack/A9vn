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

      // ssl: { rejectUnauthorized: false },

      waitForConnections: true,
      connectionLimit: 2,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  try {
    const p = getPool();

    const [rows] = await p.query(`
      SELECT
        s.album_id,
        s.id_list,
        s.name AS song_name,
        s.url_song,
        s.url_lyric,
        a.name AS album_name,
        a.url  AS album_cover
      FROM song s
      JOIN album a ON a.id = s.album_id
      ORDER BY s.album_id, s.id_list
    `);

    const songs = rows.map((r) => ({
      id: `${r.album_id}-${r.id_list}`,
      name: r.song_name,
      desc: r.album_name,
      image: r.album_cover,
      audio: r.url_song,
      lyrics: r.url_lyric,
    }));

    res.status(200).json({ songs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB query failed", detail: String(e?.message || e) });
  }
}
