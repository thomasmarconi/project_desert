import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import Banned from "@/components/auth/banned";
import { getCurrentUser } from "@/lib/services/adminService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Desert",
  description: "Project Desert",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {user && user.isBanned ? (
          <Banned />
        ) : (
          <SessionProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarTrigger />
              {children}
              <Toaster />
            </SidebarProvider>
          </SessionProvider>
        )}
      </body>
    </html>
  );
}
