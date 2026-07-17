// sanity/schemaTypes/fieldJournalEntryType.ts

import { defineArrayMember, defineField, defineType } from "sanity";

export const fieldJournalEntryType = defineType({
  name: "fieldJournalEntry",
  title: "Field Journal",
  type: "document",

  fields: [
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      initialValue: "image",
      options: {
        layout: "radio",
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "PDF", value: "pdf" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      hidden: ({ document }) =>
        Boolean(document?.mediaType && document.mediaType !== "image"),
      validation: (Rule) =>
        Rule.custom((image, context) => {
          const mediaType = context.document?.mediaType;

          // Older entries without mediaType are treated as images.
          if (!mediaType || mediaType === "image") {
            return image ? true : "An image is required.";
          }

          return true;
        }),
    }),

    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
      },
      hidden: ({ document }) => document?.mediaType !== "video",
      validation: (Rule) =>
        Rule.custom((video, context) => {
          if (context.document?.mediaType === "video") {
            return video ? true : "A video file is required.";
          }

          return true;
        }),
    }),

    defineField({
      name: "pdf",
      title: "PDF",
      type: "file",
      options: {
        accept: "application/pdf",
      },
      hidden: ({ document }) => document?.mediaType !== "pdf",
      validation: (Rule) =>
        Rule.custom((pdf, context) => {
          if (context.document?.mediaType === "pdf") {
            return pdf ? true : "A PDF file is required.";
          }

          return true;
        }),
    }),

    defineField({
      name: "alt",
      title: "Alt Text",
      description: "Describe the image for accessibility.",
      type: "string",
      hidden: ({ document }) =>
        Boolean(document?.mediaType && document.mediaType !== "image"),
    }),

    defineField({
      name: "caption",
      title: "Caption",
      description: "A short caption displayed with the media.",
      type: "string",
    }),

    defineField({
      name: "writing",
      title: "Journal Writing",
      type: "array" as const,
      of: [
        defineArrayMember({
          type: "block",
        }),
      ],
    }),

    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
  ],

  preview: {
    select: {
      caption: "caption",
      date: "date",
      mediaType: "mediaType",
      image: "image",
      videoFilename: "video.asset.originalFilename",
      pdfFilename: "pdf.asset.originalFilename",
    },

    prepare({ caption, date, mediaType, image, videoFilename, pdfFilename }) {
      const resolvedMediaType = mediaType || "image";

      let fallbackTitle = "Field Journal Image";

      if (resolvedMediaType === "video") {
        fallbackTitle = videoFilename || "Field Journal Video";
      }

      if (resolvedMediaType === "pdf") {
        fallbackTitle = pdfFilename || "Field Journal PDF";
      }

      return {
        title: caption || fallbackTitle,
        subtitle: `${date || "No date"} · ${resolvedMediaType.toUpperCase()}`,
        media: resolvedMediaType === "image" ? image : undefined,
      };
    },
  },
});
