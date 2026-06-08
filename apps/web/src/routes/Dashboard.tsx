import { SiteDraftSchema, type Site, type SiteDraft, type SiteDraftInput } from "@fullstack-template/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Transition } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  FiChevronDown,
  FiExternalLink,
  FiFileText,
  FiHelpCircle,
  FiImage,
  FiLink,
  FiLock,
  FiLogOut,
  FiMenu,
  FiMonitor,
  FiMoon,
  FiPlus,
  FiSave,
  FiSliders,
  FiSettings,
  FiSun,
  FiTrash2,
  FiX
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/apiClient";
import { useDraftStore } from "../state/draftStore";
import { type ThemeMode, useThemeMode } from "../state/themeStore";

const defaultDraft: SiteDraftInput = {
  slug: "home",
  title: "A sharp new site",
  description: "Edit this content in the dashboard and publish it to the public page.",
  heroImageUrl: "",
  metadata: {
    tabTitle: "",
    seoTitle: "",
    seoDescription: "",
    faviconUrl: "",
    ogImageUrl: ""
  },
  branding: {
    backgroundColor: "#f7f7f2",
    surfaceColor: "#ffffff",
    textColor: "#18212f",
    headingColor: "#101828",
    accentColor: "#006d77"
  },
  links: [{ label: "Contact", href: "https://example.com", kind: "primary" }],
  published: true
};

type DashboardTabId = "start" | "overview" | "content" | "metadata" | "branding" | "links" | "records" | "uploads" | "help";
type DashboardGroupId = "site" | "library" | "support";

type DashboardTab = {
  id: DashboardTabId;
  label: string;
  icon: typeof FiFileText;
};

type DashboardGroup = {
  id: DashboardGroupId;
  label: string;
  tabs: DashboardTab[];
};

const dashboardGroups: DashboardGroup[] = [
  {
    id: "site",
    label: "Site workspace",
    tabs: [
      { id: "start", label: "Start Guide", icon: FiHelpCircle },
      { id: "overview", label: "Overview", icon: FiSettings },
      { id: "content", label: "Content", icon: FiFileText },
      { id: "metadata", label: "Metadata", icon: FiSliders },
      { id: "branding", label: "Branding", icon: FiImage },
      { id: "links", label: "Links", icon: FiLink }
    ]
  },
  {
    id: "library",
    label: "Library",
    tabs: [
      { id: "records", label: "Records", icon: FiFileText },
      { id: "uploads", label: "Uploads", icon: FiImage }
    ]
  },
  {
    id: "support",
    label: "Support",
    tabs: [{ id: "help", label: "Help", icon: FiHelpCircle }]
  }
];

const dashboardTabs = dashboardGroups.flatMap((group) => group.tabs);
const defaultDashboardGroup = dashboardGroups[0]!;
const defaultDashboardTab = dashboardTabs[0]!;
const navEase = [0.22, 1, 0.36, 1] as const;
const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof FiSun }> = [
  { mode: "light", label: "Light theme", icon: FiSun },
  { mode: "dark", label: "Dark theme", icon: FiMoon },
  { mode: "system", label: "Use system theme", icon: FiMonitor }
];

export function Dashboard() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const setAdminKey = useDraftStore((state) => state.setAdminKey);
  const clearAdminKey = useDraftStore((state) => state.clearAdminKey);
  const cachedDraft = useDraftStore((state) => state.draft);
  const setDraft = useDraftStore((state) => state.setDraft);
  const prefersReducedMotion = useReducedMotion();
  const [activeTabId, setActiveTabId] = useState<DashboardTabId>("start");
  const [openGroupId, setOpenGroupId] = useState<DashboardGroupId>("site");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const session = useQuery({
    queryKey: ["admin-session", adminKey],
    queryFn: () => apiClient.admin.verifySession(adminKey),
    enabled: adminKey.length > 0,
    retry: false
  });

  const form = useForm<SiteDraftInput, unknown, SiteDraft>({
    resolver: zodResolver(SiteDraftSchema),
    defaultValues: cachedDraft ?? defaultDraft
  });

  const links = useFieldArray({
    control: form.control,
    name: "links"
  });

  const activeTab = useMemo(() => dashboardTabs.find((tab) => tab.id === activeTabId) ?? defaultDashboardTab, [activeTabId]);
  const activeGroup = useMemo(
    () => dashboardGroups.find((group) => group.tabs.some((tab) => tab.id === activeTab.id)) ?? defaultDashboardGroup,
    [activeTab.id]
  );

  const navLayoutTransition: Transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: navEase };
  const navPanelTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        height: { duration: 0.28, ease: navEase },
        opacity: { duration: 0.18, ease: "easeOut" },
        y: { duration: 0.2, ease: navEase }
      };

  useEffect(() => {
    setOpenGroupId(activeGroup.id);
  }, [activeGroup.id]);

  useEffect(() => {
    document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setDraft(value as SiteDraftInput);
      setSaveMessage("");
    });
    return () => subscription.unsubscribe();
  }, [form, setDraft]);

  const sites = useQuery({
    queryKey: ["admin-sites"],
    queryFn: () => apiClient.admin.listSites(adminKey),
    enabled: session.isSuccess
  });

  const saveSite = useMutation({
    mutationFn: (draft: SiteDraft) => apiClient.admin.saveSite(adminKey, draft),
    onSuccess: (site) => {
      setSaveMessage(`Saved ${site.title}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin-sites"] });
      void queryClient.invalidateQueries({ queryKey: ["sites"] });
    }
  });

  const uploadAsset = useMutation({
    mutationFn: (file: File) => apiClient.uploads.create(adminKey, file),
    onSuccess: (upload) => {
      setUploadMessage(`Uploaded ${upload.filename}.`);
      if (upload.thumbnailUrl || upload.url) {
        form.setValue("heroImageUrl", upload.thumbnailUrl || upload.url, { shouldDirty: true });
      }
    }
  });

  const selectedSite = form.watch();
  const totalLinks = selectedSite.links?.length ?? 0;
  const publishedCount = sites.data?.filter((site) => site.published).length ?? 0;

  if (!session.isSuccess) {
    return <DashboardAccessGate isChecking={session.isLoading} isInvalid={session.isError} onUnlock={(code) => setAdminKey(code)} />;
  }

  function selectTab(tabId: DashboardTabId, shouldCloseMobileNav = false) {
    setActiveTabId(tabId);
    if (shouldCloseMobileNav) {
      setIsMobileNavOpen(false);
    }
  }

  function resetToDefaults() {
    form.reset(defaultDraft);
    setSaveMessage("");
  }

  function loadSite(site: Site) {
    form.reset({
      slug: site.slug,
      title: site.title,
      description: site.description,
      heroImageUrl: site.heroImageUrl,
      metadata: site.metadata,
      branding: site.branding,
      links: site.links,
      published: site.published
    });
    setActiveTabId("content");
    setSaveMessage("");
  }

  function renderDashboardNav(shouldCloseMobileNav = false) {
    return (
      <nav className="dashboard-nav" aria-label="Dashboard sections">
        <LayoutGroup>
          {dashboardGroups.map((group) => {
            const isOpen = openGroupId === group.id;
            const isActiveGroup = group.id === activeGroup.id;

            return (
              <motion.section
                className={["dashboard-nav__group", isOpen ? "dashboard-nav__group--open" : "", isActiveGroup ? "dashboard-nav__group--active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                key={group.id}
                layout="position"
                transition={navLayoutTransition}
              >
                <button
                  aria-expanded={isOpen}
                  className="dashboard-nav__group-trigger"
                  type="button"
                  onClick={() => setOpenGroupId((current) => (current === group.id ? current : group.id))}
                >
                  <span>{group.label}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} aria-hidden className="dashboard-nav__group-icon" transition={navLayoutTransition}>
                    <FiChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      className="dashboard-nav__group-content"
                      exit={{ height: 0, opacity: 0, y: -4 }}
                      initial={{ height: 0, opacity: 0, y: -4 }}
                      transition={navPanelTransition}
                    >
                      <div className="dashboard-nav__group-content-inner">
                        {group.tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              className={tab.id === activeTab.id ? "dashboard-nav__link dashboard-nav__link--active" : "dashboard-nav__link"}
                              key={tab.id}
                              type="button"
                              onClick={() => selectTab(tab.id, shouldCloseMobileNav)}
                            >
                              <Icon aria-hidden />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </LayoutGroup>
      </nav>
    );
  }

  return (
    <section className="dashboard-shell">
      <div className="dashboard-mobile-bar">
        <div>
          <p className="dashboard-eyebrow">J Roybal Dev</p>
          <h1>Dashboard</h1>
        </div>
        <button className="dashboard-mobile-nav-button" type="button" onClick={() => setIsMobileNavOpen(true)}>
          <FiMenu aria-hidden />
          <span>Menu</span>
        </button>
      </div>

      <aside className="dashboard-sidebar dashboard-sidebar--desktop" aria-label="Dashboard sections">
        <div>
          <div className="dashboard-brand-lockup">
            <span aria-hidden>JR</span>
            <div>
              <p className="dashboard-eyebrow">J Roybal Dev</p>
              <h1>Dashboard</h1>
            </div>
          </div>
        </div>
        {renderDashboardNav()}
        <button className="dashboard-sidebar__clear" type="button" onClick={clearAdminKey}>
          <FiLogOut aria-hidden /> Lock dashboard
        </button>
      </aside>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <motion.div animate={{ opacity: 1 }} className="dashboard-mobile-nav" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
            <button aria-label="Close dashboard menu" className="dashboard-mobile-nav__backdrop" type="button" onClick={() => setIsMobileNavOpen(false)} />
            <motion.aside
              animate={{ y: 0 }}
              aria-label="Dashboard sections"
              aria-modal="true"
              className="dashboard-mobile-nav__sheet"
              exit={{ y: "100%" }}
              initial={{ y: "100%" }}
              role="dialog"
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: navEase }}
            >
              <div className="dashboard-mobile-nav__handle" aria-hidden />
              <div className="dashboard-mobile-nav__header">
                <div>
                  <p className="dashboard-eyebrow">J Roybal Dev</p>
                  <h2>Dashboard</h2>
                </div>
                <button aria-label="Close dashboard menu" className="dashboard-mobile-nav__close" type="button" onClick={() => setIsMobileNavOpen(false)}>
                  <FiX aria-hidden />
                </button>
              </div>
              {renderDashboardNav(true)}
              <button className="dashboard-sidebar__clear" type="button" onClick={clearAdminKey}>
                <FiLogOut aria-hidden /> Lock dashboard
              </button>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="dashboard-workspace" aria-labelledby="dashboard-section-title">
        <div className="dashboard-workspace__header">
          <div>
            <p className="dashboard-eyebrow">Editing</p>
            <h2 id="dashboard-section-title">{activeTab.label}</h2>
          </div>
          <div className="dashboard-workspace__action-stack">
            <DashboardThemeSlider />
            <div className="dashboard-workspace__actions">
              <Link className="dashboard-action dashboard-action--link" to="/" target="_blank" rel="noreferrer">
                <FiExternalLink aria-hidden /> View site
              </Link>
              <button className="dashboard-action" type="button" onClick={resetToDefaults}>
                Reset
              </button>
              <button className="dashboard-action dashboard-action--primary" type="button" disabled={saveSite.isPending} onClick={form.handleSubmit((draft) => saveSite.mutate(draft))}>
                <FiSave aria-hidden /> {saveSite.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-metrics" aria-label="Dashboard summary">
          <SummaryMetric label="Current slug" value={`/${selectedSite.slug || "new"}`} />
          <SummaryMetric label="Status" value={selectedSite.published ? "Published" : "Draft"} />
          <SummaryMetric label="Links" value={String(totalLinks)} />
          <SummaryMetric label="Published records" value={String(publishedCount)} />
        </div>

        <div className="dashboard-workspace__panel">
          {activeTab.id === "overview" ? <OverviewPanel selectedSite={selectedSite} saveMessage={saveMessage} saveError={saveSite.error?.message} /> : null}
          {activeTab.id === "start" ? <StartGuidePanel /> : null}
          {activeTab.id === "content" ? <ContentPanel form={form} /> : null}
          {activeTab.id === "metadata" ? <MetadataPanel form={form} /> : null}
          {activeTab.id === "branding" ? <BrandingPanel form={form} /> : null}
          {activeTab.id === "links" ? <LinksPanel form={form} links={links} /> : null}
          {activeTab.id === "records" ? <RecordsPanel isLoading={sites.isLoading} sites={sites.data ?? []} onSelect={loadSite} /> : null}
          {activeTab.id === "uploads" ? (
            <UploadsPanel
              isPending={uploadAsset.isPending}
              message={uploadMessage}
              error={uploadAsset.error?.message}
              onUpload={(file) => uploadAsset.mutate(file)}
            />
          ) : null}
          {activeTab.id === "help" ? <HelpPanel /> : null}
        </div>
      </section>
    </section>
  );
}

function DashboardThemeSlider() {
  const { mode, resolvedTheme, setMode } = useThemeMode();

  return (
    <div className="dashboard-theme-slider" aria-label={`Theme selector, currently ${resolvedTheme}`}>
      {themeOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            aria-label={option.label}
            aria-pressed={mode === option.mode}
            className={mode === option.mode ? "active" : ""}
            key={option.mode}
            onClick={() => setMode(option.mode)}
            title={option.label}
            type="button"
          >
            <Icon aria-hidden />
            <span>{option.mode}</span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OverviewPanel({ selectedSite, saveMessage, saveError }: { selectedSite: SiteDraftInput; saveMessage: string; saveError?: string }) {
  return (
    <div className="dashboard-overview">
      <div>
        <p className="dashboard-eyebrow">Current draft</p>
        <h3>{selectedSite.title || "Untitled record"}</h3>
        <p>{selectedSite.description || "Add a description in the Content tab."}</p>
      </div>
      <div className="dashboard-preview">
        <div className="dashboard-preview__media">{selectedSite.heroImageUrl ? <img src={selectedSite.heroImageUrl} alt="" /> : <FiImage aria-hidden />}</div>
        <div>
          <span>{selectedSite.published ? "Published" : "Draft"}</span>
          <strong>/{selectedSite.slug || "new"}</strong>
        </div>
      </div>
      {saveMessage ? <p className="dashboard-message dashboard-message--success">{saveMessage}</p> : null}
      {saveError ? <p className="dashboard-message dashboard-message--error">{saveError}</p> : null}
    </div>
  );
}

function StartGuidePanel() {
  return (
    <div className="start-guide-panel">
      <div>
        <p className="dashboard-eyebrow">Start here</p>
        <h3>Launch checklist</h3>
        <p>Work through these tabs from top to bottom to publish a clean first site record.</p>
      </div>
      <ol>
        <li>
          <strong>Content:</strong> Set the slug, title, hero image, description, and published status.
        </li>
        <li>
          <strong>Metadata:</strong> Add search title, search description, and Open Graph image.
        </li>
        <li>
          <strong>Branding:</strong> Set the public site colors, browser tab title, and favicon.
        </li>
        <li>
          <strong>Links:</strong> Add calls to action and social links.
        </li>
        <li>
          <strong>Uploads:</strong> Upload images and use thumbnail URLs for small previews.
        </li>
      </ol>
    </div>
  );
}

function ContentPanel({ form }: { form: ReturnType<typeof useForm<SiteDraftInput, unknown, SiteDraft>> }) {
  return (
    <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
      <div className="field-row">
        <label>
          <span>Slug</span>
          <input {...form.register("slug")} />
        </label>
        <label className="toggle-field">
          <span>Published</span>
          <input type="checkbox" className="toggle" {...form.register("published")} />
        </label>
      </div>
      <label>
        <span>Title</span>
        <input {...form.register("title")} />
      </label>
      <label>
        <span>Description</span>
        <textarea rows={6} {...form.register("description")} />
      </label>
      <label>
        <span>Hero image URL</span>
        <input {...form.register("heroImageUrl")} placeholder="https://..." />
      </label>
      <FormErrors errors={form.formState.errors} />
    </form>
  );
}

function MetadataPanel({ form }: { form: ReturnType<typeof useForm<SiteDraftInput, unknown, SiteDraft>> }) {
  return (
    <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
      <div>
        <p className="dashboard-eyebrow">Search and sharing</p>
        <h3>Metadata</h3>
      </div>
      <label>
        <span>SEO title</span>
        <input {...form.register("metadata.seoTitle")} placeholder="Optional title for search results" />
      </label>
      <label>
        <span>SEO description</span>
        <textarea rows={4} {...form.register("metadata.seoDescription")} placeholder="Optional description for search results and link previews" />
      </label>
      <label>
        <span>Open Graph image URL</span>
        <input {...form.register("metadata.ogImageUrl")} placeholder="https://..." />
      </label>
      <FormErrors errors={form.formState.errors} />
    </form>
  );
}

function BrandingPanel({ form }: { form: ReturnType<typeof useForm<SiteDraftInput, unknown, SiteDraft>> }) {
  const fields = [
    ["backgroundColor", "Background"],
    ["surfaceColor", "Surface"],
    ["textColor", "Body text"],
    ["headingColor", "Headings"],
    ["accentColor", "Accent"]
  ] as const;

  return (
    <div className="dashboard-form">
      <div>
        <p className="dashboard-eyebrow">Public site theme</p>
        <h3>Branding</h3>
      </div>
      <div className="branding-browser-fields">
        <label>
          <span>Browser tab title</span>
          <input {...form.register("metadata.tabTitle")} placeholder="Brand or campaign name" />
        </label>
        <label>
          <span>Favicon URL</span>
          <input {...form.register("metadata.faviconUrl")} placeholder="https://..." />
        </label>
      </div>
      <div className="color-grid">
        {fields.map(([field, label]) => (
          <label className="color-field" key={field}>
            <span>{label}</span>
            <div>
              <input type="color" {...form.register(`branding.${field}`)} />
              <input {...form.register(`branding.${field}`)} />
            </div>
          </label>
        ))}
      </div>
      <p className="dashboard-note">These colors apply to the public site record after saving. The private dashboard keeps its own company palette.</p>
      <FormErrors errors={form.formState.errors} />
    </div>
  );
}

function LinksPanel({
  form,
  links
}: {
  form: ReturnType<typeof useForm<SiteDraftInput, unknown, SiteDraft>>;
  links: ReturnType<typeof useFieldArray<SiteDraftInput, "links">>;
}) {
  return (
    <div className="dashboard-form">
      <div className="links-header">
        <div>
          <p className="dashboard-eyebrow">Calls to action</p>
          <h3>Links</h3>
        </div>
        <button type="button" className="icon-button" onClick={() => links.append({ label: "", href: "https://", kind: "secondary" })} title="Add link">
          <FiPlus aria-hidden />
        </button>
      </div>
      {links.fields.map((field, index) => (
        <div className="link-editor" key={field.id}>
          <input {...form.register(`links.${index}.label`)} placeholder="Label" />
          <input {...form.register(`links.${index}.href`)} placeholder="https://..." />
          <select {...form.register(`links.${index}.kind`)}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="social">Social</option>
          </select>
          <button type="button" className="icon-button danger" onClick={() => links.remove(index)} title="Remove link">
            <FiTrash2 aria-hidden />
          </button>
        </div>
      ))}
      <FormErrors errors={form.formState.errors} />
    </div>
  );
}

function RecordsPanel({ isLoading, sites, onSelect }: { isLoading: boolean; sites: Site[]; onSelect: (site: Site) => void }) {
  return (
    <div className="records-grid">
      {isLoading ? <p>Loading records...</p> : null}
      {sites.map((site) => (
        <button className="record-row" key={site.id} type="button" onClick={() => onSelect(site)}>
          <span>{site.title}</span>
          <small>
            /{site.slug} - {site.published ? "Published" : "Draft"}
          </small>
        </button>
      ))}
      {!isLoading && sites.length === 0 ? <p>No records yet. Save the current draft to create one.</p> : null}
    </div>
  );
}

function UploadsPanel({
  isPending,
  message,
  error,
  onUpload
}: {
  isPending: boolean;
  message: string;
  error?: string;
  onUpload: (file: File) => void;
}) {
  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (file instanceof File && file.size > 0) {
      onUpload(file);
      event.currentTarget.reset();
    }
  }

  return (
    <form className="upload-panel" onSubmit={upload}>
      <div className="upload-dropzone">
        <FiImage aria-hidden />
        <div>
          <h3>Upload an image</h3>
          <p>Images automatically generate optimized thumbnails for previews and cards.</p>
        </div>
        <input accept="image/*" name="file" type="file" />
      </div>
      <button className="dashboard-action dashboard-action--primary" disabled={isPending} type="submit">
        {isPending ? "Uploading..." : "Upload asset"}
      </button>
      {message ? <p className="dashboard-message dashboard-message--success">{message}</p> : null}
      {error ? <p className="dashboard-message dashboard-message--error">{error}</p> : null}
    </form>
  );
}

function HelpPanel() {
  return (
    <div className="help-panel">
      <h3>Dashboard guide</h3>
      <p>Use Content for the current page record, Links for calls to action, Records to switch between saved pages, and Uploads for optimized image assets.</p>
      <ul>
        <li>Public pages only show records marked published.</li>
        <li>Protected requests use the environment access code as `X-Admin-Key`.</li>
        <li>Use generated thumbnail URLs for small image previews.</li>
      </ul>
    </div>
  );
}

function FormErrors({ errors }: { errors: ReturnType<typeof useForm<SiteDraftInput, unknown, SiteDraft>>["formState"]["errors"] }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="form-errors">
      {entries.map(([key, value]) => (
        <p key={key}>{value.message?.toString()}</p>
      ))}
    </div>
  );
}

function DashboardAccessGate({
  isChecking,
  isInvalid,
  onUnlock
}: {
  isChecking: boolean;
  isInvalid: boolean;
  onUnlock: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUnlock(code.trim());
  }

  return (
    <section className="dashboard-gate">
      <form className="dashboard-gate__panel" onSubmit={submit}>
        <div className="dashboard-gate__mark">
          <FiLock aria-hidden />
        </div>
        <span className="dashboard-eyebrow">Private dashboard</span>
        <h1>Dashboard access</h1>
        <label>
          <span>Access code</span>
          <input autoComplete="current-password" autoFocus disabled={isChecking} onChange={(event) => setCode(event.target.value)} type="password" value={code} />
        </label>
        {isInvalid ? <p className="dashboard-message dashboard-message--error">That code does not match the server environment.</p> : null}
        <button disabled={code.trim().length === 0 || isChecking} type="submit">
          {isChecking ? "Checking..." : "Unlock dashboard"}
        </button>
      </form>
    </section>
  );
}
