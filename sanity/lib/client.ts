import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "rlunlyhp",
  dataset: "portfolio",
  apiVersion: "2026-05-22",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
