import { CalendarHeart, ShieldCheck, TableProperties } from 'lucide-react';
import { ConMayTetTool } from '@/components/conmaytet/app';
import { FAQ_ITEMS, METHOD_POINTS } from '@/lib/content';
import { DATA_SOURCE_VI } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Trang chủ — render phía server phần nội dung tĩnh (H1, giải thích, cách
 * tính, FAQ) để công cụ tìm kiếm đọc được đầy đủ; phần tương tác nằm trong
 * ConMayTetTool (client component). FAQ hiển thị và JSON-LD FAQPage cùng
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
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="flex items-center gap-3 border-b border-line py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/brand/conmaytet-logo.svg"
          alt="Logo Còn Mấy Cái Tết Nữa? — hoa mai năm cánh"
          width={44}
          height={44}
        />
        <div>
          <p className="font-display text-xl leading-tight font-bold text-ink">{SITE_NAME}</p>
          <p className="text-sm text-muted">Đếm số Tết còn bên bố mẹ — theo thống kê tuổi thọ</p>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <h1 className="font-display mt-2 text-3xl leading-tight font-bold text-ink sm:text-4xl">
          Còn Mấy Cái Tết Nữa?
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Bạn còn bao nhiêu cái Tết với bố mẹ? Nếu mỗi năm chỉ về nhà một, hai lần, số lần sum vầy
          còn lại ít hơn chúng ta tưởng rất nhiều. Nhập năm sinh của bạn và của bố mẹ — công cụ sẽ
          ước tính <strong className="text-ink">còn khoảng bao nhiêu cái Tết với bố mẹ</strong> và{' '}
          <strong className="text-ink">còn khoảng bao nhiêu lần gặp nữa</strong>, dựa trên bảng tuổi
          thọ trung bình của người Việt Nam. Đây là ước tính thống kê để trân trọng thời gian bên
          gia đình — không phải bói toán, cũng không phải dự đoán cho bất kỳ ai.
        </p>

        <div className="mt-6">
          <ConMayTetTool />
        </div>

        {/* ── Nội dung giải thích (SEO + minh bạch phương pháp) ── */}
        <section aria-labelledby="why" className="mt-14">
          <h2 id="why" className="font-display text-2xl font-bold text-ink">
            Vì sao nên đếm số Tết còn lại với bố mẹ?
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            <p>
              Khi còn nhỏ, chúng ta sống cùng bố mẹ mỗi ngày nên cứ ngỡ thời gian bên nhau là vô
              hạn. Đi học, đi làm xa, nhịp gặp gỡ thưa dần: nhiều người một năm chỉ về nhà đúng dịp
              Tết và thêm một, hai lần ngắn ngủi. Nếu bố mẹ còn khoảng 15 năm theo tuổi thọ kỳ vọng
              trung bình, và bạn về thăm 2 lần mỗi năm, thì tổng số lần gặp còn lại chỉ khoảng 30 —
              và số cái Tết còn được ngồi chung mâm cơm giao thừa là khoảng 15.
            </p>
            <p>
              Con số không nhằm làm ai buồn. Nó chỉ biến một cảm giác mơ hồ (“để Tết sau cũng được”)
              thành một kế hoạch cụ thể: năm nay về sớm hơn một ngày, gọi điện mỗi tuần thay vì mỗi
              tháng, hay đơn giản là ngồi lâu hơn bên mâm cơm. Rất nhiều người sau khi nhìn thấy con
              số của gia đình mình đã quyết định về thăm bố mẹ nhiều hơn — và đó chính là mục đích
              của công cụ này.
            </p>
          </div>
        </section>

        <section aria-labelledby="how" className="mt-12">
          <h2 id="how" className="font-display text-2xl font-bold text-ink">
            Cách tính: còn bao nhiêu cái Tết với bố mẹ?
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            <p>
              Công cụ tra <strong className="text-ink">tuổi thọ kỳ vọng còn lại</strong> theo đúng
              độ tuổi hiện tại và giới tính của bố/mẹ trong bảng sống Việt Nam — cách tính chuẩn của
              thống kê dân số. Điểm này rất quan trọng: một người cha 65 tuổi không “còn” 73,7 − 65
              năm như phép trừ từ tuổi thọ khi sinh; vì đã vượt qua các rủi ro tử vong ở tuổi trẻ,
              kỳ vọng sống thêm của ông cao hơn hẳn. Sau đó, công cụ đếm số ngày mùng 1 Tết Nguyên
              Đán trong khoảng kỳ vọng đó bằng thuật toán âm lịch Việt Nam theo múi giờ UTC+7 — mỗi
              năm đúng một cái Tết.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {METHOD_POINTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="text-sm">{DATA_SOURCE_VI}</p>
          </div>
        </section>

        <section aria-labelledby="faq" className="mt-12">
          <h2 id="faq" className="font-display text-2xl font-bold text-ink">
            Câu hỏi thường gặp
          </h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl border border-line bg-card px-5 py-4"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 flex items-center gap-2 font-display font-bold text-ink">
              <CalendarHeart size={17} className="text-brand" /> Đếm Tết thật, không đoán mò
            </p>
            <p className="text-sm text-muted">
              Số Tết còn lại được đếm từ lịch âm Việt Nam thật (thuật toán Hồ Ngọc Đức, UTC+7),
              không phải lấy số năm làm tròn cho có.
            </p>
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-2 font-display font-bold text-ink">
              <TableProperties size={17} className="text-brand" /> Số liệu có nguồn rõ ràng
            </p>
            <p className="text-sm text-muted">
              Tuổi thọ kỳ vọng lấy từ bảng sống Việt Nam của WHO, tra theo đúng tuổi hiện tại và
              giới tính — ghi nguồn ngay dưới kết quả.
            </p>
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-2 font-display font-bold text-ink">
              <ShieldCheck size={17} className="text-brand" /> Riêng tư & không tài khoản
            </p>
            <p className="text-sm text-muted">
              Không đăng nhập, không máy chủ — dữ liệu nằm trong trình duyệt của bạn và xoá được bất
              cứ lúc nào.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          {SITE_NAME} — công cụ ước tính thống kê miễn phí tại {SITE_URL.replace('https://', '')}.
          Mọi con số là trung bình thống kê, không phải dự đoán cá nhân.
        </p>
      </footer>
    </div>
  );
}
