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
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    template: "%s | TheArq",
    default: "TheArq",
  },
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
      <body
        className={`bg-background font-sans text-foreground ${GeistSans.variable} ${GeistMono.variable} text-sm`}
      >
        <NextTopLoader
          color="#6366f1"
          showSpinner={false}
          speed={300}
          initialPosition={0.1}
          height={4}
        />

        <ThemeWrapper>
          <AuthProvider session={session}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AuthProvider>

          <Toaster />
        </ThemeWrapper>

        <SpeedInsights />
      </body>
    </html>
  );
}
