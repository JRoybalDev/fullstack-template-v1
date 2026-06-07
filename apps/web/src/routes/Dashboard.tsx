import { SiteDraftSchema, SiteListSchema, type SiteDraft, type SiteDraftInput } from "@fullstack-template/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiLock, FiLogOut, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { apiJson, withAdminKey } from "../shared/api";
import { useDraftStore } from "../state/draftStore";

const defaultDraft: SiteDraftInput = {
  slug: "home",
  title: "A sharp new site",
  description: "Edit this content in the dashboard and publish it to the public page.",
  heroImageUrl: "",
  links: [{ label: "Contact", href: "https://example.com", kind: "primary" }],
  published: true
};

export function Dashboard() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const setAdminKey = useDraftStore((state) => state.setAdminKey);
  const clearAdminKey = useDraftStore((state) => state.clearAdminKey);
  const cachedDraft = useDraftStore((state) => state.draft);
  const setDraft = useDraftStore((state) => state.setDraft);

  const session = useQuery({
    queryKey: ["admin-session", adminKey],
    queryFn: () => apiJson("/api/admin/session", withAdminKey(adminKey)),
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

  useEffect(() => {
    const subscription = form.watch((value) => setDraft(value as SiteDraftInput));
    return () => subscription.unsubscribe();
  }, [form, setDraft]);

  const sites = useQuery({
    queryKey: ["admin-sites"],
    queryFn: async () => SiteListSchema.parse(await apiJson("/api/admin/sites", withAdminKey(adminKey))),
    enabled: session.isSuccess
  });

  const saveSite = useMutation({
    mutationFn: (draft: SiteDraft) =>
      apiJson(
        "/api/sites",
        withAdminKey(adminKey, {
        method: "POST",
        body: JSON.stringify(draft)
        })
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-sites"] });
      void queryClient.invalidateQueries({ queryKey: ["sites"] });
    }
  });

  if (!session.isSuccess) {
    return (
      <DashboardAccessGate
        isChecking={session.isLoading}
        isInvalid={session.isError}
        onUnlock={(code) => setAdminKey(code)}
      />
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Admin dashboard</span>
          <h1>Manage public site content</h1>
        </div>
        <button className="btn btn-ghost" type="button" onClick={clearAdminKey}>
          <FiLogOut aria-hidden /> Lock dashboard
        </button>
      </div>

      <div className="dashboard-layout">
        <form className="editor-panel" onSubmit={form.handleSubmit((draft) => saveSite.mutate(draft))}>
          <div className="field-row">
            <label>
              <span>Slug</span>
              <input {...form.register("slug")} />
            </label>
            <label>
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
            <textarea rows={5} {...form.register("description")} />
          </label>

          <label>
            <span>Hero image URL</span>
            <input {...form.register("heroImageUrl")} placeholder="https://..." />
          </label>

          <div className="links-header">
            <h2>Links</h2>
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

          <div className="form-errors">
            {Object.entries(form.formState.errors).map(([key, value]) => (
              <p key={key}>{value.message?.toString()}</p>
            ))}
            {saveSite.error ? <p>{saveSite.error.message}</p> : null}
          </div>

          <button className="btn btn-primary" type="submit" disabled={saveSite.isPending}>
            <FiSave aria-hidden /> {saveSite.isPending ? "Saving..." : "Save content"}
          </button>
        </form>

        <aside className="records-panel">
          <h2>Records</h2>
          {sites.isLoading ? <p>Loading...</p> : null}
          {sites.data
            ? sites.data.map((site) => (
                <button
                  className="record-row"
                  key={site.id}
                  type="button"
                  onClick={() => {
                    form.reset({
                      slug: site.slug,
                      title: site.title,
                      description: site.description,
                      heroImageUrl: site.heroImageUrl,
                      links: site.links,
                      published: site.published
                    });
                  }}
                >
                  <span>{site.title}</span>
                  <small>{site.published ? "Published" : "Draft"}</small>
                </button>
              ))
            : null}
        </aside>
      </div>
    </section>
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
    <section className="dashboard-page access-page">
      <form className="access-panel" onSubmit={submit}>
        <div className="access-icon">
          <FiLock aria-hidden />
        </div>
        <span className="eyebrow">Private dashboard</span>
        <h1>Enter the environment access code</h1>
        <label>
          <span>Access code</span>
          <input
            autoComplete="current-password"
            autoFocus
            disabled={isChecking}
            onChange={(event) => setCode(event.target.value)}
            type="password"
            value={code}
          />
        </label>
        {isInvalid ? <p className="access-error">That code does not match the server environment.</p> : null}
        <button className="btn btn-primary" disabled={code.trim().length === 0 || isChecking} type="submit">
          {isChecking ? "Checking..." : "Unlock dashboard"}
        </button>
      </form>
    </section>
  );
}
