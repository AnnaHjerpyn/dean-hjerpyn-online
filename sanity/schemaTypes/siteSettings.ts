import { defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",

  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "headline",
      title: "Homepage Headline",
      type: "text",
    },
    {
      name: "aboutHeading",
      title: "About Heading",
      type: "text",
    },
    {
      name: "aboutBody",
      title: "About Body",
      type: "text",
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "instagram",
      title: "Instagram",
      type: "url",
    },
    {
      name: "plantDrawings",
      title: "Landing Page Plant Drawings",
      description:
        "Transparent PNG or SVG drawings that animate onto the homepage.",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
});
