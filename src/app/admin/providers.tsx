"use client";

import { SessionProvider } from "next-auth/react";
import { AdminI18nProvider } from "@/lib/admin-i18n";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminI18nProvider>{children}</AdminI18nProvider>
    </SessionProvider>
  );
}
