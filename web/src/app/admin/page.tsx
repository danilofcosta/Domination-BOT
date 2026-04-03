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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { stats, profileDistribution } = await getDashboardData()
  const params = await searchParams
  const activeTab = (params.tab as string) || "home_dashboard";


  return (
    <div className="bg-green-400">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset
          className="bg-red-800 bg-cover sm:bg-contain  bg-center bg-no-repeat transition-colors duration-300"
          // style={{
          //   backgroundImage: `url(${img})`,
          //   // backgroundSize: "cover",
          //   backgroundPosition: "center",
          // }}
        >
          <SiteHeader />
          <DashboardStats stats={stats} />

          {activeTab === "home_dashboard" && (
            <div className="flex flex-col gap-8">
              <ProfileDistribution data={profileDistribution} />
            </div>
          )}
          {/* <UserManagementTable /> */}

          <div className="p-4">
            <div className="px-4 lg:px-6 flex items-baseline gap-4 mb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic whitespace-nowrap text-primary">
                {activeTab === "characters" && "Repositório de Personagens"}
                {activeTab === "users" && "Banco de Dados de Usuários"}
                {activeTab === "events" && "Central de Eventos"}
                {activeTab === "rarities" && "Arquivo de Raridades"}
              </h2>
              <div className="h-px bg-linear-to-r from-primary/30 to-transparent w-full" />
            </div>

            {/* Renderizar componente baseado na aba */}
            {activeTab === "characters" && <CharacterManagementTable />}
            {activeTab === "users" && <UserManagementTable />}
            {/* {activeTab === "events" && <EventManagement />}
            {activeTab === "rarities" && <RarityManagement />} */}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <MenuFloating />
    </div>
  );
}
