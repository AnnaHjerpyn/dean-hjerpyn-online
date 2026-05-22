// sanity/schemaTypes/project.ts

import { defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },

    {
      name: "location",
      title: "Location",
      type: "string",
    },

    {
      name: "year",
      title: "Year",
      type: "string",
    },

    {
      name: "firm",
      title: "Firm",
      type: "string",
    },

    {
      name: "role",
      title: "Role",
      type: "string",
    },

    {
      name: "projectType",
      title: "Project Type",
      type: "string",
    },

    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
    },

    {
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    },

    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
    },

    {
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image" }],
    },
  ],
});
