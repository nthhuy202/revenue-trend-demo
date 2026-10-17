import AdminDashboard from "@/components/admin/AdminDashboard";
import { isIsoWeek } from "@/lib/week";

type AdminPageProps = { searchParams: Promise<{ week?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { week } = await searchParams;

  return <AdminDashboard week={isIsoWeek(week) ? week : undefined} />;
}
