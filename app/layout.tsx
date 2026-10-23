import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/ibm-plex-sans/latin-400-italic.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "./globals.css";
import { SessionProvider } from "@/lib/store/session";
import { getSessionUser } from "@/lib/server/auth";
import { ServiceWorker } from "@/components/site/ServiceWorker";

export const metadata: Metadata = {
  title: { default: "Paul's Python Course", template: "%s · Paul's Python Course" },
  description:
    "Learn Python by fixing a small harbour town, one real program at a time. From your first print statement to reinforcement learning.",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161d27" },
  ],
};

// The serif (lesson text, headings) and Plex Sans (the interface) go through next/font:
// preloaded, and with fallbacks sized to match, so the page doesn't reflow when they arrive
// (the landing page's largest text would otherwise repaint late). Mono and Atkinson
// Hyperlegible stay as plain @font-face rules: they load when something uses them.
const serif = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2", style: "normal", weight: "200 900" },
    { path: "../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-italic.woff2", style: "italic", weight: "200 900" },
  ],
  variable: "--font-serif-loaded",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const sans = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2", style: "normal", weight: "400" },
    { path: "../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2", style: "normal", weight: "500" },
    { path: "../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2", style: "normal", weight: "600" },
  ],
  variable: "--font-sans-loaded",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

// Applies saved display settings before first paint, so there is no flash.
const settingsScript = `try{var s=JSON.parse(localStorage.getItem("ppc-display")||"{}");var d=document.documentElement;if(s.theme==="light"||s.theme==="dark")d.dataset.theme=s.theme;if(s.prose==="hyperlegible")d.dataset.prose="hyperlegible";if(s.motion==="reduced")d.dataset.motion="reduced";if(s.editorFontSize)d.style.setProperty("--editor-font-size",s.editorFontSize+"px")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null);
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
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
