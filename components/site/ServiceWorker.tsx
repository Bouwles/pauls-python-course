"use client";

import { useEffect } from "react";
import { BASE, STATIC } from "@/lib/static";

/**
 * Registers the service worker that caches Python (public/sw.js). On GitHub Pages it also makes
 * the page cross-origin isolated, which input() and Stop need: the first time it takes over, the
 * page reloads once so every response comes through it with the headers.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const reloadOnce = () => {
      if (!STATIC || window.crossOriginIsolated) return;
      try {
        if (sessionStorage.getItem("ppc-isolated")) return;
        sessionStorage.setItem("ppc-isolated", "1");
      } catch {
        return;
      }
      window.location.reload();
    };
    const register = () =>
      void navigator.serviceWorker
        .register(`${BASE}/sw.js`, { scope: `${BASE}/` })
        .then(() => {
          if (navigator.serviceWorker.controller) reloadOnce();
          else navigator.serviceWorker.addEventListener("controllerchange", reloadOnce, { once: true });
        })
        .catch(() => {});
    // On GitHub Pages, as soon as possible: Python can't take input until it's in charge.
    if (STATIC || document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
