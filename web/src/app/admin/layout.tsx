import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuFloating } from "@/components/home/MenuFloating";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        sessionUser={
          session
            ? {
                name: session.firstName,
                role: session.profileType,
                avatar: session.photoUrl || "",
              }
            : undefined
        }
      />
      {children}
      <MenuFloating />
    </SidebarProvider>
  );
}
