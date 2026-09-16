// Reusable Schema.org JSON-LD builders. Every public page composes these
// and passes the result to <SEO jsonLd={...} />.

const SITE_URL = "https://www.genzrides.com";
const SITE_NAME = "GenZRides";
const LOGO = "/logo5.png";

// Single source of truth for the canonical production origin.
// SEO.jsx and businessJsonLd.js import this — never hardcode preview URLs.
export const PRODUCTION_ORIGIN = SITE_URL;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${LOGO}`,
  description: "Book airport taxis, city rides and outstation cabs across Tamil Nadu, Puducherry & Bangalore.",
  telephone: "+919342830199",
  email: "support@genzrides.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam",
    addressLocality: "Trichy",
    addressRegion: "Tamil Nadu",
    postalCode: "621005",
    addressCountry: "IN",
  },
  sameAs: [SITE_URL],
  areaServed: [
    { "@type": "City", name: "Chennai" },
    { "@type": "City", name: "Bangalore" },
    { "@type": "City", name: "Coimbatore" },
    { "@type": "City", name: "Trichy" },
    { "@type": "City", name: "Madurai" },
    { "@type": "City", name: "Salem" },
    { "@type": "City", name: "Puducherry" },
    { "@type": "City", name: "Kerala" },
  ],
};

export const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: "Book airport taxis, city rides and outstation cabs across Tamil Nadu, Puducherry & Bangalore.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TaxiService"],
  "@id": `${SITE_URL}/#business`,
  url: SITE_URL,
  logo: `${SITE_URL}${LOGO}`,
  image: `${SITE_URL}${LOGO}`,
  name: SITE_NAME,
  telephone: "+919342830199",
  email: "support@genzrides.com",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1/86 Ambalakara Street, Nehru Play Ground, Vengaimandalam",
    addressLocality: "Trichy",
    addressRegion: "Tamil Nadu",
    postalCode: "621005",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.7905,
    longitude: 78.7047,
  },
  areaServed: [
    { "@type": "City", name: "Chennai" },
    { "@type": "City", name: "Bangalore" },
    { "@type": "City", name: "Coimbatore" },
    { "@type": "City", name: "Trichy" },
    { "@type": "City", name: "Madurai" },
    { "@type": "City", name: "Salem" },
    { "@type": "City", name: "Puducherry" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
};

export const breadcrumbJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: item.url || `${SITE_URL}${item.path}`,
  })),
});

export const serviceJsonLd = (name, description, serviceType, area, slug) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/${slug}/#service`,
  name,
  description,
  serviceType,
  provider: {
    "@type": "LocalBusiness",
    name: SITE_NAME,
  },
  areaServed: area ? { "@type": "GeoCircle", name: area } : { "@type": "State", name: "Tamil Nadu" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceObjectType: { "@type": "Service", name: "Cab Booking" },
    url: `${SITE_URL}/booking`,
  },
});

export const faqJsonLd = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
});

export const siteNavigationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: SITE_NAME,
  url: SITE_URL,
  sameAs: [SITE_URL],
  description: "Book airport taxis, city rides and outstation cabs.",
});

export const makeHomeJsonLd = () => ({
  ...localBusinessJsonLd,
  "@type": ["LocalBusiness", "TaxiService", "Organization"],
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
});
