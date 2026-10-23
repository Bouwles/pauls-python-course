// Service worker: keeps Python in the browser's cache so the second visit is
// quick and the Harbour Front works offline once loaded (Section 10.1).
// Generated into public/sw.js by scripts/copy-pyodide.ts with the version filled in.
const VERSION = "__PYODIDE_VERSION__";
const RUNTIME = `ppc-pyodide-${VERSION}`;
const PACKAGES = `ppc-packages-${VERSION}`;
const CODE = "ppc-python-code";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("ppc-") && ![RUNTIME, PACKAGES, CODE].includes(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith("/pyodide/")) {
    event.respondWith(cacheFirst(request, RUNTIME));
  } else if (url.origin === self.location.origin && (url.pathname.startsWith("/python/") || url.pathname === "/py-worker.mjs")) {
    event.respondWith(networkFirst(request, CODE));
  } else if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/pyodide/")) {
    event.respondWith(cacheFirst(request, PACKAGES));
  }
});
