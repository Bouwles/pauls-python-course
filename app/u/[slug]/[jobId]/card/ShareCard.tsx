// The share card for a shipped project, 1200 x 630 for social previews, in the course's pixel
// style: the project's name large in the pixel face, a "Shipped" stamp, the client who asked for
// it, drawn in pixels on their colour and giving a thumbs up, and the learner's own pixel avatar.
// Dark, like the app. Drawn with next/og on request. Server only.
import { ImageResponse } from "next/og";
import { BRAND, siteUrl } from "@/lib/brand";
import { castColour } from "@/lib/cast";
import { getIndex } from "@/lib/content/server";
import { CAST_LOOKS, avatarBackground } from "@/lib/pixel/looks";
import type { SharedProject } from "@/lib/server/share";
import { DISPLAY, NIGHT, OUTLINE, OgMark, OgPerson, TEXT, PASS, PASS_TEXT, ROMAN, bareUrl, ogFonts } from "@/components/certificates/og";

export const CARD_SIZE = { width: 1200, height: 630 };

/** The title's size: always a multiple of 8, where the pixel face is crisp. */
const titleSize = (t: string) => (t.length <= 14 ? 96 : t.length <= 22 ? 80 : t.length <= 32 ? 64 : 48);

function Card({ p, slug }: { p: SharedProject; slug: string }) {
  const index = getIndex();
  const act = index.acts.find((a) => a.id === p.job.act);
  const client = index.characters[p.job.client]?.name ?? p.job.client;
  const tile = castColour(p.job.client);
  const avatar = avatarBackground(p.character);
  const look = CAST_LOOKS[p.job.client];
  const name = !p.name.trim() || p.name === "An apprentice" ? "A learner" : p.name.trim();
  const size = titleSize(p.job.projectName);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", background: NIGHT.bg, color: NIGHT.text, fontFamily: TEXT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgMark size={48} />
          <span style={{ fontFamily: DISPLAY, fontSize: 32 }}>{BRAND.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", border: `4px solid ${PASS}`, color: PASS_TEXT, boxShadow: `4px 4px 0 ${OUTLINE}` }}>
          {/* A pixel tick. */}
          <svg width="32" height="32" viewBox="0 0 8 8" shapeRendering="crispEdges">
            <path d="M6 1h1v1h-1zM5 2h1v1h-1zM4 3h1v1h-1zM1 4h1v1h-1zM3 4h1v1h-1zM2 5h1v1h-1z" fill={PASS_TEXT} />
          </svg>
          <span style={{ fontFamily: DISPLAY, fontSize: 32 }}>Shipped</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1.05 }}>{p.job.projectName}</span>
          <span style={{ fontSize: 32, color: NIGHT.text2, marginTop: 24, lineHeight: 1.35 }}>
            A real Python program, built for {client}.
          </span>
          {act ? <span style={{ fontSize: 26, color: NIGHT.text3, marginTop: 10 }}>{`Act ${ROMAN[act.number] ?? act.number}: ${act.subject}`}</span> : null}
        </div>
        {/* The client, on their colour, pleased with it. */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", flex: "none", width: 264, height: 272, background: tile.face, border: `4px solid ${OUTLINE}`, boxShadow: `8px 8px 0 ${OUTLINE}` }}>
          {look ? <OgPerson look={look} scale={5} expression="proud" pose="thumbs" /> : null}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, background: avatar, border: `4px solid ${OUTLINE}` }}>
          <OgPerson character={p.character} scale={2} crop="head" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 32 }}>{`Built by ${name}`}</span>
          <span style={{ fontSize: 22, color: NIGHT.text2, marginTop: 4 }}>{`${bareUrl(siteUrl())}/u/${slug}`}</span>
        </div>
      </div>
    </div>
  );
}

export function shareCard(p: SharedProject, slug: string, headers?: Record<string, string>): ImageResponse {
  return new ImageResponse(<Card p={p} slug={slug} />, { ...CARD_SIZE, fonts: ogFonts(), headers });
}
