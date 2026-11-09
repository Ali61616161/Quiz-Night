import type { Metadata, Viewport } from "next";
import { BRAND } from "@config/brand";
import { I18nBoot, LangSwitch } from "@/components/I18n";
import "./globals.css";

export const metadata: Metadata = { title: { default: BRAND.name, template: `%s · ${BRAND.name}` }, description: BRAND.tagline };
export const viewport: Viewport = { themeColor: "#17483B", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body><LangSwitch />{children}<I18nBoot /></body>
    </html>
  );
}
