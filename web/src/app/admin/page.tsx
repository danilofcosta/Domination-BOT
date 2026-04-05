import { AppSidebar } from "@/components/app-sidebar";
import { DashboardStats } from "@/components/dashboard-stats";
import { MenuFloating } from "@/components/home/MenuFloating";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDashboardData } from "./actions";
import { SiteHeader } from "@/components/site-header";
import { ProfileDistribution } from "@/components/profile-distribution";
import { RarityManagement } from "@/components/rarity-management";
import { UserManagementTable } from "@/components/user-management-table";
import { EventManagement } from "@/components/event-management";
import { CharacterManagementTable } from "@/components/character-management-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { stats, profileDistribution } = await getDashboardData();
  const params = await searchParams;
  const activeTab = (params.tab as string) || "home_dashboard";

  return (
    <div className="bg-green-400 w-screen h-screen">
      <SiteHeader />
      <DashboardStats stats={stats} />

      <div className="px-4 lg:px-6 pt-10">
        <ProfileDistribution data={profileDistribution} />
      </div>

      <MenuFloating />
    </div>
  );
}
