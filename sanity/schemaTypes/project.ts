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
      validation: (Rule) => Rule.required(),
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
        maxLength: 96,
      },

      validation: (Rule) => Rule.required(),
    },

    {
      name: "description",
      title: "Description",
      type: "array",

      of: [
        {
          type: "block",
        },
      ],
    },

    {
      name: "coverImage",
      title: "Cover Image",
      description:
        "This image appears on the main Work page as the project cover.",
      type: "image",

      options: {
        hotspot: true,
      },

      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          description: "Briefly describe the image for accessibility.",
          type: "string",
        },
      ],
    },

    {
      name: "gallery",
      title: "Project Media",
      description: "Add and reorder project images, videos, and PDF documents.",
      type: "array",

      of: [
        {
          name: "galleryImage",
          title: "Image",
          type: "image",

          options: {
            hotspot: true,
          },

          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              description: "Briefly describe the image for accessibility.",
              type: "string",
            },

            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],
        },

        {
          name: "video",
          title: "Video",
          type: "object",

          fields: [
            {
              name: "file",
              title: "Video File",
              type: "file",

              options: {
                accept: "video/mp4,video/webm,video/quicktime",
              },

              validation: (Rule) => Rule.required(),
            },

            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],

          preview: {
            select: {
              title: "caption",
              subtitle: "file.asset.originalFilename",
            },
          },
        },

        {
          name: "pdf",
          title: "PDF",
          type: "object",

          fields: [
            {
              name: "file",
              title: "PDF File",
              type: "file",

              options: {
                accept: "application/pdf",
              },

              validation: (Rule) => Rule.required(),
            },

            {
              name: "title",
              title: "PDF Title",
              type: "string",
            },
          ],

          preview: {
            select: {
              title: "title",
              subtitle: "file.asset.originalFilename",
            },
          },
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "coverImage",
    },
  },
});
