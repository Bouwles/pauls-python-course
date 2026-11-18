import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthPage mode="confirm" />;
}
