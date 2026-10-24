'use client';

import { useEffect, useState } from 'react';
import { IconWifiOff } from './icons';

/**
 * Dải chỉ báo offline (W5-01) — đặt ngay dưới AppBar, trên Cảnh 1, chỉ
 * hiện khi mất mạng và tự ẩn khi có mạng lại.
 *
 * Giọng văn theo Hope Rule: mất mạng không phải lỗi của người dùng và
 * không trình bày như sự cố — trấn an trước («không sao»), nói rõ app
 * vẫn dùng được sau. App thuần client-side nên mọi chức năng (tính
 * Tết, lưới tuần, tạo ảnh thẻ) chạy offline nguyên trạng; dải này chỉ
 * là thông tin cộng thêm, không khoá hay vô hiệu hoá bất cứ thứ gì.
 */
export function OfflineBar() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Đọc navigator.onLine SAU khi mount: bản render phía server luôn
    // coi như đang có mạng (offline = false) nên không lệch hydration;
    // sau mount mới đồng bộ theo trạng thái thật của trình duyệt.
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="status" className="bg-brand-tint px-4 py-3 text-brand-strong">
      <p className="flex items-start gap-2 text-sm leading-relaxed">
        <IconWifiOff aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
        <span>
          Bạn đang không có mạng — không sao, app vẫn tính Tết và tạo ảnh thẻ được như thường.
        </span>
      </p>
    </div>
  );
}

export default OfflineBar;
