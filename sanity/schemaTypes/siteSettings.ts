// sanity/schemaTypes/siteSettings.ts
import { defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "name", type: "string" },
    { name: "headline", type: "text" },
    { name: "bio", type: "text" },
    { name: "email", type: "string" },
    { name: "instagram", type: "url" },
  ],
});
