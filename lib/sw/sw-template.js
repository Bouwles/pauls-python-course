// Service worker: keeps Python in the browser's cache so the second visit is quick and the course
// works offline once loaded (Section 10.1). Generated into public/sw.js by scripts/copy-pyodide.ts
// with the version filled in, and ISOLATE on for the GitHub Pages build.
//
// GitHub Pages can't send headers, but input() and Stop need the page to be cross-origin
// isolated (SharedArrayBuffer). So on GitHub Pages this worker adds the isolation headers to
// every response itself, and the page reloads once when it first takes over
// (components/site/ServiceWorker.tsx). Locally the server sends the headers and this is off.
const VERSION = "__PYODIDE_VERSION__";
const ISOLATE = __ISOLATE__;
const RUNTIME = `ppc-pyodide-${VERSION}`;
const PACKAGES = `ppc-packages-${VERSION}`;
const CODE = "ppc-python-code";
// Where the site lives: "/" locally, "/pauls-python-course/" on GitHub Pages.
const BASE = new URL(self.registration.scope).pathname;

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

/** The same response with the headers that make the page cross-origin isolated. */
function isolated(response) {
  if (response.status === 0 || response.type === "opaqueredirect") return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;
  const url = new URL(request.url);
  const here = url.origin === self.location.origin;
  let answer = null;
  if (here && url.pathname.startsWith(`${BASE}pyodide/`)) answer = cacheFirst(request, RUNTIME);
  else if (here && (url.pathname.startsWith(`${BASE}python/`) || url.pathname === `${BASE}py-worker.mjs`)) answer = networkFirst(request, CODE);
  else if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/pyodide/")) answer = cacheFirst(request, PACKAGES);
  else if (ISOLATE && here) answer = fetch(request);
  if (!answer) return;
  event.respondWith(ISOLATE ? answer.then(isolated) : answer);
});
