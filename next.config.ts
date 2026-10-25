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
  // Act I's projects were renamed to plain program names (REDESIGN.md 7.3); old links still work.
  async redirects() {
    return [
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
      // The Concept Index became the public Python Handbook (REDESIGN.md 9.1).
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
  // Share cards are drawn from the built sprite sheets on request (lib/server/share.ts).
  "/u/**": ["./public/sprites/*.png", "./public/sprites/learner.json"],
};

export default function config(phase: string): NextConfig {
  return phase === PHASE_PRODUCTION_BUILD ? { ...nextConfig, outputFileTracingIncludes: tracedFiles } : nextConfig;
}
