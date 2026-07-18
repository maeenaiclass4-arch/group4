import type { Metadata } from "next";
import "./globals.css";
import "./admin/admin.css";

export const metadata: Metadata = {
  title: "YAZ — Portfolio",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop offset=%270%25%27 stop-color=%27%232f9bf5%27/%3E%3Cstop offset=%27100%25%27 stop-color=%27%238b5cf6%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%230a0e1a%27/%3E%3Ctext x=%2732%27 y=%2744%27 font-family=%27Arial,sans-serif%27 font-size=%2736%27 font-weight=%27bold%27 fill=%27url(%23g)%27 text-anchor=%27middle%27%3EY%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
