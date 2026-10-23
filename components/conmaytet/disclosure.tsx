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
        <summary className="min-h-11 cursor-pointer py-[10px]">
          {/* H2 trong summary: cây heading hết nhảy H1→H3 ở trạng
              thái mặc định (TC-2, Panel #01). H2 phải để inline:
              summary flex hoặc H2 block đều đẩy ::marker (mũi tên
              disclosure) sang dòng riêng/khỏi hộp trong Chrome —
              inline giữ marker + tiêu đề cùng dòng như thiết kế
              gốc. py-[10px] + min-h-11 nâng summary 1 dòng lên
              đúng vùng chạm 44px của panel. */}
          <h2 className="inline font-semibold text-ink">
            Cách tính: còn bao nhiêu cái Tết với bố mẹ?
          </h2>
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
        <summary className="min-h-11 cursor-pointer py-[10px]">
          <h2 className="inline font-semibold text-ink">Hỏi đáp</h2>
        </summary>
        <div className="mt-4 max-w-[34rem] space-y-5">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-ink">{f.q}</h3>
              <p className="mt-1 leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-line bg-card px-5 py-4 shadow-[var(--shadow-card)]">
        <summary className="min-h-11 cursor-pointer py-[10px]">
          <h2 className="inline font-semibold text-ink">Quyền riêng tư & dữ liệu của bạn</h2>
        </summary>
        <div className="mt-3 max-w-[34rem] space-y-3 leading-relaxed text-muted">
          <p className="text-base">
            Dữ liệu bạn nhập — ngày sinh và giới tính của bạn, năm sinh của bố và của mẹ, số lần về
            thăm mỗi năm (hoặc chế độ đang sống cùng bố mẹ) — chỉ lưu trong localStorage của trình
            duyệt trên chính máy bạn, ở khoá conmaytet:input:v1. App không có tài khoản, không có
            máy chủ thu thập dữ liệu và không gắn công cụ theo dõi.
          </p>
          <p className="text-base">
            Chia sẻ là do bạn chủ động bấm: đoạn chữ và ảnh thẻ đều được tạo ngay trên máy bạn, app
            không tự gửi dữ liệu đi đâu.
          </p>
          <p className="text-base">
            Muốn xoá, bấm «Làm lại từ đầu» ở cuối trang rồi xác nhận — dữ liệu đã lưu sẽ bị xoá
            ngay; nếu bấm nhầm, bạn có 8 giây để bấm «Hoàn tác». Xoá dữ liệu duyệt web của trình
            duyệt cũng xoá dữ liệu này.
          </p>
          <p className="text-base">
            Câu hỏi hay góp ý, hãy mở một issue tại{' '}
            <a
              href="https://github.com/changvn2002/conmaytet/issues"
              className="font-semibold text-brand underline"
            >
              GitHub Issues của dự án
            </a>
            .
          </p>
        </div>
      </details>
    </section>
  );
}
