// Service worker của app AI 10: giữ bản app trong máy để mở được khi mất mạng.
// Chỉ lưu các tệp của chính app (cùng thư mục). Dữ liệu gửi Google Sheet và thư viện Python không đi qua đây.
const BAN = "ai10-v1-20261117";
const TEP = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(BAN).then(c => c.addAll(TEP)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ds => Promise.all(ds.filter(k => k.startsWith("ai10-") && k !== BAN).map(k => caches.delete(k))))   // chỉ xoá bản cũ của AI 10, không đụng bản lưu của Cổng sẵn sàng (cùng tên miền).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;            // Google Sheet, CDN: để trình duyệt tự xử lý
  if (e.request.mode === "navigate" || u.pathname.endsWith("/index.html") || u.pathname.endsWith("/")) {
    // trang app: có mạng thì lấy bản mới nhất (và cập nhật bản lưu), mất mạng thì dùng bản đã lưu
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(BAN).then(k => k.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
