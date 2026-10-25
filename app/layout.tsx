import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";
import { SessionProvider } from "@/lib/store/session";
import { getSessionUser } from "@/lib/server/auth";
import { ServiceWorker } from "@/components/site/ServiceWorker";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `${BRAND.name}: ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: { icon: [{ url: "/icon-32.png", sizes: "32x32" }, { url: "/icon-16.png", sizes: "16x16" }], apple: "/apple-icon.png" },
  openGraph: { title: BRAND.name, description: BRAND.description, siteName: BRAND.name, images: [{ url: "/og.png", width: 1200, height: 630 }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e1218" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1218" },
  ],
};

// Three faces only, and no serif (REDESIGN.md 3.2): m6x11plus for game chrome
// (headings, buttons, tabs, dialogue), Atkinson Hyperlegible Next for reading,
// JetBrains Mono for code. Both loaded faces are preloaded with size-matched fallbacks.
const pixel = localFont({
  src: [{ path: "./fonts/m6x11plus.ttf", weight: "400", style: "normal" }],
  variable: "--font-pixel-loaded",
  display: "swap",
  adjustFontFallback: false,
});

const read = localFont({
  src: [
    { path: "../node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-read-loaded",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Applies saved display settings before first paint, so there is no flash.
const settingsScript = `try{var s=JSON.parse(localStorage.getItem("ppc-display")||"{}");var d=document.documentElement;if(s.theme)d.dataset.theme=s.theme;if(s.prose==="hyperlegible")d.dataset.prose="hyperlegible";if(s.motion==="reduced")d.dataset.motion="reduced";if(s.editorFontSize)d.style.setProperty("--editor-font-size",s.editorFontSize+"px")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null);
  return (
    <html lang="en-GB" className={`${pixel.variable} ${read.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SessionProvider initialUser={user}>{children}</SessionProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
