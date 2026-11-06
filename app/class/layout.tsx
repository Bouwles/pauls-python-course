import type { Metadata } from "next";

// Class pages hold people's names and work, and the links carry them in the hash: keep them out of
// search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  return children;
}
