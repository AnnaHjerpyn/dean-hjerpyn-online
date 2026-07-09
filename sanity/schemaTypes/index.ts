import { type SchemaTypeDefinition } from "sanity";
import { projectType } from "./project";
import { siteSettingsType } from "./siteSettings";
import { fieldJournalEntryType } from "./fieldJournalEntryType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, siteSettingsType, fieldJournalEntryType],
};
