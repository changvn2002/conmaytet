'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { calculate, validateInput } from '@/lib/calc';
import { buildShareText, drawShareCard } from '@/lib/share-card';
import { clearInput, loadInput, saveInput } from '@/lib/storage';
import type { CalcResult, InputData, LifeGrid, ParentEstimate, Sex } from '@/lib/types';
import { OfflineBar } from './offline-bar';
import { ProfileAvatar } from './avatar';
import { PeachBranch } from './branch';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconHome,
  IconMeal,
  IconReset,
} from './icons';

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

/**
 * Khối lỗi/cảnh báo đặt ngay dưới trường liên quan trong Cảnh 1.
 * `id` là đích của aria-describedby từ ô nhập tương ứng — ô lỗi đồng
 * thời mang aria-invalid (điều kiện chấm lại Panel #01).
 */
function FieldNotices({
  errors,
  warnings,
  id,
}: {
  errors: string[];
  warnings: string[];
  id?: string;
}) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div id={id}>
      {errors.map((e) => (
        <p
          key={e}
          role="alert"
          className="mt-3 rounded-xl border-l-4 border-error-solid bg-card px-4 py-3 text-sm font-medium text-error-ink"
        >
          {e}
        </p>
      ))}
      {warnings.map((w) => (
        <p
          key={w}
          className="mt-3 rounded-xl bg-warning-bg px-4 py-3 text-sm font-medium text-warning-ink"
        >
          {w}
        </p>
      ))}
    </div>
  );
}

/** Điều hướng giữa các cảnh: lối tắt có chủ đích, cuộn tự do vẫn chạy. */
function SceneNav({ onNext, onEdit }: { onNext: (() => void) | null; onEdit: () => void }) {
  const btn =
    'flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong';
  return (
    <div className="flex items-center justify-center gap-2">
      {onNext && (
        <button type="button" onClick={onNext} className={btn}>
          Tiếp <IconArrowDown size={16} aria-hidden />
        </button>
      )}
      <button type="button" onClick={onEdit} className={btn}>
        <IconArrowUp size={16} aria-hidden /> Sửa lại
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
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const deletedBarRef = useRef<HTMLDivElement>(null);

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

  // Sau khi xoá: focus vào «Hoàn tác» trên thanh trạng thái của component
  // cha — đích focus không bao giờ rơi về BODY (cụm C1, điều kiện §8.4).
  useEffect(() => {
    if (deletePhase === 'deleted') undoButtonRef.current?.focus();
  }, [deletePhase]);

  // Esc khi khối xác nhận đang mở = đi theo nhánh «Giữ lại».
  useEffect(() => {
    if (deletePhase !== 'confirming') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelReset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deletePhase]);

  // V121 (SERIOUS-2 của panel v1.2.0): trong lúc modal xác nhận xoá
  // đang mở, KHOÁ CUỘN NỀN ở cả html lẫn body (chuột + chạm) — nền
  // không trôi, phiên xác nhận không bị thao tác cuộn/chạm ngoài ý
  // làm mất. Trả lại đúng giá trị overflow cũ khi modal đóng.
  useEffect(() => {
    if (deletePhase !== 'confirming') return;
    const bodyPrev = document.body.style.overflow;
    const htmlPrev = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyPrev;
      document.documentElement.style.overflow = htmlPrev;
    };
  }, [deletePhase]);

  // Cửa sổ hoàn tác 8 giây sau khi xoá: hết giờ thì bỏ snapshot, về idle
  // (form vẫn rỗng — dữ liệu mới, nếu có, đã huỷ snapshot từ trước).
  useEffect(() => {
    if (deletePhase !== 'deleted') return;
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const expire = window.setTimeout(() => {
      snapshotRef.current = null;
      // OBS-A (Panel #02, §8.1): thanh sắp unmount — nếu focus đang
      // nằm trong thanh (nút «Hoàn tác») thì đưa focus về ô #birth
      // TRƯỚC khi gỡ thanh, không để focus rơi về BODY. Guard: người
      // dùng đã tự di chuyển focus đi nơi khác trong cửa sổ thì
      // không giành lại. KHÔNG dùng preventScroll: lúc hết hạn #birth
      // nằm ngoài mép trên viewport nên focus phải cuộn nó vào view
      // (khác nhánh hoàn tác/huỷ vốn dùng preventScroll — giữ nguyên).
      const active = document.activeElement;
      if (active && deletedBarRef.current?.contains(active)) {
        document.getElementById('birth')?.focus();
      }
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

  // Huỷ xoá (nút «Giữ lại» hoặc Esc): dữ liệu nguyên vẹn, focus trả về
  // nút «Làm lại từ đầu» vừa mount lại thay cho khối xác nhận (cụm C1).
  function cancelReset() {
    setDeletePhase('idle');
    window.setTimeout(() => resetButtonRef.current?.focus(), 0);
  }

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
    // Thanh trạng thái sắp unmount: đưa người dùng về Cảnh 1 — nơi dữ
    // liệu vừa khôi phục đang hiện — và focus vào trường đầu tiên.
    scrollToEl(scene1Ref.current);
    window.setTimeout(() => document.getElementById('birth')?.focus({ preventScroll: true }), 0);
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

  // «Sửa lại»: về Cảnh 1 và đưa focus vào trường đầu tiên — không thả
  // focus về BODY khi nút vừa bấm biến mất theo cảnh (cụm C1, §8.4).
  const goScene1 = () => {
    scrollToEl(scene1Ref.current);
    window.setTimeout(() => document.getElementById('birth')?.focus({ preventScroll: true }), 0);
  };
  const goScene2 = () => scrollToEl(scene2Ref.current);
  const goScene3 = () => scrollToEl(scene3Ref.current);
  const goScene4 = () => scrollToEl(scene4Ref.current);
  // Cảnh kế tiếp sau Cảnh 2: có lưới tuần thì tới Cảnh 3, không thì Cảnh 4.
  const afterScene2 = result.life ? goScene3 : goScene4;
  // «Tiếp» của sân khấu BỐ phải dừng ở sân khấu MẸ trước (Panel
  // v1.2.2 S-NEW-2: cả hai sân khấu cùng dùng afterScene2 nên nút
  // của bố nhảy thẳng qua mẹ xuống lưới tuần — người dùng theo
  // luồng dẫn dắt không bao giờ dừng xem được kết quả của mẹ).
  const goMomStage = () => {
    const el = document.getElementById('san-khau-me');
    if (el) scrollToEl(el);
    else afterScene2();
  };

  const ariaSummary = [
    result.father ? `Còn khoảng ${nf.format(result.father.tetsLeft)} cái Tết với bố` : null,
    result.mother ? `Còn khoảng ${nf.format(result.mother.tetsLeft)} cái Tết với mẹ` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <OfflineBar />

      {/* ── Cảnh 1 «Lời mời» — hệ lens-04: hero sticky (cành đào trên
          nền trung tính của thẻ) + 2 thẻ form đánh số; control 52–58px,
          thẻ trắng bo 20 trên canvas #F6F7F6. */}
      <section ref={scene1Ref} aria-label="Lời mời" className="py-6 lg:py-8">
        <div className="grid items-start gap-5 lg:grid-cols-[400px_1fr]">
          {/* Thẻ hero */}
          <div className="rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-7 lg:sticky lg:top-5">
            <div className="rounded-2xl bg-subtle px-3 pt-3 pb-1">
              <div className="mx-auto w-[220px] lg:w-full">
                <PeachBranch className="h-auto w-full" />
              </div>
            </div>
            <h1 className="font-display mt-5 text-[26px] leading-[1.22] font-extrabold text-balance text-ink sm:text-[31px]">
              Đếm thử: còn mấy cái Tết bên bố mẹ?
            </h1>
            <div className="mt-5 hidden flex-col gap-2.5 border-t border-line-soft pt-4 sm:flex">
              {[
                'Không tài khoản, không gửi dữ liệu đi.',
                'Nguồn: bảng sống WHO Việt Nam 2019.',
                'Đây là ước tính thống kê theo tuổi thọ trung bình.',
              ].map((line) => (
                <p key={line} className="flex items-start gap-2.5 text-sm font-medium text-ink-2">
                  <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-seed-soft text-seed-ink">
                    <IconCheck size={12} aria-hidden />
                  </span>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Cột form */}
          <div className="flex flex-col gap-5">
            <div className="rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h2 className="flex items-center gap-2.5 text-base font-extrabold text-ink">
                <span className="font-display flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12.5px] font-extrabold text-white">
                  1
                </span>
                Về bạn
              </h2>

              <div className="mt-5">
                <label htmlFor="birth" className="mb-2 block text-[15px] font-semibold text-ink">
                  Ngày sinh của bạn
                </label>
                <input
                  id="birth"
                  type="date"
                  autoComplete="bday"
                  value={form.birth}
                  max={now.toISOString().slice(0, 10)}
                  onChange={(e) => updateForm({ ...form, birth: e.target.value })}
                  aria-invalid={notices.errors.self.length > 0 || undefined}
                  aria-describedby={
                    notices.errors.self.length + notices.warnings.self.length > 0
                      ? 'notices-self'
                      : undefined
                  }
                  className="min-h-[54px] w-full rounded-[13px] border border-line-control bg-card px-4 py-3 text-base text-ink transition-colors focus:border-brand focus:outline-2 focus:outline-brand-strong focus-visible:outline-2 focus-visible:outline-brand-strong focus-within:outline-2 focus-within:outline-brand-strong"
                />
                <p className="mt-2 max-w-[34rem] text-sm text-pretty text-muted">
                  Ngày đầy đủ để đếm lưới tuần đời của bạn theo tuần.
                </p>
                <FieldNotices
                  id="notices-self"
                  errors={notices.errors.self}
                  warnings={notices.warnings.self}
                />
              </div>

              <div className="mt-6">
                <span className="mb-2 block text-[15px] font-semibold text-ink">
                  Giới tính của bạn
                </span>
                <div className="flex gap-2.5" role="radiogroup" aria-label="Giới tính của bạn">
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
                        className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[13px] border px-3 py-2.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${
                          selected
                            ? 'border-brand bg-seed-tint font-bold text-seed-ink'
                            : 'border-line-control bg-card font-medium text-ink-2 hover:border-brand-strong'
                        }`}
                      >
                        {selected && (
                          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h2 className="flex items-center gap-2.5 text-base font-extrabold text-ink">
                <span className="font-display flex h-6 w-6 items-center justify-center rounded-lg bg-ink text-[12.5px] font-extrabold text-white">
                  2
                </span>
                Về bố mẹ
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
                <div>
                  <label
                    htmlFor="father-year"
                    className="mb-2 block text-[15px] font-semibold text-ink"
                  >
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
                    aria-invalid={notices.errors.father.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.father.length + notices.warnings.father.length > 0
                        ? 'notices-father'
                        : undefined
                    }
                    className="min-h-[54px] w-full rounded-[13px] border border-line-control bg-card px-4 py-3 text-base text-ink transition-colors focus:border-brand focus:outline-2 focus:outline-brand-strong focus-visible:outline-2 focus-visible:outline-brand-strong"
                  />
                  <FieldNotices
                    id="notices-father"
                    errors={notices.errors.father}
                    warnings={notices.warnings.father}
                  />
                </div>
                <div>
                  <label
                    htmlFor="mother-year"
                    className="mb-2 block text-[15px] font-semibold text-ink"
                  >
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
                    aria-invalid={notices.errors.mother.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.mother.length + notices.warnings.mother.length > 0
                        ? 'notices-mother'
                        : undefined
                    }
                    className="min-h-[54px] w-full rounded-[13px] border border-line-control bg-card px-4 py-3 text-base text-ink transition-colors focus:border-brand focus:outline-2 focus:outline-brand-strong focus-visible:outline-2 focus-visible:outline-brand-strong"
                  />
                  <FieldNotices
                    id="notices-mother"
                    errors={notices.errors.mother}
                    warnings={notices.warnings.mother}
                  />
                </div>
              </div>
              <p className="mt-2 max-w-[34rem] text-sm text-muted">
                Chỉ cần năm — sai số ±1 tuổi, app luôn ghi rõ.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.livesWith}
                  onClick={() => updateForm({ ...form, livesWith: !form.livesWith })}
                  className="flex min-h-11 w-full items-center gap-3.5 rounded-[14px] border border-line-soft bg-subtle px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                >
                  <span
                    aria-hidden
                    className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors ${
                      form.livesWith ? 'bg-brand' : 'bg-future'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] h-6 w-6 rounded-full bg-card shadow transition-transform ${
                        form.livesWith ? 'translate-x-[22px]' : 'translate-x-0'
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">
                      Tôi đang sống cùng bố mẹ
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      Sống cùng: tính theo ngày.
                    </span>
                  </span>
                </button>
              </div>

              {!form.livesWith && (
                <div className="mt-6">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <label htmlFor="visits" className="text-[15px] font-semibold text-ink">
                      Về thăm mỗi năm?
                    </label>
                    <span className="font-display text-[18px] font-extrabold text-seed-ink">
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
                    aria-invalid={notices.errors.visits.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.visits.length + notices.warnings.visits.length > 0
                        ? 'notices-visits'
                        : undefined
                    }
                    style={{
                      background: `linear-gradient(to right, var(--seed) ${(form.visits / 24) * 100}%, var(--track) ${(form.visits / 24) * 100}%)`,
                      backgroundSize: '100% 6px',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                    className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                  />
                  {/* Các mốc nằm đúng tỉ lệ trên thang 0–24 (0%, 25%, 50%, 75%, 100%). */}
                  <div className="flex justify-between text-sm text-muted">
                    <span>0</span>
                    <span>6</span>
                    <span>12</span>
                    <span>18</span>
                    <span>24</span>
                  </div>
                  <FieldNotices
                    id="notices-visits"
                    errors={notices.errors.visits}
                    warnings={notices.warnings.visits}
                  />
                </div>
              )}
              {form.livesWith && (
                <FieldNotices
                  id="notices-visits"
                  errors={notices.errors.visits}
                  warnings={notices.warnings.visits}
                />
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={hasParentResult ? goScene2 : undefined}
                aria-disabled={!hasParentResult || undefined}
                className={`flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong ${
                  hasParentResult
                    ? 'bg-brand text-white shadow-[0_10px_20px_-8px_color-mix(in_srgb,var(--seed)_55%,transparent)] hover:bg-brand-strong'
                    : 'cursor-not-allowed bg-track text-faint'
                }`}
              >
                Xem còn mấy cái Tết <IconArrowDown size={16} aria-hidden />
              </button>
              <p className="mt-3 text-center text-sm text-muted">
                {hasParentResult
                  ? 'Kết quả tự cập nhật khi bạn nhập.'
                  : 'Nhập năm sinh của bố hoặc mẹ để xem'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cảnh 2 «Sân khấu số» ─────────────────────────────────── */}
      {hasParentResult && (
        <section ref={scene2Ref} aria-label="Sân khấu số" className="scroll-mt-2 py-2 lg:py-4">
          <div aria-live="polite" className="sr-only">
            {ariaSummary ? `${ariaSummary}.` : ''}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {result.father && (
              <ParentStage
                kind="father"
                birthYear={effectiveInput.fatherBirthYear}
                est={result.father}
                livesWith={effectiveInput.livesWithParents}
                onOpenCalc={openCalc}
                onNext={result.mother ? goMomStage : afterScene2}
                onEdit={goScene1}
              />
            )}
            {result.mother && (
              <ParentStage
                kind="mother"
                stageId="san-khau-me"
                birthYear={effectiveInput.motherBirthYear}
                est={result.mother}
                livesWith={effectiveInput.livesWithParents}
                onOpenCalc={openCalc}
                onNext={afterScene2}
                onEdit={goScene1}
              />
            )}
          </div>
          {/* Điều hướng đi tiếp nằm ở chân TỪNG thẻ kết quả (xem
              ParentStage) — giữ nguyên cách sửa của v1.2.1. */}
        </section>
      )}

      {/* ── Cảnh 3 «Câu chuyện tuần đời» — hệ lens-04 + SỬA BẮT BUỘC
          của panel: lưới bắt đầu ngay trong khung hình đầu (thẻ đầu
          gọn + thẻ lưới ngay dưới, 3 thẻ thống kê phụ chuyển XUỐNG
          DƯỚI lưới), nhóm thập kỷ có khoảng nghỉ + chip mốc. */}
      {result.life && (
        <section
          ref={scene3Ref}
          aria-label="Câu chuyện tuần đời"
          className="scroll-mt-2 py-6 lg:py-8"
        >
          <div className="rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <ProfileAvatar
                role="self"
                birthYear={Number(effectiveInput.myBirthDate.slice(0, 4))}
                name="Bạn"
                size={58}
              />
              <div className="min-w-0">
                <h2 className="font-display text-[24px] leading-tight font-extrabold text-balance text-ink sm:text-[26px]">
                  Cuộc đời bạn, kể bằng tuần
                </h2>
                <p className="mt-0.5 text-sm text-muted sm:text-base">
                  Mỗi chấm là một tuần đời bạn.
                </p>
              </div>
              <div className="sm:ml-auto sm:text-right">
                <p className="font-display text-[28px] leading-none font-extrabold text-ink">
                  {nf.format(result.life.weeksLived)}{' '}
                  <span className="text-[19px] text-seed-ink">
                    / ≈{nf.format(result.life.totalWeeks)} tuần
                  </span>
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-muted">
                  {fmt1(result.life.percentLived)}% đời người đã qua (thống kê)
                </p>
              </div>
            </div>
            <div className="relative mt-5 h-[11px] rounded-full bg-track">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-lived-strong"
                style={{ width: `${result.life.percentLived}%` }}
              />
              <span
                aria-hidden
                className="absolute top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5px] border-card bg-brand shadow-[0_0_0_1.5px_var(--seed)]"
                style={{ left: `${result.life.percentLived}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-[12.5px] font-medium text-muted">
              <span>Ngày sinh · {effectiveInput.myBirthDate.split('-').reverse().join('/')}</span>
              <span>Phần đời phía trước</span>
            </div>
          </div>

          <LifeStory
            life={result.life}
            birthYear={Number(effectiveInput.myBirthDate.slice(0, 4))}
          />

          <div className="mt-6">
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
          keepButtonRef={keepButtonRef}
          resetButtonRef={resetButtonRef}
          onRequestReset={() => setDeletePhase('confirming')}
          onCancelReset={cancelReset}
          onConfirmReset={confirmReset}
          onEdit={goScene1}
        />
      )}

      {/* ── Thanh trạng thái sau xoá (TC-1): render ở component cha,
          KHÔNG nằm trong ShareScene — ShareScene bị cổng hasAnyResult
          unmount ngay trong commit xoá dữ liệu, nên lớp hoàn tác đặt
          trong đó không bao giờ xuất hiện. Thanh này chỉ phụ thuộc
          deletePhase nên sống trọn cửa sổ 8 giây. */}
      {deletePhase === 'deleted' && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
          {/* R1-F5 (Panel #02): khoá MỘT trạng thái bố cục cho toàn
              cửa sổ 8 giây — flex-nowrap + nút shrink-0 + khoảng gap
              nhỏ hơn để tổng bề ngang luôn dưới ngưỡng quấn, và chữ số
              giây nằm trong hộp 1ch canh giữa (tabular-nums) để bề
              ngang dòng chữ không đổi theo chữ số (trước đây chữ «1»
              hẹp hơn ~3,5px làm thanh tự lật 2 dòng → 1 dòng ở ~7,05s). */}
          <div
            ref={deletedBarRef}
            className="mx-auto flex max-w-[34rem] flex-nowrap items-center gap-x-2 rounded-[20px] border border-line bg-card p-4 shadow-[var(--shadow-lift)]"
          >
            <p role="status" className="min-w-0 text-sm font-medium text-ink">
              Đã xoá.{' '}
              <span aria-hidden="true" className="text-muted">
                (còn{' '}
                <span className="inline-block w-[1ch] text-center tabular-nums">{secondsLeft}</span>{' '}
                giây để hoàn tác)
              </span>
            </p>
            <button
              type="button"
              ref={undoButtonRef}
              onClick={undoReset}
              className="flex min-h-11 shrink-0 items-center rounded-xl px-3 py-2 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              Hoàn tác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Thẻ kết quả của một người (Cảnh 2) — hệ lens-04 ────────────────
 * Thẻ trắng bo 22 trên canvas trung tính; con số là trung tâm tuyệt
 * đối (Baloo 2 800 mực đen, lớn nhất thẻ); avatar DiceBear initials
 * thật 78px KHÔNG huy hiệu; thanh tiến trình đời người THẲNG dưới
 * số; câu cảm xúc trong khối trích dẫn viền trái seed. Reveal chỉ
 * chạy 1 lần khi thẻ vào viewport; sửa input sau đó chỉ cross-fade. */
function ParentStage({
  kind,
  birthYear,
  est,
  livesWith,
  onOpenCalc,
  onNext,
  onEdit,
  stageId,
}: {
  kind: 'father' | 'mother';
  birthYear: number | null;
  est: ParentEstimate;
  livesWith: boolean;
  onOpenCalc: () => void;
  /** Hành động đi tiếp ĐÃ CÓ của Cảnh 2 (qua lưới tuần / qua gửi đi). */
  onNext: () => void;
  onEdit: () => void;
  /** Id neo để nút «Tiếp» của sân khấu trước cuộn tới đúng sân khấu này. */
  stageId?: string;
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
  const person = isFather ? 'Bố' : 'Mẹ';
  const hope = isFather
    ? 'Đủ để trân trọng từng lần về nhà với bố.'
    : 'Đủ để ngồi lâu hơn bên mâm cơm với mẹ.';
  const percent = Math.min(
    100,
    Math.max(0, Math.round((est.currentAge / (est.currentAge + est.remainingYears)) * 100)),
  );

  return (
    <section
      ref={stageRef}
      id={stageId}
      aria-label={`Kết quả với ${isFather ? 'bố' : 'mẹ'}`}
      className="scroll-mt-2 rounded-[22px] border border-line bg-card p-6 shadow-[var(--shadow-card)] sm:p-7"
    >
      <div className="flex items-center gap-4">
        <ProfileAvatar role={kind} birthYear={birthYear} name={person} size={78} />
        <div>
          <h3 className="text-[19px] font-extrabold text-ink">{person}</h3>
          {birthYear != null && (
            <p className="mt-0.5 text-sm font-medium text-muted">Sinh năm {birthYear}</p>
          )}
        </div>
        <span className="ml-auto rounded-full border border-line bg-subtle px-3 py-1.5 text-xs font-bold text-ink-2">
          {est.currentAge} tuổi
        </span>
      </div>

      {/* Khung ngoài giữ reveal (chạy 1 lần); con số bên trong dùng key
          theo giá trị để mỗi lần sửa input chỉ cross-fade tại chỗ. */}
      <div className="mt-5 flex items-baseline gap-3">
        <div className={revealed ? 'animate-stage-in' : 'opacity-0'}>
          <p
            key={est.tetsLeft}
            className="animate-num-in font-display leading-[0.95] font-extrabold text-ink"
            style={{ fontSize: 'var(--hero-size)' }}
          >
            {nf.format(est.tetsLeft)}
          </p>
        </div>
        <p className="text-[17px] leading-snug font-bold text-ink-2">
          cái Tết nữa
          <span className="block text-sm font-medium text-muted">(ước tính)</span>
        </p>
      </div>

      <p className="mt-3 flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-seed-soft text-seed-ink">
          {isFather ? <IconHome size={14} aria-hidden /> : <IconMeal size={14} aria-hidden />}
        </span>
        <span>
          {livesWith ? (
            <>
              và khoảng <strong className="text-ink">{nf.format(est.meetingsLeft)} ngày</strong> còn
              bên nhau theo nhịp sống cùng hiện tại.
            </>
          ) : (
            <>
              và khoảng{' '}
              <strong className="text-ink">{nf.format(est.meetingsLeft)} lần gặp nữa</strong> theo
              nhịp về thăm hiện tại.
            </>
          )}
        </span>
      </p>

      {/* Thanh tiến trình đời người THẲNG: đã sống xám đậm / chưa sống
          xám nhạt / điểm hiện tại chấm seed viền trắng. */}
      <div className="mt-5 rounded-[14px] border border-line-soft bg-subtle px-4 py-3.5">
        <div className="mb-2.5 flex items-baseline justify-between text-xs font-semibold text-muted">
          <span>Đã sống</span>
          <span className="text-ink-2">đã đi {percent}%</span>
        </div>
        <div className="relative h-[9px] rounded-full bg-track">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-lived-strong"
            style={{ width: `${percent}%` }}
          />
          <span
            aria-hidden
            className="absolute top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5px] border-card bg-brand shadow-[0_0_0_1.5px_var(--seed)]"
            style={{ left: `${percent}%` }}
          />
        </div>
        <p className="mt-2.5 text-right text-xs font-medium text-muted">Phần còn lại phía trước</p>
      </div>

      <blockquote
        className={`mt-4 rounded-r-xl border-l-[3.5px] border-brand bg-subtle px-4 py-3 text-[15.5px] leading-relaxed font-semibold text-ink ${
          revealed ? 'animate-hope-in' : 'opacity-0'
        }`}
      >
        «{hope}»
      </blockquote>

      <div className="mt-4 border-t border-line-soft pt-3">
        <p className="text-sm leading-relaxed text-muted">
          Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ trung bình.
          Nó{' '}
          <strong className="text-ink">
            không phải dự đoán cho riêng {isFather ? 'bố' : 'mẹ'}
          </strong>
          .
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-1 text-sm text-muted">
          Nguồn: bảng sống WHO Việt Nam 2019.
          <button
            type="button"
            onClick={onOpenCalc}
            className="inline-flex min-h-11 items-center gap-0.5 px-1 font-semibold text-brand-strong focus-visible:outline-2 focus-visible:outline-brand-strong"
          >
            Cách tính <IconChevronRight size={14} aria-hidden />
          </button>
        </p>
      </div>

      <div className="pt-4">
        <SceneNav onNext={onNext} onEdit={onEdit} />
      </div>
    </section>
  );
}

/* ── Lưới tuần kể chuyện (Cảnh 3) — hệ lens-04 ──────────────────────
 * Lưới nhóm theo THẬP KỶ: nhãn lề trái (Tuổi + năm), khoảng nghỉ +
 * kẻ mảnh giữa các thập kỷ, chip mốc gold pha nhạt ở thập kỷ bắt đầu
 * 30/40/50/60 tuổi. Chấm ≤7px: đã sống xám trung tính, chưa sống xám
 * rất nhạt; «tuần này» = chấm seed lớn nhân gold + pill nhãn ngay
 * dưới hàng chứa nó. Legend trên đầu lưới; thẻ thống kê phụ nằm
 * DƯỚI lưới (sửa bắt buộc của panel — lưới phải lộ diện trong khung
 * hình đầu). */
const LifeStory = memo(function LifeStory({
  life,
  birthYear,
}: {
  life: LifeGrid;
  birthYear: number;
}) {
  const rows = Math.ceil(life.totalWeeks / 52);
  const currentRow = Math.floor(life.weeksLived / 52);
  const decadeCount = Math.ceil(rows / 10);
  const milestoneAges = [30, 40, 50, 60];

  const dot = (i: number) => {
    if (i >= life.totalWeeks) return null;
    if (i === life.weeksLived) {
      // Chấm «tuần này»: seed lớn, nhân gold, tĩnh tuyệt đối.
      return (
        <span
          key={i}
          className="relative z-10 flex aspect-square w-full items-center justify-center justify-self-center"
        >
          <span className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full bg-brand ring-2 ring-card">
            <span className="h-[5px] w-[5px] rounded-full bg-gold" />
          </span>
        </span>
      );
    }
    return (
      <span
        key={i}
        className={`aspect-square w-full max-w-[7px] justify-self-center rounded-full ${
          i < life.weeksLived ? 'bg-lived' : 'bg-future'
        }`}
      />
    );
  };

  return (
    <div>
      <div className="mt-5 rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] font-medium text-ink-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-lived" /> Đã sống
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-brand">
              <span className="h-[5px] w-[5px] rounded-full bg-gold" />
            </span>
            <strong className="text-seed-ink">Tuần này</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-future" /> Còn lại (ước tính)
          </span>
        </div>

        <div
          role="img"
          aria-label={`Lưới tuần cuộc đời: đã sống ${nf.format(life.weeksLived)} trên tổng số khoảng ${nf.format(life.totalWeeks)} tuần`}
        >
          {Array.from({ length: decadeCount }, (_, d) => {
            const startAge = d * 10;
            const milestone = milestoneAges.includes(startAge) ? startAge : null;
            const decadeRows = Array.from(
              { length: Math.min(10, rows - d * 10) },
              (_, k) => d * 10 + k,
            );
            return (
              <div
                key={d}
                className={`grid gap-3 py-4 md:grid-cols-[118px_1fr] md:gap-5 ${
                  d > 0 ? 'border-t border-line-soft' : ''
                }`}
              >
                <div>
                  <p className="text-[13.5px] font-bold text-ink">
                    Tuổi {startAge}–{startAge + 9}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    {birthYear + startAge} – {birthYear + startAge + 9}
                  </p>
                  {milestone != null && (
                    <span className="mt-2 inline-flex rounded-full border border-gold bg-gold-tint px-2.5 py-1 text-xs font-bold text-gold-ink">
                      {milestone} tuổi · {birthYear + milestone}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-[5px]">
                  {decadeRows.map((r) => (
                    <div key={r}>
                      <div
                        className="grid gap-[3px]"
                        style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
                      >
                        {Array.from({ length: 52 }, (_, c) => dot(r * 52 + c))}
                      </div>
                      {r === currentRow && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_8px_16px_-6px_color-mix(in_srgb,var(--seed)_50%,transparent)]">
                            Bạn đang ở tuần này · tuần {nf.format(life.weeksLived)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thẻ thống kê phụ — DƯỚI lưới theo sửa bắt buộc của panel. */}
      <div className="mt-5 grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-card px-3 py-4 text-center">
          <p className="font-display text-[21px] font-extrabold text-ink">
            {nf.format(life.daysLived)}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">ngày đã sống</p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-3 py-4 text-center">
          <p className="font-display text-[21px] font-extrabold text-ink">
            ≈ {nf.format(life.fullMoons)}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">lần trăng tròn đã qua</p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-3 py-4 text-center">
          <p className="font-display text-[21px] font-extrabold text-ink">
            {nf.format(life.tetsExperienced)}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">cái Tết bạn đã trải qua</p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-3 py-4 text-center">
          <p className="font-display text-[21px] font-extrabold text-ink">
            {fmt1(life.percentLived)}%
          </p>
          <p className="mt-0.5 text-[13px] text-muted">đời người đã qua (thống kê)</p>
        </div>
      </div>
    </div>
  );
});

/* ── Cảnh 4 «Gửi đi» ─────────────────────────────────────────────────
 * Xem trước thẻ vẽ lại từ canvas mỗi khi kết quả đổi; hàng hành động
 * chính bám đáy chỉ trong phạm vi cảnh này. «Làm lại từ đầu» đi qua
 * modal xác nhận (V121: khoá cuộn nền + backdrop) + hoàn tác 8 giây,
 * không bao giờ xoá sau 1 chạm. */
function ShareScene({
  ref,
  result,
  input,
  copied,
  onCopy,
  onDownload,
  deletePhase,
  keepButtonRef,
  resetButtonRef,
  onRequestReset,
  onCancelReset,
  onConfirmReset,
  onEdit,
}: {
  ref: React.Ref<HTMLElement>;
  result: CalcResult;
  input: InputData;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  deletePhase: 'idle' | 'confirming' | 'deleted';
  keepButtonRef: React.RefObject<HTMLButtonElement | null>;
  resetButtonRef: React.RefObject<HTMLButtonElement | null>;
  onRequestReset: () => void;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  onEdit: () => void;
}) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // V122 (S-NEW-1, ghế 2 panel v1.2.1): FOCUS TRAP cho dialog xác
  // nhận xoá. v1.2.1 đã có role="dialog" aria-modal="true" + khoá
  // cuộn + backdrop, nhưng KHÔNG chứa được focus: Tab thoát ra nền
  // ngay từ phím đầu tiên (đo lại: 24/24 Tab ra ngoài) và Enter kích
  // hoạt được <details> nền trong lúc dialog còn mở — nền không hề
  // inert như aria-modal tuyên bố. Nay khi dialog mở, keydown
  // Tab/Shift+Tab chỉ vòng trong các phần tử focus được của dialog;
  // focus lỡ nằm ngoài dialog (mở bằng chạm, script…) thì Tab kéo
  // về trong thay vì đi tiếp ở nền, nên không phần tử nền nào nhận
  // focus/kích hoạt bàn phím được khi dialog còn mở. Mẫu tham chiếu:
  // useFocusTrap của dichbome — ở đây app chỉ có MỘT dialog tại một
  // thời điểm nên không cần ngăn xếp trap; Esc, focus mở («Giữ
  // lại»), trả focus và khoá cuộn giữ nguyên các effect hiện hữu.
  useEffect(() => {
    if (deletePhase !== 'confirming') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !dialog.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [deletePhase]);

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
    <section ref={ref} aria-label="Gửi đi" className="scroll-mt-2 py-6 lg:py-8">
      <div className="grid items-start gap-5 lg:grid-cols-[460px_1fr]">
        {/* Xem trước thẻ kết quả (canvas 1080×1350 thu nhỏ). */}
        <div>
          {cardUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cardUrl}
              alt="Thẻ kết quả Còn Mấy Cái Tết Nữa?"
              className="mx-auto w-full max-w-[460px] rounded-[24px] border border-line bg-card shadow-[var(--shadow-card-lg)]"
            />
          )}
          <p className="mt-3 text-center text-[12.5px] text-muted">
            Xem trước thẻ kết quả — ảnh tải về có kích thước 1080 × 1350.
          </p>
        </div>

        {/* Thẻ hành động sticky. */}
        <div className="rounded-[20px] border border-line bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-5">
          <h2 className="font-display text-[25px] leading-tight font-extrabold text-ink">
            Gửi cho người thân
          </h2>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onCopy}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-brand px-5 py-3 text-base font-bold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              <IconCopy size={16} aria-hidden /> {copied ? 'Đã sao chép!' : 'Copy kết quả'}
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] border border-line-control bg-card px-5 py-3 text-base font-bold text-ink transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              <IconDownload size={16} aria-hidden /> Tải ảnh thẻ kết quả
            </button>
            {deletePhase === 'idle' && (
              <button
                type="button"
                ref={resetButtonRef}
                onClick={onRequestReset}
                className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-card px-5 py-3 text-base font-semibold text-ink-2 transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                <IconReset size={15} aria-hidden /> Làm lại từ đầu
              </button>
            )}
          </div>
          <span aria-live="polite" className="sr-only">
            {copied ? 'Đã sao chép kết quả.' : ''}
          </span>

          <div className="mt-5 flex items-start gap-3 rounded-[13px] border border-line-soft bg-subtle px-4 py-3.5">
            <span className="mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-seed-soft text-seed-ink">
              <IconCheck size={13} aria-hidden />
            </span>
            <p className="text-sm leading-relaxed text-ink-2">
              Không tài khoản, không gửi dữ liệu đi.
            </p>
          </div>

          {missing && (
            <p className="mt-4 flex flex-wrap items-center gap-1 text-sm text-muted">
              Muốn đếm thêm cho {missing.label}?
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 font-semibold text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                <IconArrowUp size={14} aria-hidden /> Sửa lại
              </button>
            </p>
          )}
        </div>
      </div>

      {deletePhase === 'confirming' && (
        /* V121 (SERIOUS-2 của panel v1.2.0): xác nhận xoá là MODAL
           phủ toàn màn — trước đây là khối tại chỗ trong luồng trang
           nên người dùng cuộn/chạm đi nơi khác được trong lúc xác
           nhận treo (và sửa form được sau lưng khối xác nhận). Nay:
           nền bị khoá cuộn (effect ở component cha) + bị backdrop
           che kín + focus bị trap trong dialog (V122, S-NEW-1 —
           effect ngay trên ShareScene) — chạm vào backdrop = nhánh AN TOÀN «Giữ lại»
           (không bao giờ xoá, dữ liệu nguyên vẹn, focus về nút
           «Làm lại từ đầu»); chạm vào panel không xuyên xuống
           backdrop. Ngữ nghĩa giữ nguyên: «Xoá» mới xoá thật, sau
           xoá vẫn là cửa sổ hoàn tác 8 giây ở component cha. */
        <div
          ref={dialogRef}
          className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
        >
          <div aria-hidden className="absolute inset-0 bg-neutral-100/60" onClick={onCancelReset} />
          <div className="relative w-full max-w-[34rem] rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-lift)]">
            <p id="reset-confirm-title" className="text-sm font-semibold text-ink">
              Xoá hết dữ liệu đã nhập?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onConfirmReset}
                className="flex min-h-11 items-center rounded-xl bg-error-solid px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                Xoá
              </button>
              <button
                type="button"
                ref={keepButtonRef}
                onClick={onCancelReset}
                className="flex min-h-11 items-center rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                Giữ lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pha 'deleted' không render ở đây: ShareScene bị unmount
          ngay khi xoá (cổng hasAnyResult) — thanh «Đã xoá — Hoàn
          tác» sống ở component cha (TC-1). */}
    </section>
  );
}
