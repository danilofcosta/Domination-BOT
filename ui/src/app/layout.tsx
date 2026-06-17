import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domination",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var r='dark';if(t==='dark'||t==='light'){r=t;}else if(t==='system'||!t){r=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r;}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <SidebarLayout>
            {children}
            <Toaster />
          </SidebarLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
