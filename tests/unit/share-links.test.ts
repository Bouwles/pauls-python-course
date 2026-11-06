// The links that carry a certificate, a shared project or a whole Shelf (lib/share-links.ts): they
// read back as they were made, keep a sensible length, and trust nothing that arrives.
import { describe, expect, it } from "vitest";
import { deflateSync, strToU8 } from "fflate";
import { defaultAvatar } from "@/lib/avatar";
import { toBase64Url } from "@/lib/classes/link";
import {
  PROJECT_TARGET,
  SHARE_LIMITS,
  SHELF_TARGET,
  decodeShare,
  encodeCertificate,
  encodeProject,
  encodeShelf,
  packShare,
  playingAsLine,
  shareUrl,
  unpackShare,
  type CertificateLink,
  type Maker,
  type ProjectLink,
  type ShelfLink,
} from "@/lib/share-links";

const ruth: Maker = { name: "Ruth Okafor", playAs: null, look: { ...defaultAvatar(), hair: "afro", glasses: true } };
const asNeil: Maker = { name: "Ruth Okafor", playAs: "neil", look: null };
const cert: CertificateLink = { maker: ruth, act: 4, projects: 14, day: "2026-11-06" };
const project: ProjectLink = { maker: ruth, jobId: "bill-splitter", shippedAt: 1_762_450_000_000, files: [{ name: "main.py", content: 'print("Split the bill")\n' }], cut: false };
const raw = (value: unknown) => `1.${toBase64Url(deflateSync(strToU8(JSON.stringify(value))))}`;

describe("certificate links", () => {
  it("read back as they were made, look and all", () => {
    const got = decodeShare(encodeCertificate(cert), ["cert"]);
    expect(got).toEqual({ ok: true, value: { kind: "cert", value: cert } });
  });

  it("stay short enough to print, send or scan", () => {
    expect(encodeCertificate(cert).length).toBeLessThan(200);
    expect(shareUrl("https://bouwles.github.io", "/pauls-python-course", "cert", "1.abc")).toBe("https://bouwles.github.io/pauls-python-course/certificate/#1.abc");
  });

  it("drop their own look when playing as one of the class, who is drawn instead", () => {
    const got = decodeShare(encodeCertificate({ ...cert, maker: { ...asNeil, look: ruth.look } }), ["cert"]);
    expect(got.ok && got.value.kind === "cert" && got.value.value.maker).toEqual({ name: "Ruth Okafor", playAs: "neil", look: null });
  });

  it("refuse an Act, a count or a day that can't be real", () => {
    for (const bad of [{ a: 0 }, { a: 99 }, { a: 2.5 }, { p: 0 }, { p: -3 }, { d: "2026-02-30" }, { d: "yesterday" }, { m: "Ruth" }]) {
      const got = decodeShare(raw({ k: "cert", m: ["Ruth", 0, 0], a: 4, p: 14, d: "2026-11-06", ...bad }), ["cert"]);
      expect(got).toEqual({ ok: false, problem: "broken" });
    }
  });

  it("clean names: hidden characters out, long ones cut, an empty one becomes A learner", () => {
    const sneaky = decodeShare(raw({ k: "cert", m: [`Ru${String.fromCharCode(0x200b)}th${String.fromCharCode(0x202e)}  Okafor`, 0, 0], a: 1, p: 13, d: "2026-11-06" }), ["cert"]);
    expect(sneaky.ok && sneaky.value.kind === "cert" && sneaky.value.value.maker.name).toBe("Ruth Okafor");
    const long = decodeShare(raw({ k: "cert", m: ["x".repeat(500), 0, 0], a: 1, p: 13, d: "2026-11-06" }), ["cert"]);
    expect(long.ok && long.value.kind === "cert" && long.value.value.maker.name.length).toBe(SHARE_LIMITS.name);
    const empty = decodeShare(raw({ k: "cert", m: ["   ", 0, 0], a: 1, p: 13, d: "2026-11-06" }), ["cert"]);
    expect(empty.ok && empty.value.kind === "cert" && empty.value.value.maker.name).toBe("A learner");
  });

  it("say playing as only when it isn't just them", () => {
    const names = { neil: "Neil", riya: "Riya" };
    expect(playingAsLine(asNeil, names)).toBe("Playing as Neil");
    expect(playingAsLine({ name: "Riya", playAs: "riya", look: null }, names)).toBeNull();
    expect(playingAsLine(ruth, names)).toBeNull();
  });
});

describe("a shared project", () => {
  it("reads back with its code", () => {
    const { hash, cut } = encodeProject(project);
    expect(cut).toBe(false);
    expect(decodeShare(hash, ["project", "shelf"])).toEqual({ ok: true, value: { kind: "project", value: project } });
  });

  it("cuts long code until the link fits, and says so", () => {
    const big = Array.from({ length: 4000 }, (_, i) => `print(${i * 7919 % 10007}, "${(i * 2654435761 % 4294967296).toString(36)}")`).join("\n");
    const { hash, cut } = encodeProject({ ...project, files: [{ name: "main.py", content: big }, { name: "helpers.py", content: big.slice(0, 3000) }] });
    expect(cut).toBe(true);
    expect(hash.length).toBeLessThanOrEqual(PROJECT_TARGET);
    const got = decodeShare(hash, ["project"]);
    expect(got.ok && got.value.kind === "project" && got.value.value.cut).toBe(true);
  });

  it("refuses file names that climb out of the project, and code that isn't text", () => {
    for (const f of [["../secrets.py", "x"], ["/etc/passwd", "x"], [".hidden", "x"], ["main.py", 42]]) {
      expect(decodeShare(raw({ k: "project", m: ["Ruth", 0, 0], j: "bill-splitter", t: 0, f: [f], c: 0 }), ["project"])).toEqual({ ok: false, problem: "broken" });
    }
  });

  it("keeps at most ten files, each capped", () => {
    const files = Array.from({ length: 14 }, (_, i) => [`f${i}.py`, "y".repeat(25_000)]);
    const got = decodeShare(raw({ k: "project", m: ["Ruth", 0, 0], j: "bill-splitter", t: 0, f: files, c: 0 }), ["project"]);
    expect(got.ok && got.value.kind === "project" && got.value.value.files.length).toBe(SHARE_LIMITS.files);
    expect(got.ok && got.value.kind === "project" && got.value.value.files[0]!.content.length).toBe(SHARE_LIMITS.fileChars);
  });
});

describe("a shared Shelf", () => {
  const shelf: ShelfLink = {
    maker: asNeil,
    items: [
      { jobId: "shop-sign", shippedAt: 1_762_000_000_000, files: [{ name: "main.py", content: 'print("Open")\n' }] },
      { jobId: "bill-splitter", shippedAt: null, files: null },
    ],
  };

  it("lists every project, with code where it came", () => {
    const { hash, leftOut } = encodeShelf(shelf);
    expect(leftOut).toBe(0);
    expect(decodeShare(hash, ["project", "shelf"])).toEqual({ ok: true, value: { kind: "shelf", value: shelf } });
  });

  it("leaves code out, biggest first, until it fits, and counts only code that didn't", () => {
    // Different numbers in every project, so they don't squash into each other.
    const noisy = (n: number, seed: number) => Array.from({ length: n }, (_, i) => `x${i} = ${((i + seed * 10_000) * 2654435761) % 4294967296}`).join("\n");
    const items = Array.from({ length: 12 }, (_, i) => ({ jobId: `project-${i}`, shippedAt: null, files: [{ name: "main.py", content: noisy(60 + i * 25, i) }] }));
    const { hash, leftOut } = encodeShelf({ maker: ruth, items: [...items, { jobId: "built-at-home", shippedAt: null, files: null }] });
    expect(hash.length).toBeLessThanOrEqual(SHELF_TARGET);
    expect(leftOut).toBeGreaterThan(0);
    const got = decodeShare(hash, ["shelf"]);
    if (!got.ok || got.value.kind !== "shelf") throw new Error("didn't read");
    const kept = got.value.value.items;
    expect(kept).toHaveLength(13);
    expect(kept.filter((i) => !i.files)).toHaveLength(leftOut + 1);
    // The biggest went first: whatever kept its code is smaller than whatever lost it.
    const sizes = (have: boolean) => kept.filter((i) => i.jobId !== "built-at-home" && Boolean(i.files) === have).map((i) => Number(i.jobId.split("-")[1]));
    expect(Math.max(...sizes(true))).toBeLessThan(Math.min(...sizes(false)));
  });
});

describe("links that don't read", () => {
  it("say why", () => {
    expect(unpackShare("")).toEqual({ ok: false, problem: "empty" });
    expect(unpackShare("#")).toEqual({ ok: false, problem: "empty" });
    expect(unpackShare("hello")).toEqual({ ok: false, problem: "broken" });
    expect(unpackShare("1.!!!")).toEqual({ ok: false, problem: "broken" });
    expect(unpackShare(`9.${encodeCertificate(cert).slice(2)}`)).toEqual({ ok: false, problem: "newer" });
    expect(unpackShare(`1.${"A".repeat(SHARE_LIMITS.hash + 10)}`)).toEqual({ ok: false, problem: "too-long" });
    expect(decodeShare(encodeCertificate(cert), ["project", "shelf"])).toEqual({ ok: false, problem: "wrong-kind", kind: "cert" });
    expect(decodeShare(packShare({ k: "join" }), ["cert"])).toEqual({ ok: false, problem: "broken" });
  });

  it("survive being wrapped by an email, or a full stop after them", () => {
    const hash = encodeCertificate(cert);
    expect(decodeShare(`#${hash.slice(0, 30)}\n  ${hash.slice(30)}.`, ["cert"]).ok).toBe(true);
  });

  it("won't unpack a small link into something huge", () => {
    const bomb = `1.${toBase64Url(deflateSync(strToU8(JSON.stringify({ k: "cert", pad: "a".repeat(5_000_000) })), { level: 9 }))}`;
    expect(bomb.length).toBeLessThan(SHARE_LIMITS.hash);
    expect(unpackShare(bomb)).toEqual({ ok: false, problem: "broken" });
  });
});
