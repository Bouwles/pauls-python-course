import type { Metadata } from "next";
import { floorFor } from "@/lib/cast";
import { getIndex } from "@/lib/content/server";
import { Page } from "@/components/site/Page";
import { League } from "@/components/league/League";

export const metadata: Metadata = { title: "The Arcade League" };

// A plain page, the same on GitHub Pages as in the local version: entries are raced in the
// browser (lib/league/local.ts), and a League table link (/league/#...) is read there too. The
// server only adds who hosts, from the content.

export default function LeaguePage() {
  const characters = getIndex().characters;
  // The Arcade is the Act VIII floor; whoever lives there runs the League.
  const hosts = (floorFor(8)?.residents ?? []).map((id) => ({ id, name: characters[id]?.name ?? id.charAt(0).toUpperCase() + id.slice(1) }));
  // Everyone's names, for whoever hosts in your place when you're playing as one of the hosts.
  const names = Object.fromEntries(Object.values(characters).map((c) => [c.id, c.name]));
  return (
    <Page>
      <League hosts={hosts} names={names} />
    </Page>
  );
}
