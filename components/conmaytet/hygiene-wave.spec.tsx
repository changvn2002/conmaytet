// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConMayTetTool } from './app';
import { DisclosureSections } from './disclosure';

/**
 * Hygiene wave — nghiệm thu Panel #02 §8 cho các mục polish của W2:
 *  - OBS-A (MINOR): khi cửa sổ hoàn tác 8 giây HẾT HẠN, nếu focus đang
 *    nằm trong thanh «Đã xoá» (nút «Hoàn tác») thì focus phải chuyển
 *    về ô #birth (thanh unmount không được thả focus về BODY); nếu
 *    người dùng đã tự di chuyển focus đi nơi khác trong cửa sổ thì
 *    KHÔNG giành lại focus.
 *  - Cửa sổ vẫn đúng 8 giây ±0,5 (đồng hồ trong trang = fake timers):
 *    bấm «Hoàn tác» ở ~7,4 giây vẫn khôi phục nguyên vẹn như §8 cũ.
 *
 * Bộ dữ liệu = bộ chuẩn của panel: sinh 15/06/1995, Nam, bố 1965,
 * mẹ 1968, về thăm 2 lần/năm.
 */

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

function stageSummary(): string {
  return (
    [...document.querySelectorAll('[aria-live="polite"]')]
      .map((el) => el.textContent ?? '')
      .find((t) => t.includes('cái Tết')) ?? ''
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

describe('OBS-A — focus khi cửa sổ hoàn tác hết hạn (Panel #02 §8.1)', () => {
  it('Hết hạn khi focus đang ở nút Hoàn tác → focus chuyển về #birth, không rơi BODY', () => {
    seedAndRender();
    openConfirmAndDelete();

    const undo = screen.getByRole('button', { name: 'Hoàn tác' });
    expect(document.activeElement).toBe(undo);

    advance(8000);

    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    expect(document.activeElement).toBe(birthInput());
    expect(document.activeElement).not.toBe(document.body);
  });

  it('Hết hạn khi người dùng đã tự chuyển focus sang ô khác → focus không đổi', () => {
    seedAndRender();
    openConfirmAndDelete();
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeTruthy();

    // Người dùng tự di chuyển focus vào ô năm sinh của bố trong cửa sổ.
    fatherInput().focus();
    expect(document.activeElement).toBe(fatherInput());

    advance(8000);

    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    expect(document.activeElement).toBe(fatherInput());
  });

  it('Cửa sổ vẫn 8 giây ±0,5: Hoàn tác ở ~7,4 giây khôi phục nguyên vẹn', () => {
    seedAndRender();
    const summaryBefore = stageSummary();
    expect(summaryBefore).toContain('cái Tết với bố');
    expect(summaryBefore).toContain('cái Tết với mẹ');

    openConfirmAndDelete();
    advance(7400);

    const undo = screen.getByRole('button', { name: 'Hoàn tác' });
    fireEvent.click(undo);
    advance(1); // timeout 0 của đích focus sau hoàn tác

    expect(fatherInput().value).toBe('1965');
    expect(motherInput().value).toBe('1968');
    expect(birthInput().value).toBe('1995-06-15');
    expect(stageSummary()).toBe(summaryBefore);
    expect(document.activeElement).toBe(birthInput());
  });
});

describe('DATA-01/05 in-app + A11Y-09 (bonus)', () => {
  it('Ô ngày sinh có autoComplete="bday"', () => {
    seedAndRender();
    expect(birthInput().getAttribute('autocomplete')).toBe('bday');
  });

  it('Disclosure «Quyền riêng tư & dữ liệu của bạn» đúng sự thật dữ liệu dùng chung', () => {
    const { container } = render(<DisclosureSections />);
    const headings = container.querySelectorAll('summary > h2');
    expect(headings).toHaveLength(3);
    expect(headings[2].textContent).toContain('Quyền riêng tư & dữ liệu của bạn');

    const text = container.textContent ?? '';
    expect(text).toContain('localStorage');
    expect(text).toContain('conmaytet:input:v1');
    expect(text).toContain('không có tài khoản');
    expect(text).toContain('không gắn công cụ theo dõi');
    expect(text).toContain('Hoàn tác');
    const link = container.querySelector(
      'a[href="https://github.com/changvn2002/conmaytet/issues"]',
    );
    expect(link).not.toBeNull();
  });
});
