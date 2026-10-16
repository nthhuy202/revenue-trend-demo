import AdminDashboard from "@/components/admin/AdminDashboard";
import { isIsoWeek } from "@/lib/week";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  return <AdminDashboard week={isIsoWeek(week) ? week : undefined} />;
}
