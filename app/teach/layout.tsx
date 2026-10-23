import type { Metadata } from "next";

// Class pages show other people's work: keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function TeachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
