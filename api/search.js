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
  // match kiểu contains (đủ dùng cho alias)
  return a.includes(qNorm) || (a.length >= 3 && qNorm.includes(a));
}

function loadAliases() {
  if (cached) return cached;

  // giữ đúng cấu trúc bạn đang dùng: /data/searchmusic.json
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

  if (!q || qNorm.length < 2) {
    return res.status(200).json({ results: [] });
  }

  const { albumAliases } = loadAliases();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1206),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const albumMap = new Map(); // album_id -> item

    const pushAlbum = (row) => {
      const id = row?.album_id ?? row?.id;
      if (id == null) return;
      const key = String(id);
      if (albumMap.has(key)) return;

      albumMap.set(key, {
        type: "album",
        album_id: id,
        album_name: row.album_name ?? row.name ?? "",
        album_url: row.album_url ?? row.url ?? "",
      });
    };

    const like = `%${q}%`;

    // 1) Match tên album (DB)
    const [albumsByName] = await conn.execute(
      `
      SELECT id AS album_id, name AS album_name, url AS album_url
      FROM album
      WHERE name LIKE ?
      ORDER BY id DESC
      LIMIT 40
      `,
      [like]
    );
    for (const a of albumsByName) pushAlbum(a);

    // 2) Match tên bài hát (DB) -> trả về album chứa bài đó
    const [albumsBySong] = await conn.execute(
      `
      SELECT DISTINCT a.id AS album_id, a.name AS album_name, a.url AS album_url
      FROM song s
      JOIN album a ON a.id = s.album_id
      WHERE s.name LIKE ?
      ORDER BY a.id DESC
      LIMIT 40
      `,
      [like]
    );
    for (const a of albumsBySong) pushAlbum(a);

    // 3) Match alias trong searchmusic.json -> trả về album
    const hitAlbumIds = [];
    for (const [albumId, aliases] of Object.entries(albumAliases || {})) {
      const arr = Array.isArray(aliases) ? aliases : [];
      if (arr.some((al) => matchAlias(qNorm, al))) {
        const n = Number(albumId);
        if (!Number.isNaN(n)) hitAlbumIds.push(n);
      }
    }

    if (hitAlbumIds.length > 0) {
      // unique + sort desc + cap để tránh IN quá dài
      const uniq = [...new Set(hitAlbumIds)].sort((a, b) => b - a).slice(0, 40);
      const placeholders = uniq.map(() => "?").join(",");

      const [albumsByAlias] = await conn.execute(
        `
        SELECT id AS album_id, name AS album_name, url AS album_url
        FROM album
        WHERE id IN (${placeholders})
        ORDER BY id DESC
        LIMIT 40
        `,
        uniq
      );
      for (const a of albumsByAlias) pushAlbum(a);
    }

    return res.status(200).json({ results: Array.from(albumMap.values()) });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Search failed", detail: String(e?.message || e) });
  } finally {
    await conn.end();
  }
}
