// The share card for a shipped project (REDESIGN.md 9.2), 1200 x 630 for social previews: the
// project's name large in the display face, who built it and for whom, its Shelf object on a
// tile in the client's colour, a "Shipped" stamp, and the learner's avatar. Dark, like the app.
// Drawn with next/og on request. Server only.
import { ImageResponse } from "next/og";
import { BRAND, siteUrl } from "@/lib/brand";
import { readAvatar } from "@/lib/avatar";
import { castColour } from "@/lib/cast";
import { getIndex } from "@/lib/content/server";
import { shelfIcon } from "@/lib/shelf-icons";
import type { SharedProject } from "@/lib/server/share";
import { DISPLAY, NIGHT, OgMark, TEXT, PASS, PASS_TEXT, ROMAN, bareUrl, ogFonts } from "@/components/certificates/og";
import { Icon } from "@/components/ui/Icon";

export const CARD_SIZE = { width: 1200, height: 630 };

/** First and last initials, as the Avatar component shows them. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0]!.charAt(0) + (parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "")).toUpperCase();
}

/** Dark or light text, whichever reads on `bg` (as the Avatar component does). */
function inkFor(bg: string): string {
  const n = parseInt(bg.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! > 0.3 ? "#14171D" : "#FFFFFF";
}

const titleSize = (t: string) => (t.length <= 14 ? 96 : t.length <= 22 ? 80 : t.length <= 32 ? 64 : 52);

function Card({ p, slug }: { p: SharedProject; slug: string }) {
  const index = getIndex();
  const act = index.acts.find((a) => a.id === p.job.act);
  const client = index.characters[p.job.client]?.name ?? p.job.client;
  const tile = castColour(p.job.client);
  const avatar = readAvatar(p.character).colour;
  const name = !p.name.trim() || p.name === "An apprentice" ? "A learner" : p.name.trim();
  const size = titleSize(p.job.projectName);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", background: NIGHT.bg, color: NIGHT.text, fontFamily: TEXT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <OgMark size={52} />
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, letterSpacing: -0.6 }}>{BRAND.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", border: `4px solid ${PASS}`, borderRadius: 8, color: PASS_TEXT, transform: "rotate(-4deg)" }}>
          <svg width="30" height="30" viewBox="0 0 256 256">
            <path d="M40 144l56 56L216 72" fill="none" stroke={PASS_TEXT} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, letterSpacing: -0.4 }}>Shipped</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.02 }}>{p.job.projectName}</span>
          <span style={{ fontSize: 32, color: NIGHT.text2, marginTop: 24, lineHeight: 1.35 }}>
            A real Python program, built for {client}.
          </span>
          {act ? <span style={{ fontSize: 26, color: NIGHT.text3, marginTop: 10 }}>{`Act ${ROMAN[act.number] ?? act.number}: ${act.subject}`}</span> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "none", width: 264, height: 264, borderRadius: 44, background: tile.face, color: tile.ink }}>
          <Icon name={shelfIcon(p.job.id, p.job.projectName)} size={140} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 9999, background: avatar, color: inkFor(avatar), fontFamily: DISPLAY, fontWeight: 800, fontSize: 26 }}>{initials(name)}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30 }}>{`Built by ${name}`}</span>
          <span style={{ fontSize: 22, color: NIGHT.text2, marginTop: 2 }}>{`${bareUrl(siteUrl())}/u/${slug}`}</span>
        </div>
      </div>
    </div>
  );
}

export function shareCard(p: SharedProject, slug: string, headers?: Record<string, string>): ImageResponse {
  return new ImageResponse(<Card p={p} slug={slug} />, { ...CARD_SIZE, fonts: ogFonts(), headers });
}
