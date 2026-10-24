/**
 * Service worker — Còn Mấy Cái Tết Nữa? (W5-01, viết tay, không thư viện).
 *
 * Chiến lược cache:
 * - App shell (cache `shell`): precache các URL ỔN ĐỊNH (không hash)
 *   lúc install — trang gốc, manifest, icon PWA, favicon, lockup, hero
 *   và ảnh OG — để app mở được offline ngay từ lần tải thứ hai.
 * - Runtime (cache `runtime`): tài nguyên biến thiên theo bản build.
 *   `/_next/static/` dùng cache-first (tên file có hash nội dung,
 *   không bao giờ đổi nội dung dưới cùng một URL); điều hướng
 *   (navigation) network-first, mất mạng thì trả app shell '/' đã
 *   cache; request GET same-origin còn lại network-first có fallback
 *   cache.
 * - Chỉ can thiệp GET same-origin. Cross-origin: bỏ qua hoàn toàn
 *   (không respondWith) — app không có request ngoài nào, và SW không
 *   được phép đụng vào request của origin khác.
 *
 * App thuần client-side nên sau khi shell đã cache, toàn bộ Scene
 * Flow (nhập liệu, tính toán, lưới tuần, tạo ảnh thẻ bằng canvas)
 * chạy offline hoàn toàn — SW này không khoá hay degrade bước nào.
 *
 * Cách bump version khi deploy bản mới: tăng CACHE_VERSION (đặt theo
 * ngày deploy, vd 'v2-2026-11-01'). activate() xoá MỌI cache không
 * thuộc version hiện tại, nên chỉ cần đổi hằng số này là client tự
 * dọn cache cũ và precache lại shell mới ở lần ghé tiếp theo.
 */

const CACHE_VERSION = 'v5-2026-10-24';
const SHELL_CACHE = `conmaytet-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `conmaytet-runtime-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE];

// URL ổn định (không hash) — precache lúc install.
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
  '/products/brand/conmaytet-lockup.svg',
  '/products/brand/conmaytet-branch.svg',
  '/products/brand/conmaytet-mark.svg',
  '/og.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** cache-first: dùng cho tài nguyên tên file có hash (/_next/static/). */
function cacheFirst(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        }),
    ),
  );
}

/** network-first: ưu tiên bản mới; mất mạng thì lùi về cache (nếu có). */
function networkFirst(request, fallbackUrl) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (fallbackUrl) {
        const shell = await caches.match(fallbackUrl);
        if (shell) return shell;
      }
      throw new Error('offline và không có bản cache cho request này');
    });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Chỉ can thiệp GET; method khác (POST…) đi thẳng ra mạng.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin: bỏ qua, không respondWith.
  if (url.origin !== self.location.origin) return;

  // Điều hướng trang: network-first, offline thì trả app shell '/'.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'));
    return;
  }

  // Bundle Next có hash trong tên file: cache-first vào runtime cache.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Còn lại (GET same-origin): network-first có fallback cache.
  event.respondWith(networkFirst(request));
});
