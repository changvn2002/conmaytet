import { expect, test } from './fixtures';
import { fillPanelForm, readStoredInput } from './helpers';

/**
 * V122 — S-NEW-1 (ghế 2, panel v1.2.1): dialog xác nhận xoá khai
 * aria-modal="true" nhưng v1.2.1 không chứa được focus — Tab thoát
 * ra nền ngay phím đầu tiên (24/24 lần đo của ghế) và Enter kích
 * hoạt được <details> nền trong lúc dialog còn mở.
 *
 * Test này dùng Tab THẬT (page.keyboard) theo đúng phương pháp tái
 * lập của ghế 2: sau khi dialog mở, focus không được rời dialog ở
 * bất kỳ vòng Tab/Shift+Tab nào, không tới được SUMMARY nền, và
 * Esc vẫn đóng theo nhánh an toàn với storage byte-equal.
 */

const inDialog = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));

test.describe('V122 — focus trap của dialog xác nhận xoá (S-NEW-1)', () => {
  test('Tab/Shift+Tab vòng trong dialog, không kích hoạt được nền, Esc byte-equal', async ({
    page,
  }) => {
    await fillPanelForm(page);
    const before = await readStoredInput(page);
    expect(before).toBeTruthy();

    const resetButton = page.getByRole('button', { name: /Làm lại từ đầu/ });
    await resetButton.scrollIntoViewIfNeeded();
    await resetButton.click();
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible();
    // Focus mở giữ nguyên như v1.2.1: nút an toàn «Giữ lại».
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''))
      .toBe('Giữ lại');

    // 24 vòng Tab: focus phải ở trong dialog sau MỌI phím bấm.
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      expect(await inDialog(page), `Tab #${i + 1} thoát dialog`).toBe(true);
    }
    // 6 vòng Shift+Tab: tương tự.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await inDialog(page), `Shift+Tab #${i + 1} thoát dialog`).toBe(true);
    }

    // Không tới được SUMMARY nền bằng Tab (ghế 2 tới được và Enter
    // mở <details> khi dialog còn mở): mọi <details> phải còn đóng
    // và dialog còn mở sau toàn bộ chuỗi Tab ở trên.
    const detailsOpen = await page.evaluate(() =>
      [...document.querySelectorAll('details')].map((d) => d.open),
    );
    expect(detailsOpen).toEqual([false, false, false]);
    await expect(dialog).toBeVisible();

    // Esc vẫn là nhánh an toàn «Giữ lại»: đóng dialog, focus về nút
    // mở, storage byte-equal.
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''))
      .toContain('Làm lại từ đầu');
    expect(await readStoredInput(page)).toBe(before);
  });
});
