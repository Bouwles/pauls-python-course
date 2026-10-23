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
};

export default function config(phase: string): NextConfig {
  return phase === PHASE_PRODUCTION_BUILD ? { ...nextConfig, outputFileTracingIncludes: tracedFiles } : nextConfig;
}
