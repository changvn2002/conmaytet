'use client';

import { useEffect, useState } from 'react';
import { FAQ_ITEMS, METHOD_POINTS } from '@/lib/content';
import { DATA_SOURCE_VI } from '@/lib/data';

/**
 * Tầng disclosure — nằm sau Cảnh 4, mặc định đóng, mở bằng một chạm.
 * Nội dung vẫn server-render vào HTML (SEO + JSON-LD ở page.tsx đọc cùng
 * nguồn lib/content.ts) dù nằm trong client component: Next vẫn SSR
 * client component ở lần tải đầu.
 *
 * Mục «Cách tính» mở được từ xa: nút «Cách tính ▸» ở Cảnh 2 bắn
 * CustomEvent 'conmaytet:open-cach-tinh' — component này nghe, mở
 * details rồi cuộn tới (việc cuộn để ở đây sau khi mở để nội dung
 * không nhảy vị trí giữa chừng).
 */
export function DisclosureSections() {
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#cach-tinh') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCalcOpen(true);
    }
    const open = () => {
      setCalcOpen(true);
      requestAnimationFrame(() => {
        document
          .getElementById('cach-tinh')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    window.addEventListener('conmaytet:open-cach-tinh', open);
    return () => window.removeEventListener('conmaytet:open-cach-tinh', open);
  }, []);

  return (
    <section aria-label="Cách tính và hỏi đáp" className="mt-12 space-y-4 pb-4">
      <details
        id="cach-tinh"
        open={calcOpen}
        onToggle={(e) => setCalcOpen(e.currentTarget.open)}
        className="rounded-2xl border border-line bg-card px-5 py-4 shadow-[var(--shadow-card)]"
      >
        <summary className="cursor-pointer font-semibold text-ink">
          Cách tính: còn bao nhiêu cái Tết với bố mẹ?
        </summary>
        <div className="mt-3 max-w-[34rem] space-y-3 leading-relaxed text-muted">
          <p className="text-base">
            Một người cha 65 tuổi không còn 73,7 − 65 năm. Đã đi qua rủi ro tuổi trẻ, kỳ vọng sống
            thêm của ông cao hơn phép trừ đó. Công cụ tra đúng kỳ vọng còn lại theo tuổi hiện tại,
            rồi đếm từng mùng 1 Tết bằng lịch âm Việt Nam (UTC+7).
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base">
            {METHOD_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="text-sm">{DATA_SOURCE_VI}</p>
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-card px-5 py-4 shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer font-semibold text-ink">Hỏi đáp</summary>
        <div className="mt-4 max-w-[34rem] space-y-5">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-ink">{f.q}</h3>
              <p className="mt-1 leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
