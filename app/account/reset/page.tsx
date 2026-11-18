import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false, follow: false } };

export default function Page() {
  return <AuthPage mode="reset" />;
}
