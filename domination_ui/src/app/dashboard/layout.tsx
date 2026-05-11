import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domination - Painel",
  description: "Painel de controle do Domination BOT",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
