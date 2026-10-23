'use client';

import { useEffect } from 'react';

/**
 * Đăng ký service worker (W5-01) — component không có giao diện, mount
 * một lần duy nhất trong app/layout.tsx. SW viết tay ở public/sw.js
 * precache app shell ngay lần tải đầu có mạng, để các lần mở sau — kể
 * cả khi mất mạng — vào thẳng giao diện thật từ cache.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Đăng ký thất bại (trình duyệt quá cũ, một số chế độ riêng tư…)
      // thì bỏ qua lặng lẽ: app vẫn chạy online như thường, chỉ là
      // không có khả năng offline — không đáng để báo lỗi cho người dùng.
    });
  }, []);

  return null;
}
