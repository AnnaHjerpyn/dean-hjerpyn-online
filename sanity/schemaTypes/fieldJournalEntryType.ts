import { defineField, defineType } from "sanity";

export const fieldJournalEntryType = defineType({
  name: "fieldJournalEntry",
  title: "Field Journal",
  type: "document",

  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
    }),

    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
  ],

  preview: {
    select: {
      title: "caption",
      media: "image",
      date: "date",
    },
    prepare({ title, media, date }) {
      return {
        title: title || "Field Journal Image",
        subtitle: date || "No date",
        media,
      };
    },
  },
});
