// Real business data (same as footer/contact page). Used for JSON-LD only.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TaxiService"],
  "@id": "https://www.genzrides.com/#business",
  url: "https://www.genzrides.com/",
  logo: "https://www.genzrides.com/logo5.png",
  image: "https://www.genzrides.com/logo5.png",
  name: "GenZRides India Pvt Ltd",
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
  ],
  sameAs: ["https://www.genzrides.com/"],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
};

export default businessJsonLd;
