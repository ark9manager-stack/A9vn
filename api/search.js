import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

let cached = null;

function norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchAlias(qNorm, alias) {
  const a = norm(alias);
  if (!a) return false;
  return a.includes(qNorm) || (a.length >= 3 && qNorm.includes(a));
}

function loadAliases() {
  if (cached) return cached;
  const p = path.join(process.cwd(), "data", "searchmusic.json");
  if (!fs.existsSync(p)) {
    cached = { albumAliases: {} };
    return cached;
  }
  cached = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!cached.albumAliases) cached.albumAliases = {};
  return cached;
}

export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();
  const qNorm = norm(q);
  if (!q || qNorm.length < 2) return res.status(200).json({ results: [] });

  const { albumAliases } = loadAliases();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1206),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const results = [];
    const seen = new Set();
    const pushUnique = (item) => {
      const key =
        item.type === "song"
          ? `song:${item.album_id}:${item.id_list}`
          : `album:${item.album_id}`;
      if (seen.has(key)) return;
      seen.add(key);
      results.push(item);
    };

    // 1) Search DB trực tiếp (tên gốc)
    const like = `%${q}%`;
    const [dbSongs] = await conn.execute(
      `
      SELECT 
        s.album_id,
        a.name  AS album_name,
        a.url   AS album_url,
        s.id_list,
        s.name  AS song_name,
        s.url_song,
        s.url_lyric
      FROM song s
      JOIN album a ON a.id = s.album_id
      WHERE s.name LIKE ? OR a.name LIKE ?
      ORDER BY a.id DESC, s.id_list ASC
      LIMIT 30
      `,
      [like, like]
    );

    for (const r of dbSongs) {
      pushUnique({
        type: "song",
        album_id: r.album_id,
        album_name: r.album_name,
        album_url: r.album_url,
        id_list: r.id_list,
        song_name: r.song_name,
        url_song: r.url_song,
        url_lyric: r.url_lyric,
      });
    }

    // 2) Match albumAliases -> lấy songs trong album đó
    const hitAlbumIds = [];
    for (const [albumId, aliases] of Object.entries(albumAliases || {})) {
      const arr = Array.isArray(aliases) ? aliases : [];
      if (arr.some((a) => matchAlias(qNorm, a))) {
        hitAlbumIds.push(Number(albumId));
      }
    }

    if (hitAlbumIds.length > 0) {
      const placeholders = hitAlbumIds.map(() => "?").join(",");
      const [rows] = await conn.execute(
        `
        SELECT 
          s.album_id,
          a.name  AS album_name,
          a.url   AS album_url,
          s.id_list,
          s.name  AS song_name,
          s.url_song,
          s.url_lyric
        FROM song s
        JOIN album a ON a.id = s.album_id
        WHERE s.album_id IN (${placeholders})
        ORDER BY a.id DESC, s.id_list ASC
        LIMIT 60
        `,
        hitAlbumIds
      );

      // lọc tiếp theo keyword để ra bài liên quan (giảm spam)
      for (const r of rows) {
        const nameHit = matchAlias(qNorm, r.song_name) || matchAlias(qNorm, r.album_name);
        if (nameHit) {
          pushUnique({
            type: "song",
            album_id: r.album_id,
            album_name: r.album_name,
            album_url: r.album_url,
            id_list: r.id_list,
            song_name: r.song_name,
            url_song: r.url_song,
            url_lyric: r.url_lyric,
          });
        }
      }

      // đồng thời trả về album result (để user click mở album)
      const [albums] = await conn.execute(
        `
        SELECT id AS album_id, name AS album_name, url AS album_url
        FROM album
        WHERE id IN (${placeholders})
        LIMIT 10
        `,
        hitAlbumIds
      );

      for (const a of albums) {
        pushUnique({
          type: "album",
          album_id: a.album_id,
          album_name: a.album_name,
          album_url: a.album_url,
        });
      }
    }

    res.status(200).json({ results: results.slice(0, 40) });
  } catch (e) {
    res.status(500).json({ error: "Search failed", detail: String(e?.message || e) });
  } finally {
    await conn.end();
  }
}
