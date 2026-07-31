/* 台风实况 Service Worker —— 离线缓存策略
 *
 * 策略分层：
 *   ① 应用外壳 (HTML/JS/CSS/Leaflet/图标) → cache-first，install 时预缓存
 *   ② CMA 数据 (typhoon.nmc.cn)          → network-first，成功后更新缓存；离线回退缓存
 *   ③ 高德瓦片 (autonavi.com)             → stale-while-revalidate，上限 300 张
 *   ④ 其他同源资源                       → cache-first，miss 时 fetch 并缓存
 *   ⑤ 跨域非上述                         → 不拦截，直接放行
 */

const VERSION = "typhoon-v3";

/* ===== 应用外壳（install 预缓存） ===== */
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./places.js",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/leaflet.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ===== CMA URL 规范化：去掉 t=/callback= 缓存破坏参数 ===== */
function cmaKey(url) {
  const u = new URL(url);
  if (u.hostname.endsWith("typhoon.nmc.cn")) {
    u.searchParams.delete("t");
    u.searchParams.delete("callback");
    return u.toString();
  }
  return url;
}

/* ===== network-first：CMA 数据 ===== */
async function cmaFetch(req) {
  const key = cmaKey(req.url);
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const clone = res.clone();
      // 异步存入缓存，不阻塞响应返回
      caches.open(VERSION).then(c => c.put(key, clone));
    }
    return res;
  } catch (_) {
    const cached = await caches.match(key);
    if (cached) return cached;
    throw new Error("SW: offline & no cached CMA data");
  }
}

/* ===== stale-while-revalidate：高德瓦片（带数量上限） ===== */
const TILE_CAP = 300;
async function tileFetch(req) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req);
  // 后台刷新
  const netP = fetch(req).then(res => {
    if (res && res.ok) { cache.put(req, res.clone()); trimTiles(cache); }
    return res;
  }).catch(() => null);
  return cached || netP || new Response("", { status: 503 });
}
async function trimTiles(cache) {
  const keys = await cache.keys();
  const tiles = keys.filter(k => /autonavi\.com/.test(k.url));
  if (tiles.length > TILE_CAP) {
    await Promise.all(tiles.slice(0, tiles.length - TILE_CAP).map(k => cache.delete(k)));
  }
}

/* ===== cache-first：同源外壳/资源 ===== */
async function shellFetch(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const clone = res.clone();
      caches.open(VERSION).then(c => c.put(req, clone));
    }
    return res;
  } catch (_) {
    // 离线且无缓存时 fallback 到 index.html（SPA 行为）
    return caches.match("./index.html") || new Response("Offline", { status: 503 });
  }
}

/* ===== 主拦截器 ===== */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // CMA 数据 → network-first
  if (url.hostname.endsWith("typhoon.nmc.cn")) {
    return e.respondWith(cmaFetch(req));
  }

  // 高德瓦片 → stale-while-revalidate
  if (/autonavi\.com$/.test(url.hostname)) {
    return e.respondWith(tileFetch(req));
  }

  // 同源资源 → cache-first
  if (url.origin === self.location.origin) {
    return e.respondWith(shellFetch(req));
  }

  // 其他跨域 → 放行
});
