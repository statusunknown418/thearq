"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "~/lib/stores/auth-store";

export const AuthProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) => {
  const set = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!session?.user) return;

    set(session.user);
  }, [session, set]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
