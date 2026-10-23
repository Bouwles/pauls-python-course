import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Make an account" };

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
