// Service worker autodestrutivo: o site não usa mais SW.
// Navegadores que visitaram a versão antiga (cache-first) baixam este arquivo,
// que apaga todos os caches, se desregistra e recarrega as janelas abertas.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((c) => c.navigate(c.url));
    })()
  );
});
