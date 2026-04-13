import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/telegram/create_slug";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domination Web",
  description: "Traga o universo dos animes para o seu grupo. Waifus e Husbandos para capturar!",
  keywords: ["waifu", "husbando", "anime", "telegram bot", "captura", "collection"],
  authors: [{ name: "Domination Bot" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Domination Web",
    description: "Traga o universo dos animes para o seu grupo. Waifus e Husbandos para capturar!",
    type: "website",
    locale: "pt_BR",
    siteName: "Domination Web",
  },
  twitter: {
    card: "summary_large_image",
    title: "Domination Web",
    description: "Traga o universo dos animes para o seu grupo. Waifus e Husbandos para capturar!",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(geistSans.variable, geistMono.variable, inter.variable)}
    >
      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
