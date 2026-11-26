import { redirect } from "next/navigation";

// Selected Works now lives on the landing page. Keep this route so old
// links still land somewhere sensible.
export default function WorkRedirect() {
  redirect("/");
}
