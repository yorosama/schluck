// Service Worker: speichert die App-Dateien, damit sie auch offline läuft.
// Tipp: Nach Änderungen an deinen Dateien die Versionsnummer erhöhen (v1 → v2),
// dann holt sich das Handy die neue Version.
const CACHE = "schluck-v2";

const DATEIEN = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Beim Installieren: alle Dateien in den Cache legen
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

// Alte Caches aufräumen, wenn eine neue Version aktiv wird
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Anfragen: erst Internet versuchen, sonst aus dem Cache (offline)
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const kopie = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopie));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
