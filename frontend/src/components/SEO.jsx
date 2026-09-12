import { useEffect } from "react";

const SITE_NAME = "GenZRides";
const DEFAULT_IMAGE = "/logo5.png";
const DEFAULT_DESCRIPTION =
  "Book airport taxis, city rides and outstation cabs across Tamil Nadu with verified drivers, transparent fares and 24/7 support.";

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

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
  const existing = document.getElementById(id);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

// Central SEO manager (no extra dependency). Every public page renders
// this with its own copy; private pages render <SEO noindex />.
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path,
  image = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd = null,
}) => {
  useEffect(() => {
    const origin = getOrigin();
    const pagePath =
      path || (typeof window !== "undefined" ? window.location.pathname : "/");
    const url = `${origin}${pagePath}`;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Airport Taxi, City Rides & Outstation Cabs in Tamil Nadu`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    if (keywords) upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_IN");
    upsertMeta("property", "og:image", `${origin}${image}`);
    upsertMeta("property", "og:image:width", "512");
    upsertMeta("property", "og:image:height", "512");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", `${origin}${image}`);

    upsertJsonLd("genzrides-jsonld", jsonLd);
    // Clean stale secondary json-lds when not provided
    if (!jsonLd || !JSON.stringify(jsonLd).includes("FAQPage")) upsertJsonLd("genzrides-faq", null);
    if (!jsonLd || !JSON.stringify(jsonLd).includes("BreadcrumbList")) upsertJsonLd("genzrides-breadcrumb", null);
  }, [title, description, keywords, path, image, ogType, noindex, jsonLd]);

  return null;
};

export default SEO;
