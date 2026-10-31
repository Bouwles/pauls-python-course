import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Welcome } from "@/components/welcome/Welcome";

export const metadata: Metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <Page footer={false}>
      <Welcome />
    </Page>
  );
}
