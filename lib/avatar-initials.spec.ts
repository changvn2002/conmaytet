import { describe, expect, it } from 'vitest';
import { initialsForName } from './avatar-initials';

/**
 * Cổng X1 (INTERFACE-SPEC §6): initials tên Việt thật — ký tự chính =
 * chữ cái đầu của TỪ CUỐI (tên gọi), NFC-normalize trước khi lấy.
 */
describe('X1 — initialsForName', () => {
  it('Nguyễn Văn An → A (tên gọi, không phải họ)', () => {
    expect(initialsForName('Nguyễn Văn An')).toBe('A');
  });
  it('Trần Thị Bích Ngọc → N (4 từ)', () => {
    expect(initialsForName('Trần Thị Bích Ngọc')).toBe('N');
  });
  it('Phạm Hùng → H (2 từ)', () => {
    expect(initialsForName('Phạm Hùng')).toBe('H');
  });
  it('Đỗ Thị Thu Hằng → H', () => {
    expect(initialsForName('Đỗ Thị Thu Hằng')).toBe('H');
  });
  it('An → A (tên 1 từ → 1 ký tự)', () => {
    expect(initialsForName('An')).toBe('A');
  });
  it('dạng NFD của «Ngọc» → N (NFC-normalize trước)', () => {
    const nfd = 'Ngọc'.normalize('NFD');
    expect(initialsForName(`Trần ${nfd}`)).toBe('N');
    expect(initialsForName(nfd)).toBe('N');
  });
  it('nhãn vai: Bố → B · Mẹ → M · Bạn → B', () => {
    expect(initialsForName('Bố')).toBe('B');
    expect(initialsForName('Mẹ')).toBe('M');
    expect(initialsForName('Bạn')).toBe('B');
  });
  it('khoảng trắng thừa / chữ thường vẫn cho glyph uppercase của từ cuối', () => {
    expect(initialsForName('  nguyễn văn  an ')).toBe('A');
  });
  it('chuỗi rỗng → rỗng', () => {
    expect(initialsForName('')).toBe('');
    expect(initialsForName('   ')).toBe('');
  });
});
