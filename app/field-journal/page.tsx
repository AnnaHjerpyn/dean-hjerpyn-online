import { redirect } from "next/navigation";

// The field journal now lives in the landing page's right-hand column.
// Keep this route so old links still land somewhere sensible.
export default function FieldJournalRedirect() {
  redirect("/");
}
