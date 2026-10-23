import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { Settings } from "@/components/settings/Settings";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Page narrow>
      <Settings />
    </Page>
  );
}
