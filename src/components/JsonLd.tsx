import { siteConfig } from "@/config/site";

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: "Tarek Okasha",
        url: siteConfig.url,
        sameAs: [siteConfig.linkedin],
        jobTitle: "Independent Software Engineer",
        knowsAbout: ["AI Systems", "LLM", "Automations", "Custom Software", "Next.js", "TypeScript"],
        address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
        email: siteConfig.email,
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: "Tarek Okasha",
        description: siteConfig.description,
        author: { "@id": `${siteConfig.url}/#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
