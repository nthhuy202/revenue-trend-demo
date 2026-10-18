import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAfterCurrentWeek, isIsoWeek } from "@/lib/week";

type AdminPageProps = { searchParams: Promise<{ week?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { week } = await searchParams;
  // Future weeks have no real figures yet; the API rejects edits to them as well.
  if (isIsoWeek(week) && isAfterCurrentWeek(week)) redirect("/admin");

  return <AdminDashboard week={isIsoWeek(week) ? week : undefined} />;
}
