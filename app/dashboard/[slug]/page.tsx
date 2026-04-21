import DashboardPage from "@/components/DashboardPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DashboardPage slug={slug} />;
}
