// Certificates and share cards, drawn without pixel art: the PNG is the
// right size, the PDF holds the same picture on one A4 page, the verification address is the
// one the page lives at, and a shipped project's share card is a 1200 x 630 PNG.
import zlib from "node:zlib";
import { describe, expect, it } from "vitest";
import { CERTIFICATE_SIZE, actName, certificatePng, certificateUrl } from "@/components/certificates/CertificateImage";
import { pngToPdf } from "@/components/certificates/pdf";
import { decodePng, pngInfo } from "@/components/art/png";
import { CARD_SIZE, shareCard } from "@/app/u/[slug]/[jobId]/card/ShareCard";
import { getIndex, getJob } from "@/lib/content/server";
import type { Certificate } from "@/lib/server/certificates";

const act = getIndex().acts.find((a) => a.number === 4)!;
const cert: Certificate = { id: "k3x9q2m7a1b4", userId: "u1", actId: act.id, actNumber: 4, actTitle: act.title, name: "Łukasz Dvořák", projects: 14, issuedAt: "2026-10-30T10:00:00.000Z" };

describe("certificates", () => {
  it("are checked at /certificates/<id> on the site", () => {
    expect(certificateUrl(cert, "https://paulspythoncourse.example")).toBe("https://paulspythoncourse.example/certificates/k3x9q2m7a1b4");
    expect(certificateUrl(cert, "https://example.org/")).toBe("https://example.org/certificates/k3x9q2m7a1b4");
  });

  it("name the Act by its subject", () => {
    expect(actName(cert)).toBe(act.subject);
    expect(actName({ actId: "gone", actTitle: "An old title" })).toBe("An old title");
  });

  it("draw a PNG the shape of A4 landscape, with no background left clear", async () => {
    const png = await certificatePng(cert);
    expect(pngInfo(png)).toMatchObject(CERTIFICATE_SIZE);
    const { rgba, width } = decodePng(png);
    // Pale paper at the edge, inside it the green ruled border.
    expect([...rgba.subarray((700 * width + 4) * 4, (700 * width + 4) * 4 + 4)]).toEqual([251, 249, 241, 255]);
    expect([...rgba.subarray((700 * width + 50) * 4, (700 * width + 50) * 4 + 3)]).toEqual([28, 74, 58]);
  });

  it("make a one-page PDF of the same picture", async () => {
    const png = await certificatePng(cert);
    const pdf = pngToPdf(png, `Certificate: ${cert.name}`);
    const text = pdf.toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/Count 1");
    expect(text).toContain(`/Width ${CERTIFICATE_SIZE.width} /Height ${CERTIFICATE_SIZE.height}`);
    expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
    // The image stream inflates to exactly the picture's RGB.
    const start = text.indexOf("stream\n", text.indexOf("/Subtype /Image")) + 7;
    const length = Number(/\/Subtype \/Image[^>]*\/Length (\d+)/.exec(text)![1]);
    expect(zlib.inflateSync(pdf.subarray(start, start + length)).length).toBe(CERTIFICATE_SIZE.width * CERTIFICATE_SIZE.height * 3);
    // The xref offsets point at the objects.
    const xref = Number(/startxref\n(\d+)/.exec(text)![1]);
    expect(text.slice(xref, xref + 4)).toBe("xref");
  });
});

describe("share cards", () => {
  it("are a 1200 x 630 PNG", async () => {
    const job = getJob("bill-splitter")!;
    const res = shareCard({ name: "Maya Okafor", character: { kind: "human", colour: "#8C6BF2" } as never, job, files: {}, entry: "main.py", shippedAt: null }, "maya-o", { "Cache-Control": "public, max-age=600" });
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toBe("public, max-age=600");
    expect(pngInfo(new Uint8Array(await res.arrayBuffer()))).toMatchObject(CARD_SIZE);
  });
});
