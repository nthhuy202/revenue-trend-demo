import RevenueTrendCard from "@/components/revenue/RevenueTrendCard";
import { isIsoWeek } from "@/lib/week";

type HomeProps = { searchParams: Promise<{ week?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const { week } = await searchParams;

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-5 sm:py-8">
      <RevenueTrendCard week={isIsoWeek(week) ? week : undefined} />
    </main>
  );
}
