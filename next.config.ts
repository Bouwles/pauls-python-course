import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

// Cross-origin isolation is required for SharedArrayBuffer, which powers
// Stop (Pyodide's interrupt buffer) and interactive input() in the console.
// Everything the page loads is self-hosted, so require-corp is safe.
const isolationHeaders = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite", "pyodide"],
  // The illustrator's art (art/final/, components/art/Art.tsx): AVIF first, and the exact
  // display sizes of portraits and figures, so a 256 px portrait's double size is 512.
  images: {
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 48, 64, 96, 128, 180, 256, 360, 384, 512],
  },
  // Act I's projects were renamed to plain program names; old links still work.
  async redirects() {
    return [
      // No payments: the old pricing and checkout pages go to the front page.
      { source: "/pricing", destination: "/", permanent: false },
      { source: "/pricing/:rest*", destination: "/", permanent: false },
      { source: "/job/sign-on-the-door", destination: "/job/shop-sign", permanent: true },
      { source: "/job/beas-till-2", destination: "/job/bill-splitter", permanent: true },
      { source: "/job/beas-till-1", destination: "/job/bill-splitter", permanent: true },
      { source: "/job/reading-the-wreckage", destination: "/job/reading-tracebacks", permanent: true },
      { source: "/job/ferry-fare-machine", destination: "/job/unit-converter", permanent: true },
      { source: "/job/harbour-noticeboard", destination: "/job/password-checker", permanent: true },
      { source: "/job/toms-lamp-check", destination: "/job/times-table-trainer", permanent: true },
      { source: "/job/guess-the-catch", destination: "/job/number-guessing-game", permanent: true },
      { source: "/job/the-fog-horn", destination: "/job/number-guessing-game", permanent: true },
      { source: "/job/miras-pigeonholes", destination: "/job/to-do-list", permanent: true },
      { source: "/job/shopping-list-fixer", destination: "/job/to-do-list", permanent: true },
      { source: "/job/the-address-book", destination: "/job/contact-book", permanent: true },
      { source: "/job/pub-quiz-night", destination: "/job/grade-calculator", permanent: true },
      { source: "/job/harbour-logbook", destination: "/job/expense-tracker", permanent: true },
      { source: "/job/postcards", destination: "/job/bike-hire-shed-2", permanent: true },
      // Acts VI and VII: jobs folded into the projects they fed.
      { source: "/job/many-features", destination: "/job/training-and-testing", permanent: true },
      { source: "/job/rain-or-no-rain", destination: "/job/was-it-right", permanent: true },
      { source: "/job/the-question-tree", destination: "/job/forests-and-boosting", permanent: true },
      { source: "/job/grouping-stars", destination: "/job/squashing-dimensions", permanent: true },
      { source: "/job/meet-scikit-learn", destination: "/job/fair-and-honest-models", permanent: true },
      { source: "/job/one-neuron", destination: "/job/learning-backwards", permanent: true },
      { source: "/job/a-small-brain", destination: "/job/learning-backwards", permanent: true },
      { source: "/job/scrapyard-route-planner", destination: "/job/interview-prep-set", permanent: true },
      // Projects whose ids carried the old cast's names.
      { source: "/job/penhallows-logs", destination: "/job/log-analyser", permanent: true },
      { source: "/job/penhallows-handwriting", destination: "/job/handwritten-digits", permanent: true },
      { source: "/job/penhallows-notebook-reader", destination: "/job/notebook-reader", permanent: true },
      { source: "/job/mosss-radio", destination: "/job/radio-station-finder", permanent: true },
      // The Concept Index became the public Python Handbook.
      { source: "/concepts", destination: "/handbook", permanent: true },
      { source: "/concepts/:id", destination: "/handbook/:id", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: [...isolationHeaders, ...securityHeaders] },
      {
        source: "/pyodide/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

// Files read at runtime with computed paths, which file tracing can't follow on its
// own. Build only: in development Turbopack treats these globs as watched inputs and
// reloads every page in a loop.
const tracedFiles = {
  "/**": ["./generated/content/**/*.json", "./cli/pyproject.toml", "./cli/README.md", "./cli/src/**/*.py"],
  // Certificates and share cards are drawn on request with these fonts (components/certificates/og.tsx).
  "/certificates/**": ["./node_modules/@fontsource/fredoka/files/*-normal.woff", "./node_modules/@fontsource/atkinson-hyperlegible-next/files/*-normal.woff"],
  "/u/**": ["./node_modules/@fontsource/fredoka/files/*-normal.woff", "./node_modules/@fontsource/atkinson-hyperlegible-next/files/*-normal.woff"],
};

// The GitHub Pages build (scripts/build-pages.ts): plain files under the repository's path, with
// no server, so no headers or redirects (the service worker adds the isolation headers instead).
const pagesConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: "export",
  // Its own build folder, so it never touches the local version's (.next).
  distDir: ".next-pages",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // The local build type-checks everything; here some files it would check are set aside.
  typescript: { ignoreBuildErrors: true },
};

export default function config(phase: string): NextConfig {
  if (process.env.NEXT_PUBLIC_PPC_STATIC === "1") return pagesConfig;
  return phase === PHASE_PRODUCTION_BUILD ? { ...nextConfig, outputFileTracingIncludes: tracedFiles } : nextConfig;
}
