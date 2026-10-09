const CACHE_NAME = "cartes-popote-app-v8";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./Logo.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./Messagerie.png", "./enveloppe.png", "./Jeton.png", "./Dos%20cartes.png", "./Jeton%20premium.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    await Promise.all(APP_SHELL.map(async (path) => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        console.warn("Élément du cache hors ligne indisponible :", path);
      }
    }));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("cartes-popote-app-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  if (APP_SHELL.some((path) => new URL(path, self.registration.scope).href === request.url)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
