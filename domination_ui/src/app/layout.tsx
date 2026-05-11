import type { Metadata } from "next";
import { Nunito_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

const manropeHeading = Manrope({ subsets: ["latin"], variable: "--font-heading" });

const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Domination - Painel",
  description: "Painel de controle do Domination BOT",
};

import { SidebarProvider } from "@/components/sidebar-provider";
import { LayoutContent } from "@/components/layout-content";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={cn("h-full", nunitoSans.variable, manropeHeading.variable)}>
      <body className="min-h-full font-sans antialiased">
        <SidebarProvider>
          <Sidebar />
          <LayoutContent>
            {children}
          </LayoutContent>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
