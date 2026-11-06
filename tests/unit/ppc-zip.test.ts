// The ppc tool as a download (lib/ppc-zip.ts): the same package locally and on GitHub Pages, with
// the course's address written in, and on Pages marked as the copy for a course with no accounts.
import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import { ppcZip } from "@/lib/ppc-zip";

const site = (bytes: Uint8Array) => {
  const files = unzipSync(bytes);
  const name = Object.keys(files).find((n) => n.endsWith("src/ppc/_site.py"))!;
  return { names: Object.keys(files), text: strFromU8(files[name]!) };
};

describe("ppc.zip", () => {
  it("is the CLI as a source package, under one folder", () => {
    const { name, bytes } = ppcZip("http://localhost:3000");
    expect(name).toMatch(/^ppc-cli-\d+\.\d+\.\d+\.zip$/);
    const { names } = site(bytes);
    expect(names).toEqual(expect.arrayContaining([`${name.replace(/\.zip$/, "")}/pyproject.toml`, `${name.replace(/\.zip$/, "")}/src/ppc/cli.py`]));
    expect(names.some((n) => n.includes("__pycache__"))).toBe(false);
  });

  it("knows the course it came from, and on GitHub Pages that there are no accounts", () => {
    expect(site(ppcZip("http://localhost:3000").bytes).text).toContain('DEFAULT_SITE = "http://localhost:3000"\n');
    expect(site(ppcZip("http://localhost:3000").bytes).text).toContain("STATIC = False");
    const pages = site(ppcZip("https://bouwles.github.io/pauls-python-course/", { pages: true }).bytes).text;
    expect(pages).toContain('DEFAULT_SITE = "https://bouwles.github.io/pauls-python-course"\n');
    expect(pages).toContain("STATIC = True");
  });
});
