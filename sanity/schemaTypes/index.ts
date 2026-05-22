import { type SchemaTypeDefinition } from "sanity";
import { projectType } from "./project";
import { siteSettingsType } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, siteSettingsType],
};
