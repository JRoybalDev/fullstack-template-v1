import { SiteListSchema, SiteSchema, UploadSchema, type SiteDraft } from "@fullstack-template/schema";
import { apiJson, withAdminKey } from "./api";

export const apiClient = {
  sites: {
    async listPublic() {
      return SiteListSchema.parse(await apiJson("/api/sites"));
    },

    async getPublic(slug: string) {
      return SiteSchema.parse(await apiJson(`/api/sites/${encodeURIComponent(slug)}`));
    }
  },

  admin: {
    async verifySession(adminKey: string) {
      return apiJson("/api/admin/session", withAdminKey(adminKey));
    },

    async listSites(adminKey: string) {
      return SiteListSchema.parse(await apiJson("/api/admin/sites", withAdminKey(adminKey)));
    },

    async saveSite(adminKey: string, draft: SiteDraft) {
      return SiteSchema.parse(
        await apiJson(
          "/api/sites",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async deleteSite(adminKey: string, slug: string) {
      return SiteSchema.parse(
        await apiJson(
          `/api/sites/${encodeURIComponent(slug)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  uploads: {
    async create(adminKey: string, file: File) {
      const form = new FormData();
      form.append("file", file);

      return UploadSchema.parse(
        await apiJson(
          "/api/uploads",
          withAdminKey(adminKey, {
            method: "POST",
            body: form
          })
        )
      );
    }
  }
};
