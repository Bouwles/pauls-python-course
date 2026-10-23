import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { DeviceApprove } from "@/components/device/DeviceApprove";

export const metadata: Metadata = { title: "Connect the ppc tool" };

export default async function DevicePage({ searchParams }: PageProps<"/device">) {
  const code = (await searchParams).code;
  return (
    <Page narrow>
      <DeviceApprove initialCode={typeof code === "string" ? code : ""} />
    </Page>
  );
}
