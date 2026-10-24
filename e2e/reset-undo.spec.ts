import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { fillPanelForm, PANEL_INPUT, readStoredInput } from './helpers';

/** Mở luồng xoá từ Cảnh 4 và bấm xác nhận «Xoá». Trả về mốc giờ bắt đầu xoá. */
async function deleteAll(page: Page): Promise<number> {
  const resetButton = page.getByRole('button', { name: /Làm lại từ đầu/ });
  await resetButton.scrollIntoViewIfNeeded();
  await resetButton.click();
  // Khối xác nhận tại chỗ: nút an toàn «Giữ lại» nhận focus mặc định.
  const confirmDelete = page.getByRole('button', { name: 'Xoá', exact: true });
  await expect(confirmDelete).toBeVisible();
  const startedAt = Date.now();
  await confirmDelete.click();
  const bar = page.getByRole('status').filter({ hasText: 'Đã xoá.' });
  await expect(bar).toBeVisible();
  return startedAt;
}

async function waitUntilElapsed(startedAt: number, targetMs: number) {
  const remaining = targetMs - (Date.now() - startedAt);
  if (remaining > 0) {
    // Chờ đồng hồ thật — cửa sổ hoàn tác 8 giây của app chạy bằng timer thật.
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

test.describe('CQ-08 (2) — xoá + hoàn tác trong cửa sổ 8 giây + nhánh hết hạn (OBS-A)', () => {
  test('hoàn tác ở ~7,4s khôi phục localStorage byte-equal; hết hạn >8,5s thanh biến mất và focus về #birth-day', async ({
    page,
  }) => {
    await fillPanelForm(page);
    const before = await readStoredInput(page);
    expect(before).toBeTruthy();
    expect(before).toContain(PANEL_INPUT.birth);

    // ── Nhánh 1: bấm «Hoàn tác» ở ~7,3–7,5s ──────────────────────────
    const startedAt = await deleteAll(page);
    const bar = page.getByRole('status').filter({ hasText: 'Đã xoá.' });
    // Focus sau khi xoá phải nằm ở nút «Hoàn tác» (§8 Panel #02).
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''))
      .toContain('Hoàn tác');

    await waitUntilElapsed(startedAt, 7_400);
    await page.getByRole('button', { name: 'Hoàn tác', exact: true }).click();
    await expect(bar).toHaveCount(0);

    const after = await readStoredInput(page);
    // Byte-equal: chuỗi JSON trong localStorage trước xoá === sau hoàn tác.
    expect(after).toBe(before);
    // F1 vòng 2: giá trị ngày sinh khẳng định qua 3 đoạn DD/MM/YYYY.
    await expect(page.locator('#birth-day')).toHaveValue('15');
    await expect(page.locator('#birth-month')).toHaveValue('06');
    await expect(page.locator('#birth-year')).toHaveValue('1995');
    await expect(page.locator('#father-year')).toHaveValue(PANEL_INPUT.fatherYear);
    await expect(page.locator('#mother-year')).toHaveValue(PANEL_INPUT.motherYear);

    // ── Nhánh 2: hết hạn — chờ >8,5s, thanh biến mất ──────────────────
    const startedAt2 = await deleteAll(page);
    const bar2 = page.getByRole('status').filter({ hasText: 'Đã xoá.' });
    await expect(bar2).toBeVisible();
    // Giữ focus ở nút «Hoàn tác» trong suốt cửa sổ (không bấm, không Tab đi).
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''))
      .toContain('Hoàn tác');

    await waitUntilElapsed(startedAt2, 8_600);
    await expect(bar2).toHaveCount(0);
    // OBS-A (Panel #02 §8.1): focus đang trong thanh khi hết hạn →
    // trường ngày sinh đầu tiên (#birth-day của nhóm #birth, F1 vòng 2).
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''))
      .toBe('birth-day');
  });
});
