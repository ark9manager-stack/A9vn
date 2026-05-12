export const SITE_NAME = "A9vn";
export const DEFAULT_SITE_URL = "https://a9vn.vercel.app";
export const DEFAULT_IMAGE = "/A9vn-logo.webp";

const defaultDescription =
  "A9vn là cơ sở dữ liệu Arknights tiếng Việt: operators, kỹ năng, module, lời thoại, materials, bosses và nhạc Monster Siren.";

export const staticSeoRoutes = {
  "/": {
    title: "A9vn - Arknights Database tiếng Việt",
    description: defaultDescription,
    type: "WebSite",
  },
  "/operator": {
    title: "Operators - A9vn",
    description:
      "Tra cứu hồ sơ, chỉ số, kỹ năng, module, skin và lời thoại operators Arknights.",
  },
  "/music": {
    title: "Music - A9vn",
    description:
      "Kho nhạc Monster Siren Records và BGM Arknights theo album, sự kiện và track.",
  },
  "/guide-story": {
    title: "Guide & Story - A9vn",
    description:
      "Tổng hợp guide và nội dung story Arknights được trình bày cho cộng đồng Việt Nam.",
  },
  "/database": {
    title: "Database - A9vn",
    description:
      "Trung tâm dữ liệu Arknights: materials, bosses, enemies và các dữ liệu tra cứu quan trọng.",
  },
  "/database/materials": {
    title: "Materials - A9vn",
    description:
      "Tra cứu nguyên liệu Arknights, thông tin nâng cấp và dữ liệu farming materials.",
  },
  "/database/planner": {
    title: "Material Planner - A9vn",
    description:
      "Công cụ lập kế hoạch nguyên liệu nâng cấp operators và kỹ năng trong Arknights.",
  },
  "/database/bosses": {
    title: "Bosses - A9vn",
    description:
      "Bách khoa boss Arknights với mô tả, loại sát thương và cơ chế kỹ năng.",
  },
};

function trimTrailingSlash(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export function normalizePathname(pathname = "/") {
  const clean = trimTrailingSlash(pathname.split("?")[0].split("#")[0] || "/");
  return clean === "/" ? "/" : clean.replace(/^\/Operator\b/, "/operator").replace(/^\/Music\b/, "/music");
}

export function absoluteUrl(pathname = "/", siteUrl = DEFAULT_SITE_URL) {
  const base = String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const path = normalizePathname(pathname);
  return `${base}${path === "/" ? "" : path}`;
}

function readableSlug(value) {
  return decodeURIComponent(String(value || ""))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSeoMetaForPath(pathname = "/", options = {}) {
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL;
  const path = normalizePathname(pathname);
  const staticMeta = staticSeoRoutes[path];

  let meta =
    staticMeta ||
    {
      title: "A9vn",
      description: defaultDescription,
    };

  const operatorMatch = path.match(/^\/operator\/([^/]+)$/);
  if (operatorMatch) {
    const name = readableSlug(operatorMatch[1]);
    meta = {
      title: `${name || "Operator"} - Operator - A9vn`,
      description: `Tra cứu thông tin operator ${name}: chỉ số, kỹ năng, module, skin và lời thoại trong Arknights.`,
    };
  }

  const musicMatch = path.match(/^\/music\/([^/]+)$/);
  if (musicMatch) {
    const name = readableSlug(musicMatch[1]);
    meta = {
      title: `${name || "Track"} - Music - A9vn`,
      description: `Nghe và tra cứu track ${name} trong kho nhạc Monster Siren Records và BGM Arknights.`,
    };
  }

  const materialMatch = path.match(/^\/database\/materials\/([^/]+)$/);
  if (materialMatch) {
    const name = readableSlug(materialMatch[1]);
    meta = {
      title: `${name || "Material"} - Materials - A9vn`,
      description: `Tra cứu nguyên liệu ${name}, cách dùng và dữ liệu liên quan trong Arknights.`,
    };
  }

  const bossMatch = path.match(/^\/database\/bosses\/([^/]+)$/);
  if (bossMatch) {
    const name = readableSlug(bossMatch[1]);
    meta = {
      title: `${name || "Boss"} - Bosses - A9vn`,
      description: `Tra cứu boss ${name}: mô tả, loại sát thương và cơ chế kỹ năng trong Arknights.`,
    };
  }

  const image = meta.image || DEFAULT_IMAGE;
  return {
    siteName: SITE_NAME,
    title: meta.title,
    description: meta.description || defaultDescription,
    canonical: absoluteUrl(path, siteUrl),
    path,
    image: image.startsWith("http") ? image : absoluteUrl(image, siteUrl),
    type: meta.type || "WebPage",
    noindex: Boolean(meta.noindex),
  };
}
