import { type Site } from "@fullstack-template/schema";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { type CSSProperties, useEffect } from "react";
import { FiExternalLink } from "react-icons/fi";
import { apiClient } from "../shared/apiClient";
import { setDocumentTitle, setSiteFavicon } from "../shared/siteConfig";

export function PublicSite() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sites"],
    queryFn: () => apiClient.sites.listPublic()
  });

  const publishedSites = data?.filter((site) => site.published) ?? [];
  const featured = publishedSites[0];

  useEffect(() => {
    if (!featured) {
      setDocumentTitle();
      setSiteFavicon();
      return;
    }

    const pageName = featured.metadata.seoTitle || featured.title;
    const description = featured.metadata.seoDescription || featured.description;
    setDocumentTitle(pageName);
    setSiteFavicon();
    setMetaTag("description", description);
    setMetaProperty("og:title", pageName);
    setMetaProperty("og:description", description);
    if (featured.metadata.ogImageUrl) {
      setMetaProperty("og:image", featured.metadata.ogImageUrl);
    }
  }, [featured]);

  if (isLoading) {
    return <div className="public-empty">Loading public site...</div>;
  }

  if (error) {
    return <div className="public-empty">API unavailable. Start the Bun server on port 3001.</div>;
  }

  return (
    <section className="public-page" style={featured ? getPublicBrandingStyle(featured) : undefined}>
      <div className="public-hero">
        <div className="public-hero-copy">
          <span className="eyebrow">React 19 + Bun + Hono + Drizzle</span>
          <h1>{featured?.title ?? "Fullstack template ready for your next launch"}</h1>
          <p>
            {featured?.description ||
              "A Bun-first TypeScript stack with a public site, admin dashboard, shared Zod schemas, Postgres persistence, uploads, and protected writes."}
          </p>
          <div className="hero-actions">
            <a href="/dashboard" className="btn btn-primary">
              Open dashboard
            </a>
            <a href="http://localhost:3001/health" className="btn btn-ghost">
              API health <FiExternalLink aria-hidden />
            </a>
          </div>
        </div>
        {featured?.heroImageUrl ? <img src={featured.heroImageUrl} alt="" className="hero-image" /> : null}
      </div>

      <div className="site-grid">
        {publishedSites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
        {publishedSites.length === 0 ? (
          <div className="public-empty">No published records yet. Create one in the dashboard.</div>
        ) : null}
      </div>
    </section>
  );
}

function getPublicBrandingStyle(site: Site): CSSProperties {
  return {
    "--app-bg": site.branding.backgroundColor,
    "--app-surface": site.branding.surfaceColor,
    "--app-surface-muted": site.branding.surfaceColor,
    "--app-text": site.branding.textColor,
    "--app-heading": site.branding.headingColor,
    "--app-muted": site.branding.textColor,
    "--app-accent": site.branding.accentColor,
    "--app-accent-strong": site.branding.accentColor,
    "--app-surface-accent": site.branding.surfaceColor,
    background: site.branding.backgroundColor,
    color: site.branding.textColor
  } as CSSProperties;
}

function setMetaTag(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.append(element);
  }
  element.content = content;
}

function setMetaProperty(property: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.append(element);
  }
  element.content = content;
}

function SiteCard({ site }: { site: Site }) {
  return (
    <motion.article className="site-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <p className="site-slug">/{site.slug}</p>
        <h2>{site.title}</h2>
        <p>{site.description}</p>
      </div>
      <div className="site-links">
        {site.links.map((link) => (
          <a key={`${site.id}-${link.href}`} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </motion.article>
  );
}
