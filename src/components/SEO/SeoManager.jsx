import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeoMetaForPath, SITE_NAME } from "../../config/seoConfig";

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

export default function SeoManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    const meta = getSeoMetaForPath(location.pathname, { siteUrl });

    document.documentElement.lang = "vi";
    document.title = meta.title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: meta.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: meta.noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: meta.type === "WebSite" ? "website" : "article",
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: meta.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: meta.canonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: meta.image,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: meta.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: meta.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: meta.image,
    });
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: meta.canonical,
    });

    upsertJsonLd("a9vn-jsonld", {
      "@context": "https://schema.org",
      "@type": meta.type,
      name: meta.title,
      description: meta.description,
      url: meta.canonical,
      image: meta.image,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: getSeoMetaForPath("/", { siteUrl }).canonical,
      },
    });
  }, [location.pathname]);

  return null;
}
