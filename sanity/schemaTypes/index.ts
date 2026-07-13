import type { SchemaTypeDefinition } from "sanity";

import { projectType } from "./project";
import { siteSettingsType } from "./siteSettings";
import { fieldJournalEntryType } from "./fieldJournalEntryType";

import {
  awardEntryType,
  cvPageType,
  educationEntryType,
  experienceEntryType,
} from "./cvPage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    projectType,
    siteSettingsType,
    fieldJournalEntryType,

    educationEntryType,
    experienceEntryType,
    awardEntryType,
    cvPageType,
  ],
};
