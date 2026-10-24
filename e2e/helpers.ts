import { expect, type Page } from '@playwright/test';

/** Dữ liệu panel chuẩn (Panel #02 / STATE): dùng chung cho mọi spec. */
export const PANEL_INPUT = {
  birth: '1995-06-15',
  fatherYear: '1965',
  motherYear: '1968',
} as const;

export const HOPE_FATHER = 'Đủ để trân trọng từng lần về nhà với bố.';
export const HOPE_MOTHER = 'Đủ để ngồi lâu hơn bên mâm cơm với mẹ.';
export const STORAGE_KEY = 'conmaytet:input:v1';

/**
 * Điền form đầy đủ ở Cảnh 1 và chờ sân khấu số xuất hiện.
 * Số lần về thăm: giá trị mặc định của form là 2 lần/năm — đúng dữ liệu
 * panel — nên chỉ khẳng định nhãn hiện tại thay vì kéo slider.
 */
export async function fillPanelForm(page: Page) {
  await page.goto('/');
  // F1 vòng 2: ngày sinh nhập qua 3 đoạn DD/MM/YYYY (hợp thành đúng
  // PANEL_INPUT.birth dạng ISO trong storage như trước).
  await page.locator('#birth-day').fill('15');
  await page.locator('#birth-month').fill('06');
  await page.locator('#birth-year').fill('1995');
  await page.getByRole('radio', { name: 'Nam', exact: true }).click();
  await page.locator('#father-year').fill(PANEL_INPUT.fatherYear);
  await page.locator('#mother-year').fill(PANEL_INPUT.motherYear);
  await expect(page.getByText('2 lần/năm', { exact: true })).toBeVisible();
  const fatherStage = page.locator('section[aria-label="Kết quả với bố"]');
  await expect(fatherStage).toBeAttached();
  await expect(page.locator('section[aria-label="Kết quả với mẹ"]')).toBeAttached();
  // Chờ effect lưu localStorage chạy xong sau lần nhập cuối.
  await expect
    .poll(async () => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))
    .toContain(PANEL_INPUT.fatherYear);
}

export async function readStoredInput(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}
