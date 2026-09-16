import { useEffect } from "react";
import { PRODUCTION_ORIGIN } from "../utils/StructuredData";

const SITE_NAME = "GenZRides";
const DEFAULT_IMAGE = "/logo5.png";
const DEFAULT_DESCRIPTION =
  "Book airport taxis, city rides and outstation cabs across Tamil Nadu, Puducherry & Bangalore with verified drivers, transparent fares and 24/7 support.";

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : PRODUCTION_ORIGIN;

const normalizePath = (path) => {
  if (!path) return "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.endsWith("/") && normalized.length > 1
    ? normalized.slice(0, -1)
    : normalized;
};

const upsertMeta = (attr, key, content) => {
  if (typeof document === "undefined" || !content) return;
  const selector = `${attr}="${key}"`;
  let el = document.head.querySelector(`meta[${selector}]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  if (typeof document === "undefined" || !href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const upsertJsonLd = (id, data) => {
  if (typeof document === "undefined") return;
  if (!data) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    return;
  }
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path,
  image = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd = null,
  breadcrumbs = null,
  article = null,
}) => {
  useEffect(() => {
    const origin = getOrigin();
    const pagePath = normalizePath(path || "/");
    const url = `${origin}${pagePath}`;
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} — Airport Taxi, City Rides & Outstation Cabs in Tamil Nadu`;

    document.title = fullTitle;
    document.documentElement.lang = "en-IN";

    upsertMeta("name", "description", description);
    if (keywords) upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_IN");
    upsertMeta("property", "og:image", `${origin}${image}`);
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
    upsertMeta("property", "og:image:alt", title || SITE_NAME);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:site", "@genzrides");
    upsertMeta("name", "twitter:creator", "@genzrides");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", `${origin}${image}`);
    upsertMeta("name", "twitter:image:alt", title || SITE_NAME);

    if (jsonLd) {
      upsertJsonLd("genzrides-jsonld", jsonLd);
    } else {
      upsertJsonLd("genzrides-jsonld", null);
    }

    if (breadcrumbs) {
      upsertJsonLd("genzrides-breadcrumb", breadcrumbs);
    } else {
      upsertJsonLd("genzrides-breadcrumb", null);
    }

    if (article) {
      upsertJsonLd("genzrides-article", article);
    } else {
      upsertJsonLd("genzrides-article", null);
    }
  }, [title, description, keywords, path, image, ogType, noindex, jsonLd, breadcrumbs, article]);

  return null;
};

export default SEO;
