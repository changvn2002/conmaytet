import { ConMayTetTool } from '@/components/conmaytet/app';
import { DisclosureSections } from '@/components/conmaytet/disclosure';
import { FAQ_ITEMS } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Trang chủ — khung server mỏng: AppBar 1 dòng, công cụ Scene Flow
 * (client), tầng disclosure (Cách tính + Hỏi đáp) và footer 2 dòng.
 * H1 duy nhất của trang nằm trong Cảnh 1 của công cụ («Đếm thử: còn
 * mấy cái Tết bên bố mẹ?»), header không còn tagline (diệt tell trùng
 * tên) và không sticky. FAQ hiển thị và JSON-LD FAQPage cùng lấy từ
 * lib/content.ts nên không bao giờ lệch nhau.
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
    <div className="mx-auto flex min-h-dvh w-full max-w-[45rem] flex-col px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="flex items-center gap-3 border-b border-line py-3">
        {/* Lockup V4: mark «Một Vòng Năm» + wordmark Baloo 2 800 outline
            đã nằm trong chính file SVG — header không còn chữ HTML. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/brand/conmaytet-lockup.svg"
          alt="Còn Mấy Cái Tết Nữa?"
          className="h-9 w-auto"
        />
      </header>

      <main className="flex-1">
        <ConMayTetTool />
        <DisclosureSections />
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
