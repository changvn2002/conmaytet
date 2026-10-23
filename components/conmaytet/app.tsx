'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarHeart,
  Copy,
  Download,
  Eraser,
  Flower2,
  Home,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import { calculate, validateInput } from '@/lib/calc';
import { DATA_SOURCE_VI } from '@/lib/data';
import { buildShareText, drawShareCard } from '@/lib/share-card';
import { clearInput, loadInput, saveInput } from '@/lib/storage';
import type { InputData, LifeGrid, ParentEstimate, Sex } from '@/lib/types';
import { EMPTY_INPUT } from '@/lib/types';

const nf = new Intl.NumberFormat('vi-VN');

function fmt1(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
}

interface FormState {
  birth: string;
  sex: Sex;
  father: string;
  mother: string;
  visits: number;
  livesWith: boolean;
}

const EMPTY_FORM: FormState = {
  birth: '',
  sex: 'unspecified',
  father: '',
  mother: '',
  visits: 2,
  livesWith: false,
};

function toInput(f: FormState): InputData {
  const year = (s: string) => {
    const n = Number.parseInt(s.trim(), 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    myBirthDate: f.birth,
    mySex: f.sex,
    fatherBirthYear: year(f.father),
    motherBirthYear: year(f.mother),
    visitsPerYear: f.visits,
    livesWithParents: f.livesWith,
  };
}

function toForm(i: InputData): FormState {
  return {
    birth: i.myBirthDate,
    sex: i.mySex,
    father: i.fatherBirthYear != null ? String(i.fatherBirthYear) : '',
    mother: i.motherBirthYear != null ? String(i.motherBirthYear) : '',
    visits: i.visitsPerYear,
    livesWith: i.livesWithParents,
  };
}

export function ConMayTetTool() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  const hydratedRef = useRef(false);
  // "Hôm nay" chốt tại thời điểm mở app — mọi phép tính trong phiên nhất quán.
  const now = useMemo(() => new Date(), []);

  // Nạp dữ liệu đã lưu (nếu có) đúng một lần sau khi mở trang.
  useEffect(() => {
    const stored = loadInput();
    if (stored) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setForm(toForm(stored));
    }
    hydratedRef.current = true;
  }, []);

  // Lưu bền mỗi thay đổi (chỉ sau khi đã nạp xong, tránh ghi đè dữ liệu cũ
  // bằng form rỗng của lần render đầu).
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveInput(toInput(form));
  }, [form]);

  const input = useMemo(() => toInput(form), [form]);
  const validation = useMemo(() => validateInput(input, now), [input, now]);
  const result = useMemo(
    () => (validation.errors.length === 0 ? calculate(input, now) : null),
    [input, now, validation.errors.length],
  );
  const hasAnyResult = !!result && (result.father || result.mother || result.life);

  function resetAll() {
    clearInput();
    saveInput(EMPTY_INPUT);
    setForm(EMPTY_FORM);
    setCopied(false);
  }

  async function copyText() {
    if (!result) return;
    const text = buildShareText(result, input);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard bị chặn (thường do quyền trình duyệt): dùng textarea tạm.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
    }
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function downloadCard() {
    if (!result) return;
    try {
      await document.fonts.ready;
    } catch {
      // Không chờ được font thì vẫn vẽ bằng font dự phòng.
    }
    const canvas = drawShareCard(result, input);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'con-may-cai-tet-nua.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <div>
      {/* ── Form nhập ─────────────────────────────────────────── */}
      <section
        aria-label="Nhập thông tin"
        className="rounded-2xl border border-line bg-card p-5 sm:p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Ngày sinh của bạn</span>
            <input
              type="date"
              value={form.birth}
              max={now.toISOString().slice(0, 10)}
              onChange={(e) => setForm({ ...form, birth: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
            />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Giới tính của bạn</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Giới tính của bạn">
              {(
                [
                  ['female', 'Nữ'],
                  ['male', 'Nam'],
                  ['unspecified', 'Không chọn'],
                ] as [Sex, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.sex === value}
                  onClick={() => setForm({ ...form, sex: value })}
                  className={`flex min-h-11 flex-1 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.sex === value
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-paper text-ink hover:border-brand'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Bảng tuổi thọ có tách nam/nữ — chọn đúng thì ước tính sát hơn. Bố mặc định tra bảng
              nam, mẹ tra bảng nữ.
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Năm sinh của bố <span className="font-normal text-muted">(để trống nếu bỏ qua)</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="VD: 1965"
              value={form.father}
              min={1900}
              max={now.getFullYear()}
              onChange={(e) => setForm({ ...form, father: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Năm sinh của mẹ <span className="font-normal text-muted">(để trống nếu bỏ qua)</span>
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="VD: 1968"
              value={form.mother}
              min={1900}
              max={now.getFullYear()}
              onChange={(e) => setForm({ ...form, mother: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.livesWith}
              onChange={(e) => setForm({ ...form, livesWith: e.target.checked })}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#8C1D18]"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Home size={15} className="text-brand" /> Tôi đang sống cùng bố mẹ
              </span>
              <span className="mt-0.5 block text-sm text-muted">
                Khi sống cùng nhau, mỗi ngày đều là một lần gặp — công cụ sẽ tính số ngày còn bên
                nhau thay cho số lần về thăm.
              </span>
            </span>
          </label>

          {!form.livesWith && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="visits" className="text-sm font-semibold text-ink">
                  Mỗi năm bạn về thăm bố mẹ mấy lần?
                </label>
                <span className="font-display text-lg font-bold text-brand">
                  {form.visits} lần/năm
                </span>
              </div>
              <input
                id="visits"
                type="range"
                min={0}
                max={24}
                step={1}
                value={form.visits}
                onChange={(e) => setForm({ ...form, visits: Number(e.target.value) })}
                className="w-full"
              />
              {/* Các mốc nằm đúng tỉ lệ trên thang 0–24 (0%, 25%, 50%, 75%, 100%). */}
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>0</span>
                <span>6</span>
                <span>12 (mỗi tháng)</span>
                <span>18</span>
                <span>24</span>
              </div>
            </div>
          )}
        </div>

        {validation.errors.map((e) => (
          <p
            key={e}
            role="alert"
            className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-deep"
          >
            {e}
          </p>
        ))}
        {validation.warnings.map((w) => (
          <p
            key={w}
            className="mt-4 rounded-xl bg-[#FBF3DC] px-4 py-3 text-sm font-medium text-[#7A5B12]"
          >
            {w}
          </p>
        ))}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-muted">
            Kết quả tự cập nhật ngay khi bạn nhập — không cần bấm nút tính.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand"
          >
            <Eraser size={15} /> Làm lại từ đầu
          </button>
        </div>
      </section>

      {/* ── Kết quả ───────────────────────────────────────────── */}
      {hasAnyResult && result && (
        <section aria-label="Kết quả ước tính" className="rise-in mt-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {result.father && (
              <ParentCard label="Bố" est={result.father} livesWith={input.livesWithParents} />
            )}
            {result.mother && (
              <ParentCard label="Mẹ" est={result.mother} livesWith={input.livesWithParents} />
            )}
          </div>

          {(result.father || result.mother) && (
            <p className="mt-4 text-center text-sm leading-relaxed text-muted">
              Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ trung
              bình của hàng triệu người —{' '}
              <strong className="text-ink">không phải dự đoán dành cho bố/mẹ bạn</strong>. Rất nhiều
              người sống thọ hơn con số này rất nhiều. Hãy để con số nhắc mình chủ động sắp xếp thời
              gian bên bố mẹ, thay vì lo lắng vì nó.
            </p>
          )}

          {result.life && <LifeSection life={result.life} />}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyText}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep sm:flex-none sm:px-6"
            >
              <Copy size={16} /> {copied ? 'Đã sao chép!' : 'Copy kết quả gửi người thân'}
            </button>
            <button
              type="button"
              onClick={downloadCard}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft sm:flex-none sm:px-6"
            >
              <Download size={16} /> Tải ảnh thẻ kết quả
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">{DATA_SOURCE_VI}</p>
        </section>
      )}
    </div>
  );
}

function ParentCard({
  label,
  est,
  livesWith,
}: {
  label: string;
  est: ParentEstimate;
  livesWith: boolean;
}) {
  return (
    <article
      className="rounded-2xl border border-line bg-card p-6 text-center"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
        Còn khoảng với {label.toLowerCase()} ({est.currentAge} tuổi)
      </h2>
      <p className="font-display mt-2 text-7xl font-bold text-brand">{nf.format(est.tetsLeft)}</p>
      <p className="mt-1 font-display text-lg font-semibold text-ink">cái Tết nữa</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {livesWith ? (
          <>
            và khoảng <strong className="text-ink">{nf.format(est.meetingsLeft)} ngày</strong> còn
            bên nhau, nếu bố mẹ sống tới tuổi thọ kỳ vọng trung bình (~
            {fmt1(est.currentAge + est.remainingYears)} tuổi).
          </>
        ) : (
          <>
            và khoảng <strong className="text-ink">{nf.format(est.meetingsLeft)} lần gặp</strong>{' '}
            nữa, nếu giữ nhịp về thăm như hiện tại và bố mẹ sống tới tuổi thọ kỳ vọng trung bình (~
            {fmt1(est.currentAge + est.remainingYears)} tuổi).
          </>
        )}
      </p>
      <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-line pt-4 text-sm font-medium text-brand-deep">
        <Flower2 size={15} aria-hidden className="shrink-0 text-gold" />
        Đủ để trân trọng từng lần về nhà.
      </p>
    </article>
  );
}

function LifeSection({ life }: { life: LifeGrid }) {
  return (
    <div
      className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h2 className="font-display text-xl font-bold text-ink">Cuộc đời bạn trong một trang</h2>
      <p className="mt-1 text-sm text-muted">
        Mỗi chấm là một tuần. Theo kỳ vọng thống kê, đời bạn dài khoảng {nf.format(life.totalWeeks)}{' '}
        tuần — và bạn đã đi qua {nf.format(life.weeksLived)} tuần ({fmt1(life.percentLived)}%).
      </p>

      <div
        className="mt-4 grid gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
        role="img"
        aria-label={`Lưới tuần cuộc đời: đã sống ${nf.format(life.weeksLived)} trên tổng số khoảng ${nf.format(life.totalWeeks)} tuần`}
      >
        {Array.from({ length: life.totalWeeks }, (_, i) => (
          <span
            key={i}
            className={`aspect-square w-full rounded-full ${
              i < life.weeksLived
                ? 'bg-brand'
                : i === life.weeksLived
                  ? 'bg-gold ring-2 ring-gold/40'
                  : 'bg-line'
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" /> Tuần đã sống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" /> Tuần này
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-line" /> Tuần còn lại (ước tính)
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          icon={<Sun size={16} className="text-brand" />}
          value={nf.format(life.daysLived)}
          label="ngày đã sống"
        />
        <Stat
          icon={<Moon size={16} className="text-brand" />}
          value={`≈ ${nf.format(life.fullMoons)}`}
          label="lần trăng tròn đã qua"
        />
        <Stat
          icon={<CalendarHeart size={16} className="text-brand" />}
          value={nf.format(life.tetsExperienced)}
          label="cái Tết bạn đã trải qua"
        />
        <Stat
          icon={<Sparkles size={16} className="text-brand" />}
          value={`${fmt1(life.percentLived)}%`}
          label="đời người đã qua (thống kê)"
        />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-3 text-center">
      <p className="flex items-center justify-center gap-1.5">{icon}</p>
      <p className="font-display mt-1 text-xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
