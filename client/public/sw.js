// Service Worker mínimo para habilitar instalação como PWA
// (Network-first, sem cache agressivo — assim atualizações chegam rápido)
const VERSION = "v1.0.0";
const RUNTIME = `short-stay-runtime-${VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== RUNTIME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Apenas GET; ignora analytics e API
  if (req.method !== "GET") return;
  if (req.url.includes("/umami")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cacheia respostas válidas para offline básico
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(RUNTIME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
  );
});
