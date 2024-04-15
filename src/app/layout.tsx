import "~/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { type Metadata, type Viewport } from "next";
import { AuthProvider } from "~/components/auth-provider";
import { ThemeWrapper } from "~/components/theme-wrapper";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "ZenTrack",
  description: "The new cool kid on the block.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} text-sm`}>
        <ThemeWrapper>
          <AuthProvider session={session}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AuthProvider>

          <Toaster />
        </ThemeWrapper>
      </body>

      <SpeedInsights />
    </html>
  );
}
