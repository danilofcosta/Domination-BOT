import { DashboardStats } from "@/components/dashboard-stats";
import { MenuFloating } from "@/components/home/MenuFloating";
import { SidebarInset } from "@/components/ui/sidebar";
import { getDashboardData } from "./actions";
import { SiteHeader } from "@/components/site-header";
import { ProfileDistribution } from "@/components/profile-distribution";
import { RarityManagement } from "@/components/rarity-management";
import { UserManagementTable } from "@/components/user-management-table";
import { EventManagement } from "@/components/event-management";
import { CharacterManagementTable } from "@/components/character-management-table";
import { TelegramGroupManagement } from "@/components/telegram-group-management";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { stats, profileDistribution } = await getDashboardData();
  const params = await searchParams;
  const activeTab = (params.tab as string) || "home_dashboard";

  return (
    <SidebarInset className="flex flex-col min-h-screen bg-background/50 backdrop-blur-sm">
      <SiteHeader />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
        {/* Renderização Condicional por Aba */}
        {activeTab === "home_dashboard" && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex flex-col items-center justify-center text-center space-y-2 mb-8">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary">Overview do Sistema</h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">Status Geral da Domination</p>
             </div>
            <DashboardStats stats={stats} />
            <div className="max-w-4xl mx-auto w-full">
              <ProfileDistribution data={profileDistribution} />
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col mb-8 px-4 lg:px-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Gestão de Usuários</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <UserManagementTable />
          </div>
        )}

        {activeTab === "characters" && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col mb-8 px-4 lg:px-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Repositório de Personagens</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <CharacterManagementTable />
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col mb-8 px-4 lg:px-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Protocolos de Eventos</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <EventManagement />
          </div>
        )}

        {activeTab === "rarities" && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col mb-8 px-4 lg:px-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Graus de Raridade</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <RarityManagement />
          </div>
        )}

        {activeTab === "groups" && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex flex-col mb-8 px-4 lg:px-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Grupos Autorizados</h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-1" />
            </div>
            <TelegramGroupManagement />
          </div>
        )}
      </main>

      <MenuFloating />
    </SidebarInset>
  );
}
