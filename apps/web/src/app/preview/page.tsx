import { redirect } from "next/navigation";
export const metadata = { title: "Feature Preview | FixBari" };
export default function PreviewPage() { redirect("/preview/index.html"); }
