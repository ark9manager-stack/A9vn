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
    const p = getPool();
    const [rows] = await p.query(`SELECT id, name, url FROM album ORDER BY id`);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ albums: rows });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "DB query failed", detail: String(e?.message || e) });
  }
}
