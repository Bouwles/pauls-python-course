import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";
import { SessionProvider } from "@/lib/store/session";
import { getSessionUser } from "@/lib/server/auth";
import { asset } from "@/lib/static";
import { ServiceWorker } from "@/components/site/ServiceWorker";
import { ToastProvider } from "@/components/ui/Toast";
import { BRAND, siteUrl } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: BRAND.name, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: { icon: [{ url: asset("/icon-32.png"), sizes: "32x32" }, { url: asset("/icon-16.png"), sizes: "16x16" }], apple: asset("/apple-icon.png") },
  openGraph: { title: BRAND.name, description: BRAND.description, siteName: BRAND.name, images: [{ url: asset("/og.png"), width: 1200, height: 630 }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F1115" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
  ],
};

// Three faces: Fredoka, rounded and friendly, for titles, names, buttons, tabs and labels;
// Atkinson Hyperlegible Next for reading and for anything typed; JetBrains Mono for code. Fredoka
// is loaded semi-bold as its normal weight, so every title and label is semi-bold without each
// rule saying so, and bold for anything marked bold. Both loaded faces preload with matched
// fallbacks.
const display = localFont({
  src: [
    { path: "../node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-loaded",
  display: "swap",
  adjustFontFallback: "Arial",
});

const read = localFont({
  src: [
    { path: "../node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-text-loaded",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Applies saved display settings before first paint, so there is no flash.
const settingsScript = `try{var s=JSON.parse(localStorage.getItem("ppc-display")||"{}");var d=document.documentElement;if(s.theme)d.dataset.theme=s.theme;if(s.prose==="hyperlegible")d.dataset.prose="hyperlegible";if(s.motion==="reduced")d.dataset.motion="reduced";if(s.editorFontSize)d.style.setProperty("--editor-font-size",s.editorFontSize+"px")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null);
  return (
    <html lang="en-GB" className={`${display.variable} ${read.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SessionProvider initialUser={user}>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
