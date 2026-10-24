import { ConMayTetTool } from '@/components/conmaytet/app';
import { FAQ_ITEMS } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Trang chủ — khung server mỏng: topbar 1 dòng (mark + wordmark),
 * công cụ Scene Flow (client) và footer 2 dòng. Tầng disclosure
 * (Cách tính + Hỏi đáp + Quyền riêng tư) do chính công cụ render ở
 * cuối luồng của nó (vòng 4, H5: khi có kết quả, Cách tính + Hỏi
 * đáp chuyển vào cột phải của cảnh Chia sẻ). H1 duy nhất của trang
 * nằm trong thẻ hero của Cảnh 1 («Đếm thử: còn mấy cái Tết bên bố
 * mẹ?»); header không sticky. FAQ hiển thị và JSON-LD FAQPage cùng
 * lấy từ lib/content.ts nên không bao giờ lệch nhau.
 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[72rem] flex-col px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="flex items-center gap-3 border-b border-line py-3">
        {/* Topbar hệ lens-04: tile mark seed + glyph cành trắng (asset
            SVG) + wordmark chữ HTML Baloo 2 800; bên phải là dòng riêng
            tư rút gọn (ẩn trên mobile hẹp). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/brand/conmaytet-mark.svg"
          alt=""
          aria-hidden
          className="h-9 w-9 rounded-[10px]"
        />
        <p className="font-display text-[16.5px] leading-tight font-extrabold text-ink">
          Còn Mấy Cái Tết Nữa?
        </p>
        <p className="ml-auto hidden text-[12.5px] font-medium text-muted sm:block">
          Không tài khoản, không gửi dữ liệu đi.
        </p>
      </header>

      <main className="flex-1">
        <ConMayTetTool />
      </main>

      <footer className="border-t border-line py-6 text-sm text-muted">
        <p>
          {SITE_NAME} · {SITE_URL.replace('https://', '')}
        </p>
        <p className="mt-1">Mọi con số là trung bình thống kê, không phải dự đoán cá nhân.</p>
      </footer>
    </div>
  );
}
