import { SiteListSchema, type Site } from "@fullstack-template/schema";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import { apiJson } from "../shared/api";

export function PublicSite() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => SiteListSchema.parse(await apiJson("/api/sites"))
  });

  const publishedSites = data?.filter((site) => site.published) ?? [];
  const featured = publishedSites[0];

  if (isLoading) {
    return <div className="public-empty">Loading public site...</div>;
  }

  if (error) {
    return <div className="public-empty">API unavailable. Start the Bun server on port 3001.</div>;
  }

  return (
    <section className="public-page">
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
