// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { ApolloWrapper } from "@/components/apollo-wrapper";
import { ClientUserFetcher } from "@/components/ClientUserFetcher";
import { Watermark } from "@/components/watermark";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ItemFlow",
  description: "Inventory Manager for Campus Clubs and Events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground">
        <ApolloWrapper>
          <Toaster />
          <ClientUserFetcher />

          <SidebarProvider defaultOpen={false}>
            <div className="flex h-screen w-full">
              <AppSidebar collapsible="icon" />

              <Separator orientation="vertical" />
              <main className="flex-1 overflow-y-auto">
                <Navbar />
                {/* Main content area */}
                <div className="min-h-[80vh]">{children}</div>
                <Watermark />
              </main>
            </div>
          </SidebarProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
