import type { Metadata } from "next";
import { Nunito_Sans, Manrope } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";

const manropeHeading = Manrope({ subsets: ["latin"], variable: "--font-heading" });

const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Domination - Painel",
  description: "Painel de controle do Domination BOT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={cn("h-full", nunitoSans.variable, manropeHeading.variable)}>
      <body className="min-h-full font-sans antialiased">
        <Sidebar />
        <main className="min-h-screen lg:ml-60">
          {children}
        </main>
      </body>
    </html>
  );
}
