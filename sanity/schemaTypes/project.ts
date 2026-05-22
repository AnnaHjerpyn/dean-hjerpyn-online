// sanity/schemaTypes/project.ts
export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "location", type: "string" },
    { name: "year", type: "string" },
    { name: "firm", type: "string" },
    { name: "role", type: "string" },
    { name: "projectType", type: "string" },
    { name: "slug", type: "slug", options: { source: "title" } },
    { name: "description", type: "array", of: [{ type: "block" }] },
    { name: "coverImage", type: "image" },
    { name: "gallery", type: "array", of: [{ type: "image" }] },
  ],
};
