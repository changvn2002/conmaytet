'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { calculate, parseBirthDate, validateInput } from '@/lib/calc';
import { tetWeekIndices } from '@/lib/lunar';
import { buildShareText, drawShareCard } from '@/lib/share-card';
import { clearInput, loadInput, saveInput } from '@/lib/storage';
import type { CalcResult, InputData, LifeGrid, ParentEstimate, Sex } from '@/lib/types';
import { OfflineBar } from './offline-bar';
import { ProfileAvatar } from './avatar';
import { PeachBranch } from './branch';
import { CalcFaqDisclosures, DisclosureSections } from './disclosure';
import {
  IconArrowDown,
  IconArrowUp,
  IconBanhChung,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconHome,
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

/* ── Ngày sinh 3 đoạn DD / MM / YYYY (F1 vòng 2) ──────────────────
 * Ô date native bị panel bác (mm/dd/yyyy kiểu Mỹ + icon lịch gốc).
 * Giá trị lưu/truyền đi VẪN là ISO 'yyyy-mm-dd' trong FormState.birth
 * như cũ; 3 đoạn chỉ là tầng nhập. Chỉ khi đủ cả 3 đoạn (năm đủ 4 số)
 * mới hợp thành ISO — kể cả ngày không tồn tại trên lịch (31/02) —
 * để tầng validate hiện hành bắt lỗi đúng như trước; đoạn đang gõ dở
 * thì birth = '' (đúng ngữ nghĩa «chưa nhập» của input native, không
 * lỗi nhấp nháy, không kết quả dở). */
interface BirthSeg {
  d: string;
  m: string;
  y: string;
}

const EMPTY_SEG: BirthSeg = { d: '', m: '', y: '' };

function segFromIso(iso: string): BirthSeg {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return EMPTY_SEG;
  return { d: match[3], m: match[2], y: match[1] };
}

function isoFromSeg(seg: BirthSeg): string {
  if (!seg.d || !seg.m || seg.y.length !== 4) return '';
  return `${seg.y}-${seg.m.padStart(2, '0')}-${seg.d.padStart(2, '0')}`;
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

/**
 * Điều hướng giữa các cảnh: lối tắt có chủ đích, cuộn tự do vẫn chạy.
 * Vòng 2 (F4): nút YÊN TĨNH nhưng có hình hài nút thật — «Tiếp» nền
 * seed-soft + viền seed, «Sửa lại» nền thẻ + viền control — không
 * còn hai chữ link trần. ĐÍCH ĐẾN do nơi gọi quyết định và là bất
 * biến điều hướng: thẻ Bố → thẻ Mẹ → lưới tuần → Gửi đi (S-NEW-2).
 */
function SceneNav({ onNext, onEdit }: { onNext: (() => void) | null; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-11 items-center gap-1.5 rounded-xl border border-brand bg-seed-soft px-5 py-2 text-sm font-bold text-seed-ink transition-colors hover:bg-seed-tint"
        >
          Tiếp <IconArrowDown size={16} aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line-control bg-card px-5 py-2 text-sm font-semibold text-ink-2 transition-colors hover:border-brand"
      >
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
  // 3 đoạn nhập ngày sinh (DD/MM/YYYY) — nguồn sự thật vẫn là
  // form.birth dạng ISO; state này giữ cả phần đang gõ dở.
  const [birthSeg, setBirthSeg] = useState<BirthSeg>(EMPTY_SEG);
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

  // Đồng bộ 3 đoạn ngày sinh khi form.birth đổi TỪ BÊN NGOÀI (nạp
  // storage, hoàn tác, xoá): nếu ISO hợp thành từ 3 đoạn hiện tại đã
  // khớp form.birth thì giữ nguyên (đang gõ), lệch thì nạp lại đoạn.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setBirthSeg((prev) => (isoFromSeg(prev) === form.birth ? prev : segFromIso(form.birth)));
  }, [form.birth]);

  /** Gõ một đoạn ngày sinh: chỉ giữ chữ số, đủ 2 số thì tự sang đoạn kế. */
  function updateBirthSeg(part: keyof BirthSeg, raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, part === 'y' ? 4 : 2);
    const next = { ...birthSeg, [part]: digits };
    setBirthSeg(next);
    updateForm({ ...form, birth: isoFromSeg(next) });
    if (part !== 'y' && digits.length === 2) {
      document.getElementById(part === 'd' ? 'birth-month' : 'birth-year')?.focus();
    }
  }

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
      // nằm trong thanh (nút «Hoàn tác») thì đưa focus về ô ngày sinh #birth-day
      // TRƯỚC khi gỡ thanh, không để focus rơi về BODY. Guard: người
      // dùng đã tự di chuyển focus đi nơi khác trong cửa sổ thì
      // không giành lại. KHÔNG dùng preventScroll: lúc hết hạn #birth
      // nằm ngoài mép trên viewport nên focus phải cuộn nó vào view
      // (khác nhánh hoàn tác/huỷ vốn dùng preventScroll — giữ nguyên).
      const active = document.activeElement;
      if (active && deletedBarRef.current?.contains(active)) {
        document.getElementById('birth-day')?.focus();
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
    setBirthSeg(EMPTY_SEG);
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
    window.setTimeout(
      () => document.getElementById('birth-day')?.focus({ preventScroll: true }),
      0,
    );
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
    window.setTimeout(
      () => document.getElementById('birth-day')?.focus({ preventScroll: true }),
      0,
    );
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
          <div className="overflow-hidden rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-7 lg:sticky lg:top-5">
            {/* F2 vòng 2 neo cành tràn mép phải — VÒNG 4 (H3, luật
                TRỌN KHUNG của panel vòng 3) THAY THẾ: cành hero nằm
                TRỌN trong thẻ, đầu cành kết thúc trước mép phải với
                khoảng lề rõ (toạ độ hero trong branch.tsx đã lùi
                vào trong viewBox), không bông nào bị mép thẻ cắt. */}
            <div className="-mt-2">
              <div className="ml-auto w-full max-w-[430px]">
                <PeachBranch variant="hero" className="h-auto w-full" />
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
                <span id="birth-label" className="mb-2 block text-[15px] font-semibold text-ink">
                  Ngày sinh của bạn
                </span>
                {/* F1 vòng 2: control ngày sinh THIẾT KẾ RIÊNG 3 đoạn
                    DD / MM / YYYY — hết bóng dáng ô date native (không
                    mm/dd/yyyy kiểu Mỹ, không icon lịch gốc). Nhóm mang
                    id #birth: vòng focus 1 lớp hiện trên nhóm qua
                    :focus-within (globals.css), thứ tự Tab chạy
                    Ngày → Tháng → Năm, aria-invalid/describedby của
                    nhóm và từng đoạn trỏ đúng khối notices-self như
                    bất biến cũ. */}
                <div
                  id="birth"
                  role="group"
                  aria-labelledby="birth-label"
                  aria-invalid={notices.errors.self.length > 0 || undefined}
                  aria-describedby={
                    notices.errors.self.length + notices.warnings.self.length > 0
                      ? 'notices-self'
                      : undefined
                  }
                  className="flex min-h-[54px] w-full items-center gap-1 rounded-[13px] border border-line-control bg-card px-3 py-1 transition-colors"
                >
                  <input
                    id="birth-day"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-day"
                    placeholder="DD"
                    aria-label="Ngày sinh — ngày"
                    value={birthSeg.d}
                    onChange={(e) => updateBirthSeg('d', e.target.value)}
                    aria-invalid={notices.errors.self.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.self.length + notices.warnings.self.length > 0
                        ? 'notices-self'
                        : undefined
                    }
                    className="h-11 w-12 shrink-0 bg-transparent text-center text-base text-ink tabular-nums outline-none"
                  />
                  <span aria-hidden className="shrink-0 font-semibold text-faint">
                    /
                  </span>
                  <input
                    id="birth-month"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-month"
                    placeholder="MM"
                    aria-label="Ngày sinh — tháng"
                    value={birthSeg.m}
                    onChange={(e) => updateBirthSeg('m', e.target.value)}
                    aria-invalid={notices.errors.self.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.self.length + notices.warnings.self.length > 0
                        ? 'notices-self'
                        : undefined
                    }
                    className="h-11 w-12 shrink-0 bg-transparent text-center text-base text-ink tabular-nums outline-none"
                  />
                  <span aria-hidden className="shrink-0 font-semibold text-faint">
                    /
                  </span>
                  <input
                    id="birth-year"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday-year"
                    placeholder="YYYY"
                    aria-label="Ngày sinh — năm"
                    value={birthSeg.y}
                    onChange={(e) => updateBirthSeg('y', e.target.value)}
                    aria-invalid={notices.errors.self.length > 0 || undefined}
                    aria-describedby={
                      notices.errors.self.length + notices.warnings.self.length > 0
                        ? 'notices-self'
                        : undefined
                    }
                    className="h-11 w-[4.75rem] shrink-0 bg-transparent text-center text-base text-ink tabular-nums outline-none"
                  />
                  <span className="ml-auto shrink-0 pl-2 text-muted">
                    <IconCalendar size={19} aria-hidden />
                  </span>
                </div>
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
                        className={`flex min-h-[52px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[13px] border px-1.5 py-2.5 text-sm whitespace-nowrap transition-colors sm:gap-2 sm:px-3 sm:text-[15px] ${
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
                    className="min-h-[54px] w-full rounded-[13px] border border-line-control bg-card px-4 py-3 text-base text-ink transition-colors"
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
                    className="min-h-[54px] w-full rounded-[13px] border border-line-control bg-card px-4 py-3 text-base text-ink transition-colors"
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
                  className="flex min-h-11 w-full items-center gap-3.5 rounded-[14px] border border-line-soft bg-subtle px-4 py-3.5 text-left"
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
                    className="w-full"
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
                className={`flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold transition-colors ${
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
                onNext={afterScene2}
                onEdit={goScene1}
              />
            )}
          </div>
          {/* F4 vòng 2 gộp KHỐI disclaimer dưới cả hai thẻ; G2a vòng 3
              (lệnh gộp câu của coordinator theo VERDICT panel vòng 2):
              khi có CẢ bố và mẹ, khối chỉ còn MỘT câu gộp «…cho riêng
              bố hay mẹ.» — hết cảnh hai câu gần nguyên văn in liên
              tiếp như lỗi copy-paste. Trường hợp chỉ 1 người giữ
              nguyên câu gốc của người đó. SceneNav vẫn nằm trong
              chân từng thẻ như cũ. */}
          <div className="mt-5 rounded-[18px] border border-line-soft bg-subtle px-5 py-4">
            {result.father && result.mother ? (
              <p className="text-sm leading-relaxed text-muted">
                Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ trung
                bình. Nó{' '}
                <strong className="text-ink">không phải dự đoán cho riêng bố hay mẹ</strong>.
              </p>
            ) : (
              <>
                {result.father && (
                  <p className="text-sm leading-relaxed text-muted">
                    Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ
                    trung bình. Nó{' '}
                    <strong className="text-ink">không phải dự đoán cho riêng bố</strong>.
                  </p>
                )}
                {result.mother && (
                  <p className="text-sm leading-relaxed text-muted">
                    Đây là <strong className="text-ink">ước tính thống kê</strong> theo tuổi thọ
                    trung bình. Nó{' '}
                    <strong className="text-ink">không phải dự đoán cho riêng mẹ</strong>.
                  </p>
                )}
              </>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-x-1 text-sm text-muted">
              Nguồn: bảng sống WHO Việt Nam 2019.
              <button
                type="button"
                onClick={openCalc}
                className="inline-flex min-h-11 items-center gap-0.5 px-1 font-semibold text-brand-strong"
              >
                Cách tính <IconChevronRight size={14} aria-hidden />
              </button>
            </p>
          </div>
          {/* Điều hướng đi tiếp nằm ở chân TỪNG thẻ kết quả (xem
              ParentStage) — giữ nguyên cách sửa của v1.2.1. Chuỗi bất
              biến: Bố «Tiếp» → thẻ Mẹ → lưới tuần → Gửi đi. */}
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
            {/* F3 vòng 2: header weeks THUẦN TYPOGRAPHIC + thanh tổng —
                bỏ avatar chữ «B» (bị đọc nhầm là Bố). */}
            <div className="flex flex-wrap items-center gap-4">
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
            birthDate={effectiveInput.myBirthDate}
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

      {/* ── Tầng disclosure dưới trang (H5 vòng 4): khi ĐÃ có kết
          quả, «Cách tính» + «Hỏi đáp» đã chuyển vào cột phải của
          Cảnh 4 (trong ShareScene) nên tầng dưới chỉ còn «Quyền
          riêng tư»; CHƯA có kết quả thì cả 3 khối ở đây như cũ.
          Mỗi khối chỉ tồn tại đúng 1 lần trong DOM tại mọi thời
          điểm. (Trước vòng 4 tầng này render ở page.tsx — chuyển
          vào đây vì chỉ component này biết hasAnyResult.) */}
      {hasAnyResult ? <DisclosureSections items={['privacy']} /> : <DisclosureSections />}

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
              className="flex min-h-11 shrink-0 items-center rounded-xl px-3 py-2 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-tint"
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
  onNext,
  onEdit,
  stageId,
}: {
  kind: 'father' | 'mother';
  birthYear: number | null;
  est: ParentEstimate;
  livesWith: boolean;
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
      className="relative scroll-mt-2 overflow-hidden rounded-[22px] border border-line bg-card p-6 shadow-[var(--shadow-card)] sm:p-7"
    >
      {/* G2b vòng 3 dùng WATERMARK lớn bị mép thẻ cắt — VÒNG 4 (H2,
          luật TRỌN KHUNG) XOÁ watermark: thay bằng minh hoạ TRỌN
          VẸN ~82px ở góc trên-phải TRONG thẻ (đúng vị trí chip cũ
          của vòng 2, nay nằm trong luồng của hàng đầu thẻ nên
          không bao giờ chạm mép): NHÀ cho bố (nét seed), BÁNH
          CHƯNG cho mẹ (nét gold-ink; J3 vòng 5 thay icon bát/hơi
          bị đọc thành mặt cười) — cùng hệ nét với icon của app.
          Tint trích dẫn + viền trích dẫn phân biệt hai thẻ của
          vòng 3 giữ nguyên (xem blockquote dưới). */}
      <div className="relative">
        <div className="flex items-start gap-4">
          <ProfileAvatar role={kind} birthYear={birthYear} name={person} size={78} />
          <div className="min-w-0">
            <h3 className="text-[19px] font-extrabold text-ink">{person}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {birthYear != null && (
                <p className="text-sm font-medium text-muted">Sinh năm {birthYear}</p>
              )}
              <span className="rounded-full border border-line bg-subtle px-2.5 py-1 text-xs font-bold text-ink-2">
                {est.currentAge} tuổi
              </span>
            </div>
          </div>
          {/* Minh hoạ trọn vẹn ở góc trên-phải (H2 vòng 4) — trong
              luồng, cách mọi mép thẻ đúng bằng padding của thẻ. */}
          <span
            aria-hidden
            className={`ml-auto shrink-0 ${isFather ? 'text-brand' : 'text-gold-ink'}`}
          >
            {isFather ? (
              <IconHome size={82} aria-hidden style={{ strokeWidth: 1.55 }} />
            ) : (
              <IconBanhChung size={82} aria-hidden style={{ strokeWidth: 1.55 }} />
            )}
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
            {isFather ? (
              <IconHome size={14} aria-hidden />
            ) : (
              <IconBanhChung size={14} aria-hidden />
            )}
          </span>
          <span>
            {livesWith ? (
              <>
                và khoảng <strong className="text-ink">{nf.format(est.meetingsLeft)} ngày</strong>{' '}
                còn bên nhau theo nhịp sống cùng hiện tại.
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
          <p className="mt-2.5 text-right text-xs font-medium text-muted">
            Phần còn lại phía trước
          </p>
        </div>

        {/* Khối trích dẫn phân biệt hai thẻ (F4 vòng 2 + G2b vòng 3):
            viền bố = seed / nền xám nhạt; viền mẹ = gold sẫm / nền
            gold RẤT NHẠT (gold-soft) khớp viền gold-ink — hai thẻ
            khác nhau thấy rõ ngay ở cái nhìn đầu tiên. */}
        <blockquote
          className={`mt-4 rounded-r-xl border-l-[3.5px] ${
            isFather ? 'border-brand bg-subtle' : 'border-gold-ink bg-gold-soft'
          } px-4 py-3 text-[15.5px] leading-relaxed font-semibold text-ink ${
            revealed ? 'animate-hope-in' : 'opacity-0'
          }`}
        >
          «{hope}»
        </blockquote>

        {/* Disclaimer + «Cách tính ›» KHÔNG còn trong thẻ: đã gộp thành
            MỘT khối dưới cả hai thẻ ở Cảnh 2 (F4 vòng 2, gộp câu G2a
            vòng 3). SceneNav giữ nguyên trong chân thẻ như v1.2.1,
            chỉ restyle (xem SceneNav). */}
        <div className="mt-5">
          <SceneNav onNext={onNext} onEdit={onEdit} />
        </div>
      </div>
    </section>
  );
}

/* ── Lưới tuần kể chuyện (Cảnh 3) — hệ lens-04 ──────────────────────
 * Lưới nhóm theo THẬP KỶ: nhãn lề trái (Tuổi + năm), khoảng nghỉ +
 * kẻ mảnh giữa các thập kỷ, chip mốc gold pha nhạt ở thập kỷ bắt đầu
 * 30/40/50/60 tuổi. Thập kỷ xen kẽ dải nền cực nhạt. Legend trên
 * đầu lưới; thống kê phụ là MỘT hàng yên tĩnh dưới lưới.
 * VÒNG 3 (G1): marker THAY THẾ chấm tại đúng (hàng năm hiện tại ×
 * cột tuần hiện tại); tuần còn lại = chấm RỖNG vành #B9C0C8 ruột
 * trong suốt (đã sống vẫn đặc); nhịp dọc hàng năm 8px + khoảng
 * cách khối thập kỷ tăng.
 * VÒNG 4 (H1, bài học meta: phần tử «đặc biệt» chèn vào lưới LUÔN
 * đọc như vật lạ): BỎ dải tint sau hàng marker (vòng 3) — lưới giữ
 * ĐỒNG NHẤT TUYỆT ĐỐI, marker chỉ là chấm thay thế đúng nhịp lưới
 * cỡ ~2,5× chấm thường. Vai trò «bạn đang ở đây» chuyển ra một
 * PHẦN TỬ RIÊNG ngoài lưới: dải «năm hiện tại phóng to» ngay dưới
 * khối tổng quan của cảnh (52 tuần của năm nay, chấm ~11px, tối đa
 * 2 hàng, nhãn nguyên văn câu chip cũ) — và chip ở hàng tiêu đề
 * thập kỷ cũng bỏ, nhãn đó nay chỉ sống ở dải phóng to. */
const LifeStory = memo(function LifeStory({
  life,
  birthYear,
  birthDate,
}: {
  life: LifeGrid;
  birthYear: number;
  /** Ngày sinh ISO đầy đủ — gốc để tính tuần chứa Tết (J4). */
  birthDate: string;
}) {
  const rows = Math.ceil(life.totalWeeks / 52);
  const currentRow = Math.floor(life.weeksLived / 52);
  const decadeCount = Math.ceil(rows / 10);
  const milestoneAges = [30, 40, 50, 60];
  // Tuần chứa Tết (J4 vòng 5 · K3 vòng 6): chỉ số các tuần chứa
  // mùng 1 Tết, tính từ chính tetDate() của lib/lunar qua
  // tetWeekIndices — không hardcode ngày nào. Từ vòng 6 tập này
  // CHỈ còn cấp cho dải năm phóng to (lưới lớn đã rút chấm gold);
  // hàm tetWeekIndices và test của nó giữ nguyên.
  const tetWeeks = useMemo(() => {
    const birth = parseBirthDate(birthDate);
    return birth ? tetWeekIndices(birth, life.totalWeeks) : new Set<number>();
  }, [birthDate, life.totalWeeks]);

  const dot = (i: number) => {
    if (i >= life.totalWeeks) return null;
    if (i === life.weeksLived) {
      // Marker «tuần này» (G1a vòng 3 + H1 vòng 4): THAY THẾ chấm
      // tại đúng vị trí của nó trong lưới (hàng năm hiện tại × cột
      // tuần hiện tại) — chấm đã sống đặc bên trái và chấm rỗng bên
      // phải trên CÙNG hàng, CÙNG nhịp lưới, thấy rõ quanh marker;
      // KHÔNG dải nền riêng nữa (vòng 3 bị cả 5 ghế đọc là băng
      // chèn vào lưới). Cỡ 17px ≈ 2,5× chấm thường 7px theo đúng
      // VERDICT vòng 4: vành seed + vòng trắng + đĩa seed + nhân
      // gold. Tĩnh tuyệt đối.
      return (
        <span
          key={i}
          data-today-marker="true"
          className="relative z-10 flex aspect-square w-full items-center justify-center justify-self-center self-center"
        >
          <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border-2 border-brand bg-card shadow-[0_0_0_2.5px_var(--card)]">
            <span className="flex h-[9px] w-[9px] items-center justify-center rounded-full bg-brand">
              <span className="h-[3px] w-[3px] rounded-full bg-gold" />
            </span>
          </span>
        </span>
      );
    }
    // K3 vòng 6: chấm Tết GOLD ĐÃ RÚT khỏi lưới lớn — ở khổ lưới
    // 390/4.177 chấm, chấm gold mỗi năm một cái đọc thành nhiễu/
    // bụi vàng (panel vòng 5, 4/5 ghế). Tuần chứa Tết trong lưới
    // lớn nay rơi xuống hai nhánh thường dưới đây (đã sống = đặc,
    // còn lại = rỗng) — lưới trở lại đúng ba trạng thái của vòng
    // 4. Chấm Tết CHỈ còn sống trong dải năm phóng to (xem dưới),
    // nơi cỡ chấm 11px đủ lớn để đọc thành dữ kiện.
    if (i < life.weeksLived) {
      // Đã sống: chấm ĐẶC xám như cũ. self-center: hàng chứa
      // marker cao 17px — chấm phải nằm CÙNG ĐƯỜNG TÂM với marker
      // (J1 vòng 5; thiếu căn giữa dọc, chấm dồn lên đỉnh hàng
      // cao làm marker trông như đứng một mình trong hàng trống).
      return (
        <span
          key={i}
          className="aspect-square w-full max-w-[7px] justify-self-center self-center rounded-full bg-lived"
        />
      );
    }
    // Còn lại (G1b vòng 3): chấm RỖNG — vành #B9C0C8 (token
    // future-ring), ruột TRONG SUỐT — thay chấm đặc xám nhạt cũ,
    // để đường biên đã sống / còn lại tự lộ trong lưới.
    return (
      <span
        key={i}
        className="aspect-square w-full max-w-[7px] justify-self-center self-center rounded-full border-[1.25px] border-future-ring bg-transparent"
      />
    );
  };

  // Dải «năm hiện tại phóng to» (H1 vòng 4): 52 tuần của ĐÚNG hàng
  // năm chứa tuần hiện tại trong lưới lớn, vẽ lại ở cỡ ~11px trên
  // lưới 26 cột (tối đa 2 hàng) — đã qua ĐẶC, còn lại RỖNG, tuần này
  // là marker lớn cùng hệ (vành seed + đĩa seed + nhân gold).
  const yearStripStart = currentRow * 52;

  return (
    <div>
      {/* Phần tử RIÊNG ngoài lưới mang vai trò «bạn đang ở đây» —
          nằm ngay dưới khối tổng quan của cảnh (thẻ tiêu đề + thanh
          tổng ở component cha), TRƯỚC thẻ lưới lớn. Nhãn dùng
          nguyên văn câu chip cũ ở hàng tiêu đề thập kỷ (chip đó đã
          bỏ — nhãn chỉ còn ở đây và legend «Tuần này»). */}
      <div
        data-current-year-strip="true"
        className="mt-5 rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
            Bạn đang ở tuần này · tuần {nf.format(life.weeksLived)}
          </span>
          {/* Legend «Cái Tết» (K3 vòng 6): dời từ hàng legend của
              lưới lớn vào ĐÂY — cạnh nhãn tuần này, trong chính
              thẻ dải phóng to, nơi chấm gold duy nhất còn tồn
              tại. Chữ «Cái Tết» giữ nguyên văn đã duyệt ở J4. */}
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" /> Cái Tết
          </span>
        </div>
        <div
          aria-hidden
          className="mt-4 grid items-center gap-y-[6px]"
          style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}
        >
          {Array.from({ length: 52 }, (_, k) => {
            const i = yearStripStart + k;
            if (i >= life.totalWeeks) return <span key={i} />;
            if (i === life.weeksLived) {
              return (
                <span key={i} className="flex items-center justify-center justify-self-center">
                  <span className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border-2 border-brand bg-card">
                    <span className="flex h-[11px] w-[11px] items-center justify-center rounded-full bg-brand">
                      <span className="h-[4px] w-[4px] rounded-full bg-gold" />
                    </span>
                  </span>
                </span>
              );
            }
            if (tetWeeks.has(i)) {
              // Tuần chứa Tết trong dải phóng to (J4): chấm gold
              // 11px CÙNG CỠ chấm thường của dải; tuần này (marker
              // ở nhánh trên) vẫn thắng khi trùng.
              return (
                <span
                  key={i}
                  data-tet-dot="true"
                  className="h-[11px] w-[11px] justify-self-center self-center rounded-full bg-gold"
                />
              );
            }
            if (i < life.weeksLived) {
              return (
                <span
                  key={i}
                  className="h-[11px] w-[11px] justify-self-center self-center rounded-full bg-lived"
                />
              );
            }
            return (
              <span
                key={i}
                className="h-[11px] w-[11px] justify-self-center self-center rounded-full border-[1.25px] border-future-ring bg-transparent"
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] font-medium text-ink-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-lived" /> Đã sống
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-brand bg-card">
              <span className="flex h-[9px] w-[9px] items-center justify-center rounded-full bg-brand">
                <span className="h-[3px] w-[3px] rounded-full bg-gold" />
              </span>
            </span>
            <strong className="text-seed-ink">Tuần này</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-[1.25px] border-future-ring bg-transparent" />{' '}
            Còn lại (ước tính)
          </span>
          {/* K3 vòng 6: mục legend «Cái Tết» ĐÃ DỜI khỏi hàng
              legend của lưới lớn vào thẻ dải năm phóng to (nơi
              duy nhất còn chấm Tết) — xem thẻ dải ở trên. */}
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
                className={`-mx-1 rounded-2xl px-3 py-5 sm:mx-0 sm:px-4 ${
                  d > 0 ? 'mt-4' : 'mt-1'
                } ${d % 2 === 1 ? 'bg-subtle' : ''}`}
              >
                {/* Hàng tiêu đề thập kỷ (F3 vòng 2): nhãn tuổi/năm rõ +
                    chip mốc ở đúng thập kỷ của nó — không pill nào đè
                    lên chấm nữa. Dải nền thập kỷ xen kẽ cực nhạt (lẻ =
                    subtle) tạo nhịp nghỉ cho tường chấm. */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="text-[13.5px] font-bold text-ink">
                    Tuổi {startAge}–{startAge + 9}
                  </p>
                  <p className="text-xs font-medium text-muted">
                    {birthYear + startAge} – {birthYear + startAge + 9}
                  </p>
                  {milestone != null && (
                    <span className="inline-flex rounded-full border border-gold bg-gold-tint px-2.5 py-1 text-xs font-bold text-gold-ink">
                      {milestone} tuổi · {birthYear + milestone}
                    </span>
                  )}
                  {/* Chip «Bạn đang ở tuần này» ở hàng tiêu đề thập
                      kỷ ĐÃ BỎ (H1 vòng 4): nhãn đó chỉ còn ở dải
                      «năm hiện tại phóng to» riêng phía trên lưới. */}
                </div>
                {/* G1 vòng 3: nhịp dọc giữa các hàng năm giãn rõ
                    (gap 5→8px). H1 vòng 4: hàng chứa marker KHÔNG
                    còn dải nền riêng — mọi hàng giữ đúng một nhịp
                    lưới đồng nhất, marker chỉ thay chấm tại chỗ. */}
                <div className="mt-3.5 flex flex-col gap-[8px]">
                  {decadeRows.map((r) => (
                    <div
                      key={r}
                      data-today-row={r === currentRow || undefined}
                      className="grid items-center gap-[3px]"
                      style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
                    >
                      {Array.from({ length: 52 }, (_, c) => dot(r * 52 + c))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thống kê phụ DƯỚI lưới (F3 vòng 2): MỘT hàng thống kê yên
          tĩnh trong một khung duy nhất, các ô ngăn bằng kẻ phân cách
          mảnh — hết lưới 2×2 kiểu dashboard. */}
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-card sm:grid-cols-4">
        <div className="border-r border-b border-line-soft px-3 py-4 text-center sm:border-b-0">
          <p className="font-display text-[20px] font-extrabold text-ink">
            {nf.format(life.daysLived)}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">ngày đã sống</p>
        </div>
        <div className="border-b border-line-soft px-3 py-4 text-center sm:border-r sm:border-b-0">
          <p className="font-display text-[20px] font-extrabold text-ink">
            ≈ {nf.format(life.fullMoons)}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">lần trăng tròn đã qua</p>
        </div>
        <div className="border-r border-line-soft px-3 py-4 text-center">
          <p className="font-display text-[20px] font-extrabold text-ink">
            {nf.format(life.tetsExperienced)}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">cái Tết bạn đã trải qua</p>
        </div>
        <div className="px-3 py-4 text-center">
          <p className="font-display text-[20px] font-extrabold text-ink">
            {fmt1(life.percentLived)}%
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">đời người đã qua (thống kê)</p>
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
  // F5 vòng 2: ở mobile, xem trước thẻ thu nhỏ không đọc được — thay
  // bằng khối tóm tắt native; thẻ đầy đủ mở toàn màn hình khi bấm
  // «Xem thẻ đầy đủ». Desktop giữ nguyên xem trước thẻ thật.
  const [showFullCard, setShowFullCard] = useState(false);
  const closeCardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showFullCard) return;
    closeCardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFullCard(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFullCard]);

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
        {/* Mobile (<lg): khối tóm tắt NATIVE dễ đọc thay cho thẻ thu
            nhỏ (F5) — avatar + số lớn + câu riêng từng người, đúng
            ngôn ngữ của thẻ; thẻ thật mở toàn màn hình bằng nút dưới. */}
        <div className="lg:hidden">
          <div className="divide-y divide-line-soft rounded-[20px] border border-line bg-card px-5 shadow-[var(--shadow-card)]">
            {result.father && (
              <div className="flex items-center gap-3.5 py-4">
                <ProfileAvatar
                  role="father"
                  birthYear={input.fatherBirthYear}
                  name="Bố"
                  size={52}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    Với bố · {result.father.currentAge} tuổi
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-ink-2">
                    «Đủ để trân trọng từng lần về nhà với bố.»
                  </p>
                </div>
                <p className="ml-auto shrink-0 text-right">
                  <span className="font-display text-[42px] leading-none font-extrabold text-ink">
                    {nf.format(result.father.tetsLeft)}
                  </span>
                  <span className="mt-1 block text-[11.5px] font-semibold text-muted">
                    cái Tết nữa (ước tính)
                  </span>
                </p>
              </div>
            )}
            {result.mother && (
              <div className="flex items-center gap-3.5 py-4">
                <ProfileAvatar
                  role="mother"
                  birthYear={input.motherBirthYear}
                  name="Mẹ"
                  size={52}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    Với mẹ · {result.mother.currentAge} tuổi
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-ink-2">
                    «Đủ để ngồi lâu hơn bên mâm cơm với mẹ.»
                  </p>
                </div>
                <p className="ml-auto shrink-0 text-right">
                  <span className="font-display text-[42px] leading-none font-extrabold text-ink">
                    {nf.format(result.mother.tetsLeft)}
                  </span>
                  <span className="mt-1 block text-[11.5px] font-semibold text-muted">
                    cái Tết nữa (ước tính)
                  </span>
                </p>
              </div>
            )}
            {!result.father && !result.mother && result.life && (
              <p className="py-4 text-sm leading-relaxed text-ink-2">
                Cuộc đời bạn đã đi qua{' '}
                <strong className="text-ink">{fmt1(result.life.percentLived)}%</strong> theo kỳ vọng
                thống kê ({nf.format(result.life.weeksLived)} / {nf.format(result.life.totalWeeks)}{' '}
                tuần).
              </p>
            )}
          </div>
          {cardUrl && (
            <button
              type="button"
              onClick={() => setShowFullCard(true)}
              className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-line-control bg-card px-5 py-3 text-[15px] font-bold text-ink transition-colors hover:border-brand"
            >
              Xem thẻ đầy đủ
            </button>
          )}
          <p className="mt-3 text-center text-[12.5px] text-muted">
            Ảnh tải về có kích thước 1080 × 1350.
          </p>
        </div>

        {/* Desktop: xem trước thẻ thật (canvas 1080×1350 thu nhỏ) —
            tỉ lệ 1080×1350 khoá cứng bằng aspect + object-contain
            (H4 vòng 4): không kéo giãn ngang/dọc ở bất kỳ khổ nào. */}
        <div className="hidden lg:block">
          {cardUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cardUrl}
              width={1080}
              height={1350}
              alt="Thẻ kết quả Còn Mấy Cái Tết Nữa?"
              className="mx-auto aspect-[1080/1350] w-full max-w-[460px] rounded-[24px] border border-line bg-card object-contain shadow-[var(--shadow-card-lg)]"
            />
          )}
          <p className="mt-3 text-center text-[12.5px] text-muted">
            Xem trước thẻ kết quả — ảnh tải về có kích thước 1080 × 1350.
          </p>
        </div>

        {/* Cột phải: G4c vòng 3 đặt khối TÓM TẮT KẾT QUẢ ở đây —
            VÒNG 4 (H5) BỎ khối tóm tắt đó (nó TRÙNG nội dung với
            chính bản xem trước thẻ ở cột trái trên cùng màn hình,
            2 ghế panel vòng 3 bắt lỗi) và chuyển 2 khối disclosure
            CÓ SẴN «Cách tính» + «Hỏi đáp» vào dưới cụm hành động:
            nội dung thật cân chiều cao cột phải với bản xem trước,
            mỗi thông tin chỉ xuất hiện 1 lần trên màn. Mobile giữ
            nguyên khối tóm tắt native ở đầu cảnh. Cả cột sticky
            như cũ. */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-5">
          <div className="rounded-[20px] border border-line bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-[25px] leading-tight font-extrabold text-ink">
              Gửi cho người thân
            </h2>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onCopy}
                className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-brand px-5 py-3 text-base font-bold text-white transition-colors hover:bg-brand-strong"
              >
                <IconCopy size={16} aria-hidden /> {copied ? 'Đã sao chép!' : 'Copy kết quả'}
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] border border-line-control bg-card px-5 py-3 text-base font-bold text-ink transition-colors hover:border-brand"
              >
                <IconDownload size={16} aria-hidden /> Tải ảnh thẻ kết quả
              </button>
              {deletePhase === 'idle' && (
                <button
                  type="button"
                  ref={resetButtonRef}
                  onClick={onRequestReset}
                  className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-card px-5 py-3 text-base font-semibold text-ink-2 transition-colors hover:border-brand"
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
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 font-semibold text-brand-strong"
                >
                  <IconArrowUp size={14} aria-hidden /> Sửa lại
                </button>
              </p>
            )}
          </div>

          {/* Hai khối disclosure CÓ SẴN chuyển vào cột phải (H5
              vòng 4): «Cách tính» + «Hỏi đáp» dưới cụm hành động —
              thay khối tóm tắt desktop đã bỏ vì trùng nội dung với
              bản xem trước thẻ. Tầng dưới trang lúc này chỉ còn
              «Quyền riêng tư» (xem cuối ConMayTetTool). */}
          <CalcFaqDisclosures />
        </div>
      </div>

      {/* Lớp xem thẻ đầy đủ (F5): thẻ 1080×1350 ở bề ngang đọc được,
          cuộn dọc trong lớp phủ; Esc hoặc «Đóng» để thoát. H4 vòng
          4: ảnh trong modal khoá ĐÚNG tỉ lệ 1080×1350 bằng khung
          aspect + object-contain (vòng 3 bị ghế 5 bắt lỗi bóp méo
          tỉ lệ) — cấm kéo giãn ngang/dọc trong mọi điều kiện. */}
      {showFullCard && cardUrl && (
        <div
          className="fixed inset-0 z-40 overflow-y-auto bg-neutral-100/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Thẻ kết quả đầy đủ"
        >
          <div className="mx-auto w-full max-w-[430px]">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                ref={closeCardRef}
                onClick={() => setShowFullCard(false)}
                className="flex min-h-11 items-center rounded-xl border border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[var(--shadow-card)]"
              >
                Đóng
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardUrl}
              width={1080}
              height={1350}
              alt="Thẻ kết quả Còn Mấy Cái Tết Nữa?"
              className="aspect-[1080/1350] w-full rounded-[20px] border border-line bg-card object-contain shadow-[var(--shadow-card-lg)]"
            />
          </div>
        </div>
      )}

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
                className="flex min-h-11 items-center rounded-xl bg-error-solid px-4 py-2 text-sm font-semibold text-white"
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
        </div>
      )}

      {/* Pha 'deleted' không render ở đây: ShareScene bị unmount
          ngay khi xoá (cổng hasAnyResult) — thanh «Đã xoá — Hoàn
          tác» sống ở component cha (TC-1). */}
    </section>
  );
}
