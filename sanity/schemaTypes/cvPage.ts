// sanity/schemaTypes/cvPage.ts

import { defineArrayMember, defineField, defineType } from "sanity";

/* -------------------------------------------------------------------------- */
/* Education entry                                                            */
/* -------------------------------------------------------------------------- */

export const educationEntryType = defineType({
  name: "educationEntry",
  title: "Education Entry",
  type: "object",

  fields: [
    defineField({
      name: "institution",
      title: "Institution",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),

    defineField({
      name: "degree",
      title: "Degree",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "specialization",
      title: "Specialization",
      type: "string",
    }),

    defineField({
      name: "minor",
      title: "Minor",
      type: "string",
    }),

    defineField({
      name: "details",
      title: "Additional Details",
      description: "Examples: Magna Cum Laude or Expected Graduation: May 2027",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "string",
        }),
      ],
    }),
  ],

  preview: {
    select: {
      institution: "institution",
      degree: "degree",
    },

    prepare(selection: { institution?: string; degree?: string }) {
      return {
        title: selection.institution || "Education entry",
        subtitle: selection.degree || "",
      };
    },
  },
});

/* -------------------------------------------------------------------------- */
/* Experience entry                                                           */
/* -------------------------------------------------------------------------- */

export const experienceEntryType = defineType({
  name: "experienceEntry",
  title: "Experience Entry",
  type: "object",

  fields: [
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "dates",
      title: "Dates",
      description: "Example: April 2023 – August 2024",
      type: "string",
    }),

    defineField({
      name: "organization",
      title: "Organization",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),

    defineField({
      name: "bullets",
      title: "Responsibilities and Details",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "text",
          rows: 3,
        }),
      ],
    }),
  ],

  preview: {
    select: {
      position: "position",
      organization: "organization",
      dates: "dates",
    },

    prepare(selection: {
      position?: string;
      organization?: string;
      dates?: string;
    }) {
      return {
        title: selection.position || "Experience entry",

        subtitle: [selection.organization, selection.dates]
          .filter(Boolean)
          .join(" — "),
      };
    },
  },
});

/* -------------------------------------------------------------------------- */
/* Award entry                                                                */
/* -------------------------------------------------------------------------- */

export const awardEntryType = defineType({
  name: "awardEntry",
  title: "Award Entry",
  type: "object",

  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "title",
      title: "Award Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: "title",
      year: "year",
    },

    prepare(selection: { title?: string; year?: string }) {
      return {
        title: selection.title || "Award",
        subtitle: selection.year || "",
      };
    },
  },
});

/* -------------------------------------------------------------------------- */
/* CV page document                                                           */
/* -------------------------------------------------------------------------- */

export const cvPageType = defineType({
  name: "cvPage",
  title: "CV Page",
  type: "document",

  initialValue: {
    educationHeading: "Education",
    experienceHeading: "Experience",
    awardsHeading: "Awards",
    skillsHeading: "Special Skills",
  },

  fields: [
    /* Education */

    defineField({
      name: "educationHeading",
      title: "Education Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "education",
      title: "Education",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "educationEntry",
        }),
      ],
    }),

    /* Experience */

    defineField({
      name: "experienceHeading",
      title: "Experience Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "experience",
      title: "Experience",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "experienceEntry",
        }),
      ],
    }),

    /* Awards */

    defineField({
      name: "awardsHeading",
      title: "Awards Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "awards",
      title: "Awards",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "awardEntry",
        }),
      ],
    }),

    /* Skills */

    defineField({
      name: "skillsHeading",
      title: "Skills Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "skills",
      title: "Special Skills",
      type: "array" as const,

      of: [
        defineArrayMember({
          type: "string",
        }),
      ],
    }),
  ],

  preview: {
    prepare() {
      return {
        title: "CV Page",
        subtitle: "Education, experience, awards, and skills",
      };
    },
  },
});
