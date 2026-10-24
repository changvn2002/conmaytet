// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConMayTetTool } from './app';
import { DisclosureSections } from './disclosure';

/**
 * Nghiệm thu luồng «Làm lại từ đầu» theo điều kiện chấm lại §8 của
 * Panel conmaytet #01 (TC-1 + cụm C1):
 *  (1) sau «Xoá», dòng «Đã xoá — [Hoàn tác]» có mặt trong DOM ngay
 *      (t≈0 ≤ 1 giây) kèm role=status chứa thông báo đã xoá;
 *  (2) «Hoàn tác» còn bấm được tới 7,5 giây và biến mất ở 8 giây
 *      (cửa sổ 8 ± 0,5 giây);
 *  (3) «Hoàn tác» khôi phục nguyên vẹn mọi trường + số sân khấu;
 *  (4) focus không rơi về BODY ở cả 3 lối ra (Xoá / Giữ lại / Esc).
 *
 * Gốc rễ TC-1 mà bộ test này khoá lại: khối «Đã xoá» từng nằm trong
 * ShareScene — component bị cổng hasAnyResult unmount ngay trong
 * commit xoá — nên không bao giờ render. Thanh trạng thái nay sống ở
 * component cha, chỉ phụ thuộc deletePhase.
 *
 * Bộ dữ liệu = bộ chuẩn của panel: sinh 15/06/1995, Nam, bố 1965,
 * mẹ 1968, về thăm 2 lần/năm (panel đo trên live: bố 16 Tết/~32 lần
 * gặp, mẹ 24/~47 — test này khẳng định tính NGUYÊN VẸN khôi phục so
 * với trạng thái trước xoá, không phụ thuộc ngày chạy).
 */

// Render toàn bộ ConMayTetTool qua jsdom rất nặng; khi sandbox bão hoà
// (nhiều lane chạy song song) hai test đầu từng vượt timeout mặc định
// 5s dù assertion đều đồng bộ theo fake-timer. Nới timeout tường cho
// riêng file này — ngữ nghĩa thời gian của §8 đo bằng fake-timer nên
// không bị ảnh hưởng.
vi.setConfig({ testTimeout: 30_000 });

const STORAGE_KEY = 'conmaytet:input:v1';
const PANEL_INPUT = {
  myBirthDate: '1995-06-15',
  mySex: 'male',
  fatherBirthYear: 1965,
  motherBirthYear: 1968,
  visitsPerYear: 2,
  livesWithParents: false,
};

function seedAndRender() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(PANEL_INPUT));
  return render(<ConMayTetTool />);
}

const birthInput = () => document.getElementById('birth') as HTMLInputElement;
const fatherInput = () => document.getElementById('father-year') as HTMLInputElement;
const motherInput = () => document.getElementById('mother-year') as HTMLInputElement;

/** Văn bản tóm tắt sân khấu (vùng aria-live ở Cảnh 2). */
function stageSummary(): string {
  return (
    [...document.querySelectorAll('[aria-live="polite"]')]
      .map((el) => el.textContent ?? '')
      .find((t) => t.includes('cái Tết')) ?? ''
  );
}

/** Live region chứa thông báo đã xoá (OfflineBar cũng là role=status
 * nên phải lọc theo nội dung). */
function deletedStatus(): Element | null {
  return (
    [...document.querySelectorAll('[role="status"]')].find((el) =>
      (el.textContent ?? '').includes('Đã xoá'),
    ) ?? null
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function openConfirmAndDelete() {
  fireEvent.click(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('TC-1 — hoàn tác 8 giây sau xoá', () => {
  it('«Đã xoá — [Hoàn tác]» xuất hiện ngay sau Xoá, có role=status, focus vào Hoàn tác', () => {
    seedAndRender();
    openConfirmAndDelete();

    // t ≈ 0 ms sau cú bấm (chưa advance timer nào) — đạt điều kiện ≤ 1 giây.
    const undo = screen.getByRole('button', { name: 'Hoàn tác' });
    expect(undo).toBeTruthy();
    expect(deletedStatus()).not.toBeNull();
    expect(deletedStatus()?.textContent).toContain('Đã xoá');
    // Focus không rơi về BODY — nằm ngay trên nút Hoàn tác (§8.4).
    expect(document.activeElement).toBe(undo);
    // Form đã rỗng.
    expect(birthInput().value).toBe('');
    expect(fatherInput().value).toBe('');
  });

  it('Hoàn tác còn bấm được ở 7,5s và khôi phục nguyên vẹn trường + số sân khấu', () => {
    seedAndRender();
    const summaryBefore = stageSummary();
    expect(summaryBefore).toContain('cái Tết với bố');
    expect(summaryBefore).toContain('cái Tết với mẹ');

    openConfirmAndDelete();
    expect(stageSummary()).toBe('');

    advance(7500);
    const undo = screen.getByRole('button', { name: 'Hoàn tác' });
    fireEvent.click(undo);
    advance(1); // timeout 0 của đích focus

    expect(fatherInput().value).toBe('1965');
    expect(motherInput().value).toBe('1968');
    expect(birthInput().value).toBe('1995-06-15');
    expect(stageSummary()).toBe(summaryBefore);
    // Sau hoàn tác focus về trường đầu tiên, không phải BODY.
    expect(document.activeElement).toBe(birthInput());
  });

  it('Hết 8 giây: thanh hoàn tác biến mất, dữ liệu vẫn rỗng', () => {
    seedAndRender();
    openConfirmAndDelete();
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeTruthy();

    advance(8000);
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    expect(deletedStatus()).toBeNull();
    expect(birthInput().value).toBe('');
  });

  it('Nhập dữ liệu mới trong cửa sổ hoàn tác thì huỷ snapshot ngay', () => {
    seedAndRender();
    openConfirmAndDelete();
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeTruthy();

    fireEvent.change(fatherInput(), { target: { value: '1970' } });
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    expect(fatherInput().value).toBe('1970');
  });
});

describe('Cụm C1 — focus ở các lối ra còn lại', () => {
  it('Mở xác nhận: focus vào «Giữ lại»; bấm Giữ lại: dữ liệu nguyên vẹn, focus về «Làm lại từ đầu»', () => {
    seedAndRender();
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại từ đầu' }));

    const keep = screen.getByRole('button', { name: 'Giữ lại' });
    expect(document.activeElement).toBe(keep);

    fireEvent.click(keep);
    advance(1);
    expect(fatherInput().value).toBe('1965');
    expect(birthInput().value).toBe('1995-06-15');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
  });

  it('Esc đóng khối xác nhận theo nhánh Giữ lại', () => {
    seedAndRender();
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
    expect(screen.getByRole('button', { name: 'Giữ lại' })).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    advance(1);
    expect(screen.queryByRole('button', { name: 'Giữ lại' })).toBeNull();
    expect(fatherInput().value).toBe('1965');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
  });
});

describe('Gói kèm Panel #01 — TC-3 + aria ô lỗi', () => {
  it('TC-3: chip giới tính chưa chọn dùng border-line-control (Gray 70), không còn border-line (Gray 30)', () => {
    seedAndRender();
    // Dữ liệu nạp sẵn: Nam đã chọn; Nữ/Không chọn là chip chưa chọn.
    const unselected = screen.getByRole('radio', { name: 'Nữ' });
    expect(unselected.className).toContain('border-line-control');
    expect(unselected.className.split(/\s+/)).not.toContain('border-line');
  });

  it('Ô lỗi mang aria-invalid + aria-describedby trỏ đúng khối thông báo', () => {
    seedAndRender();
    fireEvent.change(birthInput(), { target: { value: '2999-01-01' } });

    expect(birthInput().getAttribute('aria-invalid')).toBe('true');
    expect(birthInput().getAttribute('aria-describedby')).toBe('notices-self');
    const notices = document.getElementById('notices-self');
    expect(notices).not.toBeNull();
    expect(notices?.querySelector('[role="alert"]')).not.toBeNull();
  });
});

describe('TC-2 — cây heading của tầng disclosure', () => {
  it('Các tiêu đề disclosure là H2 nằm trong summary; FAQ là H3 bên dưới H2', () => {
    const { container } = render(<DisclosureSections />);
    const headings = container.querySelectorAll('summary > h2');
    // Hygiene wave: thêm mục thứ ba «Quyền riêng tư & dữ liệu của bạn»
    // (DATA-01/05 in-app) theo đúng pattern H2-trong-summary — cây
    // heading giữ nguyên kỷ luật, chỉ tăng số mục 2 → 3.
    expect(headings).toHaveLength(3);
    expect(headings[0].textContent).toContain('Cách tính');
    expect(headings[1].textContent).toContain('Hỏi đáp');
    expect(headings[2].textContent).toContain('Quyền riêng tư');
    expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);
    // Vùng chạm 44px của panel khai trên chính summary (H2 để inline
    // để ::marker không bị flex/block đẩy khỏi dòng trong Chrome).
    for (const s of container.querySelectorAll('summary')) {
      expect(s.className).toContain('min-h-11');
    }
  });
});
