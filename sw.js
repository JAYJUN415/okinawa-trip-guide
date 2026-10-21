// 오프라인용 서비스워커. 페이지·사진·지도 타일은 캐시 우선, 날씨·경로·환율은 네트워크 우선(실패 시 캐시).
const CACHE = 'oki-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const live = /open-meteo|frankfurter|project-osrm/.test(url.host) || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (live) {
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); return res; }).catch(() => caches.match(req, { ignoreSearch: false })));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })));
  }
});
