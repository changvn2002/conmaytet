'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Copy, Download, Eraser, MapPin } from 'lucide-react';
import { calculate, validateInput } from '@/lib/calc';
import { buildShareText, drawShareCard } from '@/lib/share-card';
import { clearInput, loadInput, saveInput } from '@/lib/storage';
import type { CalcResult, InputData, LifeGrid, ParentEstimate, Sex } from '@/lib/types';
import { OfflineBar } from './offline-bar';

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

/* ── Validate TỪNG PHẦN (diệt F-02 của panel R3 + F-01) ─────────────
 * validateInput của lib trả lỗi/cảnh báo dạng chuỗi phẳng cho toàn bộ
 * form. Tầng component phân loại lại từng chuỗi về đúng phần của nó
 * (bạn / bố / mẹ / số lần về thăm) theo tiền tố và nhãn trong chuỗi,
 * để: lỗi của một người chỉ ẩn cảnh của người đó, và thông báo hiện
 * ngay dưới trường liên quan trong Cảnh 1 thay vì dồn ở chân form. */
type PartKey = 'self' | 'father' | 'mother' | 'visits';

function emptyParts(): Record<PartKey, string[]> {
  return { self: [], father: [], mother: [], visits: [] };
}

function classifyError(msg: string): PartKey {
  if (msg.startsWith('Ngày sinh của bạn') || msg.startsWith('Tuổi của bạn')) return 'self';
  if (msg.includes('của bố')) return 'father';
  if (msg.includes('của mẹ')) return 'mother';
  if (msg.startsWith('Số lần về thăm')) return 'visits';
  return 'self';
}

function classifyWarning(msg: string): PartKey {
  if (msg.startsWith('Số lần về thăm')) return 'visits';
  // Cảnh báo chênh lệch tuổi bắt đầu bằng chính nhãn «bố»/«mẹ».
  if (msg.startsWith('bố')) return 'father';
  if (msg.startsWith('mẹ')) return 'mother';
  return classifyError(msg);
}

/** Năm đang gõ dở: chuỗi thô chỉ có 1–3 chữ số thì chưa phải một năm. */
function isTypingYear(raw: string): boolean {
  return /^[0-9]{1,3}$/.test(raw.trim());
}

function scrollToEl(el: HTMLElement | null) {
  // scroll-behavior: smooth đã khai ở globals.css (và tự tắt khi
  // người dùng bật prefers-reduced-motion), ở đây chỉ cần gọi cuộn.
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Khối lỗi/cảnh báo đặt ngay dưới trường liên quan trong Cảnh 1. */
function FieldNotices({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  return (
    <>
      {errors.map((e) => (
        <p
          key={e}
          role="alert"
          className="mt-3 rounded-xl bg-error-bg px-4 py-3 text-sm font-medium text-error-text"
        >
          {e}
        </p>
      ))}
      {warnings.map((w) => (
        <p
          key={w}
          className="mt-3 rounded-xl bg-warn-bg px-4 py-3 text-sm font-medium text-warn-text"
        >
          {w}
        </p>
      ))}
    </>
  );
}

/** Điều hướng giữa các cảnh: lối tắt có chủ đích, cuộn tự do vẫn chạy. */
function SceneNav({ onNext, onEdit }: { onNext: (() => void) | null; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
        >
          Tiếp <ArrowDown size={16} aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
      >
        <ArrowUp size={16} aria-hidden /> Sửa lại
      </button>
    </div>
  );
}

export function ConMayTetTool() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  // Giới tính: 'unspecified' là giá trị dữ liệu thật, nhưng thị giác cả 3
  // ô phải TRUNG TÍNH cho tới khi người dùng thực sự chạm chọn (diệt
  // T-I). sexTouched ghi lại cú chạm đó; dữ liệu nạp từ localStorage có
  // sex khác 'unspecified' cũng coi là đã chọn.
  const [sexTouched, setSexTouched] = useState(false);
  const hydratedRef = useRef(false);
  // "Hôm nay" chốt tại thời điểm mở app — mọi phép tính trong phiên nhất quán.
  const now = useMemo(() => new Date(), []);

  // ── Làm lại từ đầu: máy trạng thái 3 pha (A11Y-10, diệt R3-F-03) ──
  const [deletePhase, setDeletePhase] = useState<'idle' | 'confirming' | 'deleted'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const snapshotRef = useRef<FormState | null>(null);
  const snapshotSexTouchedRef = useRef(false);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  const scene1Ref = useRef<HTMLElement>(null);
  const scene2Ref = useRef<HTMLElement>(null);
  const scene3Ref = useRef<HTMLElement>(null);
  const scene4Ref = useRef<HTMLElement>(null);

  // Nạp dữ liệu đã lưu (nếu có) đúng một lần sau khi mở trang.
  useEffect(() => {
    const stored = loadInput();
    if (stored) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setForm(toForm(stored));
      if (stored.mySex !== 'unspecified') setSexTouched(true);
    }
    hydratedRef.current = true;
  }, []);

  // Lưu bền mỗi thay đổi (chỉ sau khi đã nạp xong, tránh ghi đè dữ liệu cũ
  // bằng form rỗng của lần render đầu).
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveInput(toInput(form));
  }, [form]);

  // Mở khối xác nhận xoá: focus vào «Giữ lại» — lựa chọn an toàn là mặc định.
  useEffect(() => {
    if (deletePhase === 'confirming') keepButtonRef.current?.focus();
  }, [deletePhase]);

  // Cửa sổ hoàn tác 8 giây sau khi xoá: hết giờ thì bỏ snapshot, về idle
  // (form vẫn rỗng — dữ liệu mới, nếu có, đã huỷ snapshot từ trước).
  useEffect(() => {
    if (deletePhase !== 'deleted') return;
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const expire = window.setTimeout(() => {
      snapshotRef.current = null;
      setDeletePhase('idle');
      setSecondsLeft(0);
    }, 8000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(expire);
    };
  }, [deletePhase]);

  /**
   * Mọi sửa đổi từ người dùng đi qua đây: nếu cửa sổ hoàn tác đang mở
   * mà người dùng nhập dữ liệu mới, dữ liệu mới thắng — huỷ snapshot
   * ngay. Các setForm nội bộ (xoá, hoàn tác, nạp storage) không qua
   * hàm này nên không tự huỷ cửa sổ của chính chúng.
   */
  function updateForm(next: FormState) {
    if (deletePhase === 'deleted') {
      snapshotRef.current = null;
      setDeletePhase('idle');
      setSecondsLeft(0);
    }
    setForm(next);
  }

  const input = useMemo(() => toInput(form), [form]);
  const validation = useMemo(() => validateInput(input, now), [input, now]);

  const fatherTyping = isTypingYear(form.father);
  const motherTyping = isTypingYear(form.mother);

  // Phân loại lỗi/cảnh báo về từng phần; phần đang gõ dở năm thì chưa
  // hiện lỗi của phần đó (diệt F-01: lỗi nhấp nháy khi chưa đủ 4 chữ số).
  const notices = useMemo(() => {
    const errors = emptyParts();
    const warnings = emptyParts();
    for (const e of validation.errors) {
      const part = classifyError(e);
      if (part === 'father' && fatherTyping) continue;
      if (part === 'mother' && motherTyping) continue;
      errors[part].push(e);
    }
    for (const w of validation.warnings) {
      const part = classifyWarning(w);
      if (part === 'father' && fatherTyping) continue;
      if (part === 'mother' && motherTyping) continue;
      warnings[part].push(w);
    }
    return { errors, warnings };
  }, [validation, fatherTyping, motherTyping]);

  // Input hiệu lực cho phép tính: null hoá phần đang gõ dở hoặc có lỗi
  // cứng, để kết quả từng phần độc lập — một phần lỗi không ẩn các
  // phần còn lại (cơ chế lib đã thiết kế sẵn theo từng phần).
  const effectiveInput = useMemo<InputData>(() => {
    return {
      ...input,
      myBirthDate: notices.errors.self.length > 0 ? '' : input.myBirthDate,
      fatherBirthYear:
        fatherTyping || notices.errors.father.length > 0 ? null : input.fatherBirthYear,
      motherBirthYear:
        motherTyping || notices.errors.mother.length > 0 ? null : input.motherBirthYear,
    };
  }, [input, notices, fatherTyping, motherTyping]);

  const result = useMemo(() => calculate(effectiveInput, now), [effectiveInput, now]);
  const hasParentResult = !!(result.father || result.mother);
  const hasAnyResult = !!(result.father || result.mother || result.life);

  function confirmReset() {
    snapshotRef.current = form;
    snapshotSexTouchedRef.current = sexTouched;
    clearInput();
    // Effect lưu sẽ ghi EMPTY_FORM xuống storage — đúng ý đồ của pha này.
    setForm(EMPTY_FORM);
    setSexTouched(false);
    setCopied(false);
    setSecondsLeft(8);
    setDeletePhase('deleted');
  }

  function undoReset() {
    if (snapshotRef.current) {
      setForm(snapshotRef.current);
      setSexTouched(snapshotSexTouchedRef.current);
      snapshotRef.current = null;
    }
    setDeletePhase('idle');
    setSecondsLeft(0);
  }

  async function copyText() {
    if (!hasAnyResult) return;
    const text = buildShareText(result, effectiveInput);
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
    if (!hasAnyResult) return;
    try {
      await document.fonts.ready;
      // Nạp sẵn nét đậm nhất của Baloo 2 để số trên thẻ vẽ bằng đúng
      // font trưng bày, không rơi về font dự phòng.
      await document.fonts.load('800 100px "Baloo 2"');
    } catch {
      // Không chờ được font thì vẫn vẽ bằng font dự phòng.
    }
    const canvas = drawShareCard(result, effectiveInput);
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

  function openCalc() {
    window.dispatchEvent(new CustomEvent('conmaytet:open-cach-tinh'));
    scrollToEl(document.getElementById('cach-tinh'));
  }

  const goScene1 = () => scrollToEl(scene1Ref.current);
  const goScene2 = () => scrollToEl(scene2Ref.current);
  const goScene3 = () => scrollToEl(scene3Ref.current);
  const goScene4 = () => scrollToEl(scene4Ref.current);
  // Cảnh kế tiếp sau Cảnh 2: có lưới tuần thì tới Cảnh 3, không thì Cảnh 4.
  const afterScene2 = result.life ? goScene3 : goScene4;

  const ariaSummary = [
    result.father ? `Còn khoảng ${nf.format(result.father.tetsLeft)} cái Tết với bố` : null,
    result.mother ? `Còn khoảng ${nf.format(result.mother.tetsLeft)} cái Tết với mẹ` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <OfflineBar />

      {/* ── Cảnh 1 «Lời mời» ─────────────────────────────────────── */}
      <section
        ref={scene1Ref}
        aria-label="Lời mời"
        className="flex min-h-[calc(100dvh-60px)] flex-col justify-center py-8"
      >
        <h1 className="font-display text-[32px] leading-[1.15] font-bold text-brand-deep sm:text-[44px]">
          Đếm thử: còn mấy cái Tết bên bố mẹ?
        </h1>

        <div className="mt-8">
          <label htmlFor="birth" className="mb-1.5 block text-sm font-semibold text-ink">
            Ngày sinh của bạn
          </label>
          <input
            id="birth"
            type="date"
            value={form.birth}
            max={now.toISOString().slice(0, 10)}
            onChange={(e) => updateForm({ ...form, birth: e.target.value })}
            className="min-h-12 w-full rounded-xl border border-input-line bg-card px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
          />
          <p className="mt-1.5 max-w-[34rem] text-sm text-muted">
            Ngày đầy đủ để đếm lưới tuần đời của bạn theo tuần.
          </p>
          <FieldNotices errors={notices.errors.self} warnings={notices.warnings.self} />
        </div>

        <div className="mt-6">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Giới tính của bạn</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Giới tính của bạn">
            {(
              [
                ['female', 'Nữ'],
                ['male', 'Nam'],
                ['unspecified', 'Không chọn'],
              ] as [Sex, string][]
            ).map(([value, label]) => {
              const selected = sexTouched && form.sex === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.sex === value}
                  onClick={() => {
                    setSexTouched(true);
                    updateForm({ ...form, sex: value });
                  }}
                  className={`flex min-h-11 flex-1 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-paper text-ink hover:border-brand'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
            <div>
              <label htmlFor="father-year" className="mb-1.5 block text-sm font-semibold text-ink">
                Năm sinh của bố
              </label>
              <input
                id="father-year"
                type="number"
                inputMode="numeric"
                placeholder="VD: 1965"
                value={form.father}
                min={1900}
                max={now.getFullYear()}
                onChange={(e) => updateForm({ ...form, father: e.target.value })}
                className="min-h-12 w-full rounded-xl border border-input-line bg-card px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
              />
              <FieldNotices errors={notices.errors.father} warnings={notices.warnings.father} />
            </div>
            <div>
              <label htmlFor="mother-year" className="mb-1.5 block text-sm font-semibold text-ink">
                Năm sinh của mẹ
              </label>
              <input
                id="mother-year"
                type="number"
                inputMode="numeric"
                placeholder="VD: 1968"
                value={form.mother}
                min={1900}
                max={now.getFullYear()}
                onChange={(e) => updateForm({ ...form, mother: e.target.value })}
                className="min-h-12 w-full rounded-xl border border-input-line bg-card px-3.5 py-2.5 text-base text-ink transition-colors outline-none focus:border-brand"
              />
              <FieldNotices errors={notices.errors.mother} warnings={notices.warnings.mother} />
            </div>
          </div>
          <p className="mt-1.5 max-w-[34rem] text-sm text-muted">
            Chỉ cần năm — sai số ±1 tuổi, app luôn ghi rõ.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            role="switch"
            aria-checked={form.livesWith}
            onClick={() => updateForm({ ...form, livesWith: !form.livesWith })}
            className="flex min-h-11 w-full items-center gap-3 text-left"
          >
            <span
              aria-hidden
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.livesWith ? 'bg-brand' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.livesWith ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Tôi đang sống cùng bố mẹ</span>
              <span className="mt-0.5 block text-sm text-muted">Sống cùng: tính theo ngày.</span>
            </span>
          </button>
        </div>

        {!form.livesWith && (
          <div className="mt-6">
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="visits" className="text-sm font-semibold text-ink">
                Về thăm mỗi năm?
              </label>
              <span className="font-display text-[18px] font-bold text-brand">
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
              onChange={(e) => updateForm({ ...form, visits: Number(e.target.value) })}
              className="w-full"
            />
            {/* Các mốc nằm đúng tỉ lệ trên thang 0–24 (0%, 25%, 50%, 75%, 100%). */}
            <div className="flex justify-between text-[13px] text-muted">
              <span>0</span>
              <span>6</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
            <FieldNotices errors={notices.errors.visits} warnings={notices.warnings.visits} />
          </div>
        )}
        {form.livesWith && (
          <FieldNotices errors={notices.errors.visits} warnings={notices.warnings.visits} />
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={hasParentResult ? goScene2 : undefined}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Xem còn mấy cái Tết <ArrowDown size={16} aria-hidden />
          </button>
          <p className="mt-3 text-center text-sm text-muted">
            {hasParentResult
              ? 'Kết quả tự cập nhật khi bạn nhập.'
              : 'Nhập năm sinh của bố hoặc mẹ để xem'}
          </p>
        </div>
      </section>

      {/* ── Cảnh 2 «Sân khấu số» ─────────────────────────────────── */}
      {hasParentResult && (
        <section ref={scene2Ref} aria-label="Sân khấu số" className="scroll-mt-2">
          <div aria-live="polite" className="sr-only">
            {ariaSummary ? `${ariaSummary}.` : ''}
          </div>
          <div className="lg:grid lg:grid-cols-2">
            {result.father && (
              <ParentStage
                kind="father"
                est={result.father}
                livesWith={effectiveInput.livesWithParents}
                onOpenCalc={openCalc}
              />
            )}
            {result.mother && (
              <ParentStage
                kind="mother"
                est={result.mother}
                livesWith={effectiveInput.livesWithParents}
                onOpenCalc={openCalc}
              />
            )}
          </div>
          <div className="pb-10">
            <SceneNav onNext={afterScene2} onEdit={goScene1} />
          </div>
        </section>
      )}

      {/* ── Cảnh 3 «Câu chuyện tuần đời» ─────────────────────────── */}
      {result.life && (
        <section ref={scene3Ref} aria-label="Câu chuyện tuần đời" className="scroll-mt-2 py-10">
          {/* Minh hoạ duy nhất của luồng: chỉ đặt ở đầu Cảnh 3 để Cảnh 1
              giữ trọn ngân sách 1 viewport (kể cả khi có khối lỗi). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/calendar-spot.svg"
            alt=""
            aria-hidden
            className="mx-auto mb-4 h-24 w-auto"
          />
          <h2 className="font-display text-[28px] leading-tight font-bold text-brand-deep">
            Cuộc đời bạn, kể bằng tuần
          </h2>
          <p className="mt-1 max-w-[34rem] text-base text-muted">Mỗi chấm là một tuần đời bạn.</p>

          <LifeStory
            life={result.life}
            birthYear={Number(effectiveInput.myBirthDate.slice(0, 4))}
          />

          <div className="mt-8">
            <SceneNav onNext={goScene4} onEdit={goScene1} />
          </div>
        </section>
      )}

      {/* ── Cảnh 4 «Gửi đi» ──────────────────────────────────────── */}
      {hasAnyResult && (
        <ShareScene
          ref={scene4Ref}
          result={result}
          input={effectiveInput}
          copied={copied}
          onCopy={copyText}
          onDownload={downloadCard}
          deletePhase={deletePhase}
          secondsLeft={secondsLeft}
          keepButtonRef={keepButtonRef}
          onRequestReset={() => setDeletePhase('confirming')}
          onCancelReset={() => setDeletePhase('idle')}
          onConfirmReset={confirmReset}
          onUndoReset={undoReset}
          onEdit={goScene1}
        />
      )}
    </div>
  );
}

/* ── Sân khấu số của một người (Cảnh 2) ──────────────────────────────
 * Con số đứng trần giữa giấy, không thẻ, không viền, không bóng.
 * Reveal chỉ chạy 1 lần khi sân khấu đầu tiên vào viewport sau khi có
 * dữ liệu; sửa input sau đó chỉ cross-fade con số tại chỗ. */
function ParentStage({
  kind,
  est,
  livesWith,
  onOpenCalc,
}: {
  kind: 'father' | 'mother';
  est: ParentEstimate;
  livesWith: boolean;
  onOpenCalc: () => void;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || revealed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  const isFather = kind === 'father';
  const person = isFather ? 'BỐ' : 'MẸ';
  const hope = isFather
    ? 'Đủ để trân trọng từng lần về nhà với bố.'
    : 'Đủ để ngồi lâu hơn bên mâm cơm với mẹ.';

  return (
    <section
      ref={stageRef}
      aria-label={`Kết quả với ${isFather ? 'bố' : 'mẹ'}`}
      className="flex min-h-dvh flex-col items-center justify-center px-2 py-12 text-center lg:min-h-[calc(100dvh-124px)]"
    >
      <p className="text-[13px] font-semibold tracking-[0.08em] text-brand-deep uppercase">
        Với {person} · {est.currentAge} tuổi
      </p>

      {/* Khung ngoài giữ reveal sân khấu (chạy 1 lần); con số bên trong
          dùng key theo giá trị để mỗi lần sửa input chỉ cross-fade. */}
      <div className={revealed ? 'animate-stage-in' : 'opacity-0'}>
        <p
          key={est.tetsLeft}
          className="animate-num-in font-display font-extrabold text-brand"
          style={{ fontSize: 'clamp(120px, 38vw, 168px)', lineHeight: 0.95 }}
        >
          {nf.format(est.tetsLeft)}
        </p>
      </div>
      <p className="font-display mt-1 text-[24px] font-bold text-ink">cái Tết nữa</p>
      <div aria-hidden className="mt-3 h-[3px] w-12 rounded bg-gold" />

      <p
        className={`mt-5 max-w-[34rem] text-base font-semibold text-ink ${
          revealed ? 'animate-hope-in' : 'opacity-0'
        }`}
      >
        {hope}
      </p>

      <p className="mt-3 max-w-[34rem] text-base text-muted">
        {livesWith
          ? `và khoảng ${nf.format(est.meetingsLeft)} ngày còn bên nhau theo nhịp sống cùng hiện tại.`
          : `và khoảng ${nf.format(est.meetingsLeft)} lần gặp nữa theo nhịp về thăm hiện tại.`}
      </p>

      <p className="mt-5 max-w-[34rem] text-sm leading-relaxed text-muted">
        Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ trung bình. Nó{' '}
        <strong className="text-ink">không phải dự đoán cho riêng {isFather ? 'bố' : 'mẹ'}</strong>.
      </p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1 text-[13px] text-muted">
        Nguồn: bảng sống WHO Việt Nam 2019.
        <button
          type="button"
          onClick={onOpenCalc}
          className="inline-flex min-h-11 items-center gap-0.5 px-1 font-semibold text-brand"
        >
          Cách tính <ChevronRight size={14} aria-hidden />
        </button>
      </p>
    </section>
  );
}

/* ── Lưới tuần kể chuyện (Cảnh 3) ────────────────────────────────────
 * Vẽ theo hàng năm (mỗi hàng 52 chấm) để mốc tuổi neo được vào đúng
 * hàng và nhãn «tuần này» trỏ được vào đúng hàng chứa chấm hiện tại. */
const LifeStory = memo(function LifeStory({
  life,
  birthYear,
}: {
  life: LifeGrid;
  birthYear: number;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [weekRevealed, setWeekRevealed] = useState(false);

  // Chấm «tuần này» pulse đúng 1 lần khi lưới đầu tiên vào viewport.
  useEffect(() => {
    const el = gridRef.current;
    if (!el || weekRevealed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setWeekRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [weekRevealed]);

  const rows = Math.ceil(life.totalWeeks / 52);
  const currentRow = Math.floor(life.weeksLived / 52);
  const milestones = [30, 40, 50, 60];

  const rowEls: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (const m of milestones) {
      if (m !== r) continue;
      rowEls.push(
        <div
          key={`milestone-${m}`}
          aria-hidden
          className={`flex items-center gap-2 py-0.5 ${
            m === 40 || m === 60 ? 'max-[359px]:hidden' : ''
          }`}
        >
          <span className="flex-1 border-t border-dashed border-line" />
          <span className="text-xs font-semibold text-gold-text">
            {m} tuổi · {birthYear + m}
          </span>
        </div>,
      );
    }
    rowEls.push(
      <div
        key={`row-${r}`}
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 52 }, (_, c) => {
          const i = r * 52 + c;
          if (i >= life.totalWeeks) return <span key={c} className="aspect-square w-full" />;
          const cls =
            i < life.weeksLived
              ? 'bg-brand'
              : i === life.weeksLived
                ? `bg-gold ring-2 ring-brand ${weekRevealed ? 'week-pulse' : ''}`
                : 'bg-line';
          return <span key={c} className={`aspect-square w-full rounded-full ${cls}`} />;
        })}
      </div>,
    );
    if (r === currentRow) {
      rowEls.push(
        <div key="current-label" className="flex items-center gap-1.5 py-1" aria-hidden>
          <MapPin size={14} className="shrink-0 text-brand" />
          <span className="text-sm font-semibold text-brand-deep">Bạn đang ở tuần này</span>
        </div>,
      );
    }
  }

  return (
    <div className="mt-5">
      <div
        ref={gridRef}
        className="flex flex-col gap-[3px]"
        role="img"
        aria-label={`Lưới tuần cuộc đời: đã sống ${nf.format(life.weeksLived)} trên tổng số khoảng ${nf.format(life.totalWeeks)} tuần`}
      >
        {rowEls}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" /> Đã sống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-brand" /> Tuần
          này
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-line" /> Còn lại (ước tính)
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-brand-soft px-3 py-3 text-center">
          <p className="font-display text-[20px] font-bold text-ink">{nf.format(life.daysLived)}</p>
          <p className="mt-0.5 text-[13px] text-muted">ngày đã sống</p>
        </div>
        <div className="rounded-xl bg-brand-soft px-3 py-3 text-center">
          <p className="font-display text-[20px] font-bold text-ink">
            ≈ {nf.format(life.fullMoons)}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">lần trăng tròn đã qua</p>
        </div>
        <div className="rounded-xl bg-brand-soft px-3 py-3 text-center">
          <p className="font-display text-[20px] font-bold text-ink">
            {nf.format(life.tetsExperienced)}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">cái Tết bạn đã trải qua</p>
        </div>
        <div className="rounded-xl bg-brand-soft px-3 py-3 text-center">
          <p className="font-display text-[20px] font-bold text-ink">{fmt1(life.percentLived)}%</p>
          <p className="mt-0.5 text-[13px] text-muted">đời người đã qua (thống kê)</p>
        </div>
      </div>
    </div>
  );
});

/* ── Cảnh 4 «Gửi đi» ─────────────────────────────────────────────────
 * Xem trước thẻ vẽ lại từ canvas mỗi khi kết quả đổi; hàng hành động
 * chính bám đáy chỉ trong phạm vi cảnh này. «Làm lại từ đầu» đi qua
 * xác nhận tại chỗ + hoàn tác 8 giây, không bao giờ xoá sau 1 chạm. */
function ShareScene({
  ref,
  result,
  input,
  copied,
  onCopy,
  onDownload,
  deletePhase,
  secondsLeft,
  keepButtonRef,
  onRequestReset,
  onCancelReset,
  onConfirmReset,
  onUndoReset,
  onEdit,
}: {
  ref: React.Ref<HTMLElement>;
  result: CalcResult;
  input: InputData;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  deletePhase: 'idle' | 'confirming' | 'deleted';
  secondsLeft: number;
  keepButtonRef: React.RefObject<HTMLButtonElement | null>;
  onRequestReset: () => void;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  onUndoReset: () => void;
  onEdit: () => void;
}) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);

  // Vẽ lại ảnh xem trước khi kết quả/input đổi — chờ font trưng bày
  // sẵn sàng để số trên thẻ dùng đúng Baloo 2. Lỗi canvas thì ẩn xem
  // trước, các nút Copy/Tải ảnh vẫn hoạt động bình thường.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await document.fonts.ready;
        try {
          await document.fonts.load('800 100px "Baloo 2"');
        } catch {
          // Không nạp được font thì vẽ bằng font dự phòng.
        }
        const canvas = drawShareCard(result, input);
        const url = canvas.toDataURL('image/png');
        if (!cancelled) setCardUrl(url);
      } catch {
        if (!cancelled) setCardUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result, input]);

  // Thiếu đúng một phụ huynh thì mời đếm thêm cho người còn lại.
  const missing =
    result.father && !result.mother
      ? { label: 'mẹ', key: 'mother' }
      : result.mother && !result.father
        ? { label: 'bố', key: 'father' }
        : null;

  return (
    <section
      ref={ref}
      aria-label="Gửi đi"
      className="flex min-h-[calc(100dvh-60px)] scroll-mt-2 flex-col justify-center py-10"
    >
      <h2 className="font-display text-[28px] leading-tight font-bold text-brand-deep">
        Gửi cho người thân
      </h2>

      {cardUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cardUrl}
          alt="Thẻ kết quả Còn Mấy Cái Tết Nữa?"
          className="mx-auto mt-5 w-full max-w-[320px] rounded-2xl border border-line shadow-[var(--shadow-card)]"
        />
      )}

      <div className="sticky bottom-3 z-10 mt-6 bg-paper py-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCopy}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            <Copy size={16} aria-hidden /> {copied ? 'Đã sao chép!' : 'Copy kết quả'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-brand bg-card px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            <Download size={16} aria-hidden /> Tải ảnh thẻ kết quả
          </button>
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Đã sao chép kết quả.' : ''}
        </span>
      </div>

      <div className="mt-4">
        {deletePhase === 'idle' && (
          <button
            type="button"
            onClick={onRequestReset}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand"
          >
            <Eraser size={15} aria-hidden /> Làm lại từ đầu
          </button>
        )}

        {deletePhase === 'confirming' && (
          <div className="rounded-xl border border-line bg-paper p-4">
            <p className="text-sm font-semibold text-ink">Xoá hết dữ liệu đã nhập?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onConfirmReset}
                className="flex min-h-11 items-center rounded-xl bg-error-text px-4 py-2 text-sm font-semibold text-white"
              >
                Xoá
              </button>
              <button
                type="button"
                ref={keepButtonRef}
                onClick={onCancelReset}
                className="flex min-h-11 items-center rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand"
              >
                Giữ lại
              </button>
            </div>
          </div>
        )}

        {deletePhase === 'deleted' && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper p-4">
            <p className="text-sm font-medium text-ink">
              Đã xoá. <span className="text-muted">(còn {secondsLeft} giây để hoàn tác)</span>
            </p>
            <button
              type="button"
              onClick={onUndoReset}
              className="flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
            >
              Hoàn tác
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-muted">Không tài khoản, không gửi dữ liệu đi.</p>

      {missing && (
        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted">
          Muốn đếm thêm cho {missing.label}?
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center gap-1 px-1 font-semibold text-brand"
          >
            <ArrowUp size={14} aria-hidden /> Sửa lại
          </button>
        </p>
      )}
    </section>
  );
}
