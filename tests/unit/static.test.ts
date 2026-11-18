import { afterEach, describe, expect, it, vi } from "vitest";

// lib/static.ts reads which build this is when it loads, so each case loads it afresh.
async function load(env: { base?: string; pages?: boolean }) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_BASE_PATH", env.base ?? "");
  vi.stubEnv("NEXT_PUBLIC_PPC_STATIC", env.pages ? "1" : "");
  return import("@/lib/static");
}

afterEach(() => vi.unstubAllEnvs());

describe("a plain link to a page of the course", () => {
  it("is left alone in the local version", async () => {
    const { page } = await load({});
    expect(page("/job/bill-splitter")).toBe("/job/bill-splitter");
    expect(page("/drills?concept=print")).toBe("/drills?concept=print");
    expect(page("/api/auth/oauth/github")).toBe("/api/auth/oauth/github");
  });

  it("stays inside the site on GitHub Pages: the base in front, and the folder's closing slash", async () => {
    const { page } = await load({ base: "/pauls-python-course", pages: true });
    // Without the base this is github.io/job/bill-splitter: GitHub's own 404 page.
    expect(page("/job/bill-splitter")).toBe("/pauls-python-course/job/bill-splitter/");
    expect(page("/")).toBe("/pauls-python-course/");
    expect(page("/map")).toBe("/pauls-python-course/map/");
    expect(page("/job/shop-sign?step=make")).toBe("/pauls-python-course/job/shop-sign/?step=make");
    expect(page("/handbook/strings#slicing")).toBe("/pauls-python-course/handbook/strings/#slicing");
    expect(page("/ppc.zip")).toBe("/pauls-python-course/ppc.zip");
    // Already there, or not a page of the course at all.
    expect(page("/pauls-python-course/shelf/")).toBe("/pauls-python-course/shelf/");
    expect(page("https://www.python.org/downloads")).toBe("https://www.python.org/downloads");
    expect(page("//example.com/x")).toBe("//example.com/x");
    expect(page("#main")).toBe("#main");
    expect(page("mailto:someone@example.com")).toBe("mailto:someone@example.com");
  });
});
