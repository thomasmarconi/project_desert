import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import Banned from "@/components/auth/banned";

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
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session?.user?.isBanned ? (
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
